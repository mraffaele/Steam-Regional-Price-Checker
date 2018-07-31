const Responder = require("../Utils/Responder");

const routes = {};

routes.notFound = (req, res) => {
  Responder.stdError("404: Page Not Found", res);
};

routes.documentation = (req, res) => {
  const routes = [
    {
      desc: "App Pricing lookup with optional currency conversion.",
      path: "/2.0/get/[appType]/[appId]/[currencyCode(?)]",
      example: "/2.0/get/app/678950/",
      example2: "/2.0/get/app/678950/aud"
    },
    {
      desc: "App Pricing lookup by full url",
      path: "/2.0/getUrl/[url]",
      example: "/2.0/getUrl/http://store.steampowered.com/app/678950/DRAGON_BALL_FighterZ/"
    },
    {
      desc: "Extract the app id and app type from url",
      path: "/2.0/extract/[url]",
      example: "/2.0/extract/http://store.steampowered.com/app/678950/DRAGON_BALL_FighterZ/"
    },
    {
      desc: "Currencies available for conversion",
      path: "/2.0/currencies",
      example: "/2.0/currencies"
    },
    {
      desc: "List the currency exchange rates for each region",
      path: "/2.0/exchange/[currencyCode]",
      example: "/2.0/exchange/aud"
    },
    {
      desc: "List the most popular queries. Optional amount and sorting. Max 100 records. ",
      path: "//2.0/popular/[amount?]/[order?]",
      example: "/2.0/popular/10",
      example2: "/2.0/popular/10/asc",
      example: "/2.0/popular/100/desc"
    }
  ];

  Responder.stdSuccess(
    {
      title: "Steam Regional Price Checker",
      version: "2.0.0",
      api: routes
    },
    res
  );
};

module.exports = routes;
