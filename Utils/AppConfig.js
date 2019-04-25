if ((process.env.NODE_ENV || "development") === "development") {
  require("dotenv").config();
}

const userConfig = process.env;
const configItems = [
  "USE_CACHE_DB",
  "CACHE_TIME",
  "MONGO_DB",
  "MONGO_DOMAIN",
  "MONGO_USERNAME",
  "MONGO_PASSWORD",
  "MONGO_PORT",
  "MONGO_COLLECTION_APPS",
  "MONGO_COLLECTION_CURRENCIES",
  "USE_SAMPLE_DATA",
  "CURRENCY_API_KEY"
];
const strippedConfig = {};
const missingConfigItems = configItems.filter(item => {
  if (typeof userConfig[item] === "undefined") {
    return true;
  }

  strippedConfig[item] = userConfig[item];
  return false;
});

module.exports = {
  IsConfigValid: missingConfigItems.length < 1,
  Config: strippedConfig
};
