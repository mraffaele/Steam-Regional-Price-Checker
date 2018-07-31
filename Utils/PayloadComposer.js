PayloadComposer = {};

PayloadComposer.appWithCurrency = (app, exchange) => {
  const payload = { ...app };
  payload.exchange = exchange.exchange;

  payload.regions = payload.regions.map(region => {
    const exchangeRegion = exchange.regions.filter(excRegion => excRegion.regionCode === region.regionCode);

    return exchangeRegion.length ? Object.assign(region, exchangeRegion[0]) : region;
  });

  return payload;
};

PayloadComposer.convert20AppTo10App = data => {
  const payload = {};

  payload.results = {
    ID: data.steamId,
    STEAM_ID: data.steamId,
    APP_TYPE: data.appType,
    STEAM_TITLE: data.title,
    STEAM_IMAGE_URL: data.imageUrl,
    STEAM_AU: 0,
    STEAM_US: 0,
    STEAM_UK: 0,
    STEAM_EU1: 0,
    STEAM_EU2: 0,
    STEAM_RU: 0,
    TIMESTAMP: data.timestamp,
    HITS: data.hits,
    HITS_ALL_TIME: data.hits
  };

  if (data.exchange) {
    payload.exchange = {
      CURRENCY: data.exchange.toUpperCase(),
      STEAM_AU: 0,
      STEAM_US: 0,
      STEAM_UK: 0,
      STEAM_EU1: 0,
      STEAM_EU2: 0,
      STEAM_RU: 0
    };

    data.regions.forEach(region => {
      payload.results[`STEAM_${region.regionCode.toUpperCase()}`] = region.price;
      payload.exchange[`STEAM_${region.regionCode.toUpperCase()}`] = (region.price * region.rate).toFixed(2);
    });
  } else {
    data.regions.forEach(region => {
      payload.results[`STEAM_${region.regionCode.toUpperCase()}`] = region.price;
    });
  }

  return payload;
};

PayloadComposer.convert20PopularTo10Popular = data => {
  const payload = { results: {} };

  data.forEach((app, i) => {
    payload.results[`item${i}`] = PayloadComposer.convert20AppTo10App(app).results;
  });

  return payload;
};

module.exports = PayloadComposer;
