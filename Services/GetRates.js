const Request = require("superagent").agent();
const Regions = require("../Config/Regions");
const Currencies = require("../Config/Currencies");
const ExchangeModel = require("../Models/ExchangeModel");
const ExchangeRegionModel = require("../Models/ExchangeRegionModel");
const CacheDb = require("../Services/CacheDb");
const Notices = require("../Utils/Notices");
const { Config } = require("../Utils/AppConfig");
const UseSampleData = Config.USE_SAMPLE_DATA === "true" || false;

const GetRates = baseCurrency => {
  const cacheDb = new CacheDb(Config.MONGO_COLLECTION_CURRENCIES);
  return new Promise((resolve, reject) => {
    //Ensure its allowed
    const filtered = Currencies.filter(currency => baseCurrency === currency.toLowerCase());
    if (!filtered.length) {
      return reject(Notices.CURRENCYINVALID);
    }

    cacheDb
      .check({ exchange: baseCurrency })
      .then(cache => {
        if (!cache.isExpired) {
          return resolve(cache.data);
        } else {
          update(baseCurrency)
            .then(payload => {
              const docId = cache.data ? cache.data._id : null;
              cacheDb.save(payload, docId);
              return resolve(payload);
            })
            .catch(err => reject(err));
        }
      })
      .catch(err => reject(err));
  });
};

const fetchRegion = (region, base) => {
  const payload = Object.assign({}, ExchangeRegionModel);
  const query = `${region.currency.toUpperCase()}_${base.toUpperCase()}`;
  payload.baseCurrency = base;
  payload.regionCurrency = region.currency;
  payload.regionCode = region.steamCode;

  return new Promise((resolve, reject) => {
    if (UseSampleData) {
      payload.rate = 1.2;
      return resolve(payload);
    }

    Request.get(`https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=y`).then(
      response => {
        if (response.status !== 200) {
          reject(Notices.RATESFAIL);
        } else {
          payload.rate = JSON.parse(response.text)[query].val;
          resolve(payload);
        }
      },
      error => {
        reject(error);
      }
    );
  });
};

const format = (results, base) => {
  const payload = Object.assign({}, ExchangeModel);
  payload.exchange = base;
  payload.timestamp = Math.floor(Date.now() / 1000);

  payload.regions = Regions.map(region => {
    return results
      .filter(result => {
        return result.regionCode === region.steamCode && result.baseCurrency.toLowerCase() === base.toLowerCase();
      })
      .shift();
  });

  return payload;
};

const update = base => {
  return new Promise((resolve, reject) => {
    const result = Promise.all(
      Regions.map(region => Promise.all(Currencies.map(currency => fetchRegion(region, currency))))
    )
      .then(results => {
        const flattened = [];

        results.forEach(region => {
          region.map(regionResult => {
            flattened.push(regionResult);
          });
        });

        resolve(format(flattened, base));
      })
      .catch(error => {
        reject(Notices.CURRENCYUPDATEFAIL);
      });
  });
};

module.exports = GetRates;
