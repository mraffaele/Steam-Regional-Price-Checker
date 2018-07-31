const GetSteamApp = require("../Services/GetSteamApp");
const ExplodeSteamUrl = require("../Utils/ExplodeSteamUrl");
const GetRates = require("../Services/GetRates");
const CacheDb = require("../Services/CacheDb");
const Notices = require("../Utils/Notices");
const Responder = require("../Utils/Responder");
const PayloadComposer = require("../Utils/PayloadComposer");
const { Config } = require("../Utils/AppConfig");
const routes = {};

routes.checkPrice = (req, res) => {
  const steamUrlFrags = ExplodeSteamUrl(req.query.app_url);
  const app = GetSteamApp({ appType: steamUrlFrags.type, appId: steamUrlFrags.id });
  const rates = () => {
    if (!req.query.currency) {
      return Promise.resolve(null);
    }
    return GetRates(req.query.currency.toLowerCase());
  };

  Promise.all([app, rates()])
    .then(results => {
      let payload = {};

      if (results[1] !== null) {
        payload = PayloadComposer.appWithCurrency(results[0], results[1]);
      } else {
        payload = { ...results[0] };
      }

      const updatedPayload = PayloadComposer.convert20AppTo10App(payload);
      updatedPayload.warning = Notices.UPGRADE20;
      Responder.stdSuccess(updatedPayload, res);
    })
    .catch(error => Responder.stdError(error, res));
};

routes.mostPopular = (req, res) => {
  const cache = new CacheDb(Config.MONGO_COLLECTION_APPS);
  let limit = parseInt(req.query.limit) || 10;
  let order = -1;

  if (limit > 100) {
    limit = 100;
  }

  const options = {
    limit: limit,
    sort: { hits: order }
  };

  cache
    .getDocuments(options)
    .then(results => {
      const updatedPayload = PayloadComposer.convert20PopularTo10Popular(results);
      updatedPayload.warning = Notices.UPGRADE20;

      Responder.stdSuccess(updatedPayload, res);
    })
    .catch(error => Responder.stdError(error, res));
};

module.exports = routes;
