const express = require("express");
const app = express();
const siteRouteHandlers = require("./RouteHandlers/siteRouteHandlers");
const legacyRouteHandlers = require("./RouteHandlers/legacyRouteHandlers");
const apiRouteHandlers = require("./RouteHandlers/apiRouteHandlers");
const { IsConfigValid } = require("./Utils/AppConfig");
const Responder = require("./Utils/Responder");

if (!IsConfigValid) {
  app.get("*", (req, res) => Responder.stdError("Please check env config.", res));
} else {
  //Home
  app.get("/", siteRouteHandlers.notFound);
  app.get("/docs/", siteRouteHandlers.documentation);

  //Legacy
  app.get("/checkPrice", legacyRouteHandlers.checkPrice);
  app.get("/mostPopular", legacyRouteHandlers.mostPopular);

  //2.0
  app.get("/2.0/get/:appType/:appId?/:currencyCode?", apiRouteHandlers.get);
  app.get("/2.0/getUrl/*", apiRouteHandlers.getUrl);
  app.get("/2.0/extract/*", apiRouteHandlers.extract);
  app.get("/2.0/currencies/", apiRouteHandlers.listCurrencies);
  app.get("/2.0/exchange/:currencyCode?", apiRouteHandlers.exchange);
  app.get("/2.0/popular/:limit?/:order?", apiRouteHandlers.popular);

  //404 Catch All
  app.get("*", siteRouteHandlers.notFound);
}

module.exports = app;
