const Request = require("superagent").agent();
const cheerio = require("cheerio");
const Regions = require("../Config/Regions");
const CacheDb = require("../Services/CacheDb");
const SteamAppModel = require("../Models/SteamAppModel");
const SteamAppRegionModel = require("../Models/SteamAppRegionModel");
const Notices = require("../Utils/Notices");
const { Config } = require("../Utils/AppConfig");
const UseSampleData = Config.USE_SAMPLE_DATA === "true" || false;
const defaultOptions = { appType: "", appId: "" };

const GetSteamApp = options => {
  const cacheDb = new CacheDb(Config.MONGO_COLLECTION_APPS);
  const { appType, appId } = Object.assign(defaultOptions, options);

  return new Promise((resolve, reject) => {
    if (!isAppTypeValid(appType)) {
      return reject(Notices.APPINVALIDTYPE);
    }

    if (!isAppIdValid(appId)) {
      return reject(Notices.APPINVALIDID);
    }

    cacheDb
      .check({ steamId: appId })
      .then(cache => {
        if (cache.isExpired) {
          fetch(appId, appType)
            .then(payload => {
              const docId = cache.data ? cache.data._id : null;

              //Maintain existing hits
              if (cache.data) {
                payload.hits = parseInt(cache.data.hits) + 1;
              }

              cacheDb.save(payload, docId);
              return resolve(payload);
            })
            .catch(err => {
              reject(err);
            });
        } else {
          const payload = { ...cache.data };
          payload.hits = parseInt(payload.hits) + 1;
          cacheDb.incrementHits({ _id: payload._id });
          return resolve(payload);
        }
      })
      .catch(err => {
        return reject(err);
      });
  });
};

const isAppTypeValid = appType => {
  const type = appType.toLowerCase();
  return type === "app" || type === "sub";
};

const isAppIdValid = appId => {
  return !isNaN(appId);
};

const buildAppUrl = (appId, appType) => {
  return `https://store.steampowered.com/${appType}/${appId}/`;
};

const parseResponse = (response, region, appType) => {
  const $ = cheerio.load(response);
  const payload = { ...SteamAppRegionModel };

  //Base Price
  let price = $("div.game_area_purchase_game")
    .eq(0)
    .find("div.game_purchase_price.price");

  //Sale Price
  if (!price.length) {
    price = $("div.game_area_purchase_game")
      .eq(0)
      .find("div.discount_final_price");
  }

  //Clean Price
  const priceClean = price => {
    if (region.code === "ru") {
      return price.replace(new RegExp(/[^0-9]+/g), "");
    } else if (region.currency === "eur") {
      return price.replace(new RegExp(/[^0-9.,]+/g), "").replace(",", ".");
    }
    return price.replace(new RegExp(/[^0-9.,]+/g), "");
  };

  price = priceClean(price.text()) || 0;

  //Image and Title
  let appImage = "";
  let appName = "";

  if (appType === "sub") {
    appImage = $("img.package_header");
    appName = $("h2.pageheader");
  } else {
    appName = $("div.apphub_AppName");
    appImage = $("img.game_header_image_full");
  }

  payload.title = appName.text();
  payload.imageUrl = appImage.attr("src");
  payload.price = price;
  payload.regionCode = region.steamCode;

  return payload;
};

const fetchRegion = (region, appType, appUrl) => {
  return new Promise((resolve, reject) => {
    if (UseSampleData) {
      const fs = require("fs");
      return fs.readFile(`../SampleData/${appType}.html`, (err, data) => {
        if (err) {
          return reject(Notices.SAMPLEDATAFAIL);
        }
        resolve(parseResponse(data, region, appType));
      });
    }
    Request.set("Accept-Language", "en")
      .set("cookie", "birthtime=440000000;lastagecheckage=1-January-1986;mature_content=1")
      .get(`${appUrl}?cc=${region.code}`)
      .then(
        response => {
          //404s redirect to home
          const isHome = response.redirects.filter(item => item.toLowerCase() === "https://store.steampowered.com/");

          if (response.status !== 200 || isHome.length) {
            reject(Notices.STEAMFAIL);
          } else {
            resolve(parseResponse(response.text, region, appType));
          }
        },
        error => {
          reject(`${Notices.STEAMFAIL} [${region.code}]`);
        }
      );
  });
};

const fetch = (appId, appType) => {
  const appUrl = buildAppUrl(appId, appType);

  return new Promise((resolve, reject) => {
    let payload = { ...SteamAppModel };
    payload.steamId = appId;
    payload.appType = appType;
    payload.url = appUrl;
    payload.timestamp = Math.floor(Date.now() / 1000);

    Promise.all(Regions.map(region => fetchRegion(region, appType, appUrl)))
      .then(regions => {
        if (regions.length) {
          payload.regions = regions.map(region => {
            return {
              regionCode: region.regionCode,
              price: region.price
            };
          });
          payload.title = regions[0].title;
          payload.imageUrl = regions[0].imageUrl;

          resolve(payload);
        } else {
          reject(Notices.LOOKUPGENERALFAIL);
        }
      })
      .catch(error => {
        reject(error);
      });
  });
};

module.exports = GetSteamApp;
