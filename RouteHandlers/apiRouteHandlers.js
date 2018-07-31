const GetSteamApp = require("../Services/GetSteamApp");
const GetRates = require("../Services/GetRates");
const CacheDb = require("../Services/CacheDb");
const Currencies = require("../Config/Currencies");
const ExplodeSteamUrl = require("../Utils/ExplodeSteamUrl");
const PayloadComposer = require("../Utils/PayloadComposer");
const Responder = require("../Utils/Responder");
const Notices = require("../Utils/Notices");
const { Config } = require("../Utils/AppConfig");

const routes = {};

routes.extract = (req, res) => {
  const steamUrlFrags = ExplodeSteamUrl(req.params[0]);
  if (!steamUrlFrags) {
    Responder.stdError(Notices.APPINVALIDURL, res);
  } else {
    Responder.stdSuccess(steamUrlFrags, res);
  }
};

routes.getUrl = (req, res) => {
  const steamUrlFrags = ExplodeSteamUrl(req.params[0]);
  if (!steamUrlFrags) {
    Responder.stdError(Notices.APPINVALIDURL, res);
  } else {
    res.redirect(`/2.0/get/${steamUrlFrags.type}/${steamUrlFrags.id}/`);
  }
};

routes.get = (req, res) => {
  const app = GetSteamApp({ appType: req.params.appType, appId: req.params.appId });
  const rates = () => {
    if (!req.params.currencyCode) {
      return Promise.resolve(null);
    }
    return GetRates(req.params.currencyCode.toLowerCase());
  };

  Promise.all([app, rates()])
    .then(results => {
      let payload = {};

      if (results[1] !== null) {
        payload = PayloadComposer.appWithCurrency(results[0], results[1]);
      } else {
        payload = { ...results[0] };
      }

      Responder.stdSuccess(payload, res);
    })
    .catch(error => Responder.stdError(error, res));
};

routes.popular = (req, res) => {
  const cache = new CacheDb(Config.MONGO_COLLECTION_APPS);
  let limit = parseInt(req.params.limit) || 10;
  let order = -1;

  if (req.params.order) {
    order = req.params.order.toLowerCase() === "asc" ? 1 : -1;
  }

  if (limit > 100) {
    limit = 100;
  }

  const options = {
    limit,
    sort: { hits: order }
  };

  cache
    .getDocuments(options)
    .then(results => Responder.stdSuccess(results, res))
    .catch(error => Responder.stdError(error, res));
};

routes.exchange = (req, res) => {
  if (req.params.currencyCode) {
    GetRates(req.params.currencyCode.toLowerCase())
      .then(results => Responder.stdSuccess(results, res))
      .catch(error => Responder.stdError(error, res));
  } else {
    Responder.stdError(Notices.CURRENCYINVALID, res);
  }
};

routes.listCurrencies = (req, res) => Responder.stdSuccess(Currencies, res);

module.exports = routes;
