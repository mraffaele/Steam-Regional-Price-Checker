# Steam Regional Price Checker API

The Steam Regional Price Checker API is the service powering [Steam Regional Prices](http://steamregionalprices.com) along with a [Chrome Extension](https://chrome.google.com/webstore/detail/steam-all-region-price-ch/mopoebekmlkmahpfjjgibkbnciooimhn) and an [Opera Extension](https://addons.opera.com/en/extensions/details/steam-regional-prices/). Its runs on NodeJS and uses MongoDB for persistence.

It enables you to pass in Steam game details and it will return its cost across multiple regions. Currency conversion is optionally included to convert each region to a unified currency to make it easier to compare. Currently the API provides results for the following regions:

| Country        | Steam Currency |
| -------------- | -------------- |
| Australia      | AUD            |
| United States  | USD            |
| Europe         | EUR            |
| United Kingdom | GPB            |
| Russia         | RUB            |

## Using the API

The API can be found here: `https://api.steamregionalprices.com/[REQUEST]`.

| Request                                        | Description                                                                  | Examples                                                                                                                      |
| ---------------------------------------------- | ---------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `/2.0/get/[appType]/[appId]/[currencyCode(?)]` | App Pricing lookup with optional currency conversion.                        | [1](https://api.steamregionalprices.com/2.0/get/app/678950/aud), [2](https://api.steamregionalprices.com/2.0/get/app/678950/) |
| `/2.0/getUrl/[url]`                            | App Pricing lookup by full url                                               | [1](https://api.steamregionalprices.com/2.0/getUrl/http://store.steampowered.com/app/678950/DRAGON_BALL_FighterZ/)            |
| `/2.0/extract/[url]`                           | Extract the app id and app type from url                                     | [1](https://api.steamregionalprices.com/2.0/extract/http://store.steampowered.com/app/678950/DRAGON_BALL_FighterZ/)           |
| `/2.0/currencies`                              | Currencies available for conversion                                          | [1](https://api.steamregionalprices.com/2.0/currencies)                                                                       |
| `/2.0/exchange/[currencyCode]`                 | List the currency exchange rates for each region                             | [1](https://api.steamregionalprices.com/2.0/exchange/aud)                                                                     |
| `/2.0/popular/[amount?]/[order?]`              | List the most popular queries. Optional amount and sorting. Max 100 records. | [1](https://api.steamregionalprices.com/2.0/popular/5/desc), [2](https://api.steamregionalprices.com/2.0/popular/20/asc)      |

The docs can be found [here](https://api.steamregionalprices.com/docs) in JSON format.

**Note: Game results and currency conversion is cached and is only updated on request every 12 hours at a minimum. If running your own instance, you can change it in your environment variables.**

## Legacy API

While version `2.x.x` is a complete re-write, it is 100% backwards compatible.

However, the legacy endpoints are being deprecated and if you use them you the payload will contain a warning prompting you to upgrade as soon as possible.

## Usage Limits

The requirement for an `api key` has been removed and its now open to anybody to use. However, if it becomes abused, user and usage restrictions will be implemented as it is depending on third party services that we do not wish to spam.

If you want to do anything in bulk, please consider running your own instance (see below) and please ensure results are always cached.

## Running Your Own Instance

### Getting Started

1. Ensure you have NodeJS installed.
2. Check out the repository
3. Install the node modules with `npm install`

### Configuring your environment

Environment vars are used to define the caching server (MongoDB), cache times (in seconds) and whether or not to use sample app and currency data which is useful for development.

A `SAMPLE.env` file is provided. You should copy this and save it as `.env` in the project root with your configuration or add them to your machine environment variables. The following options are required.

| Key                         | Value                        | Description                         |
| --------------------------- | ---------------------------- | ----------------------------------- |
| USE_CACHE_DB                | false                        | Do we cache results in the database |
| CACHE_TIME                  | 43200                        | How long to cache for (in seconds)  |
| MONGO_DB                    | dbname                       | MongoDB connection name             |
| MONGO_DOMAIN                | dbdomain.com                 | MongoDB connection domain           |
| MONGO_OPTS                  | ?retryWrites=true&w=majority | MongoDB connection options          |
| MONGO_USERNAME              | dbusername                   | MongoDB connection username         |
| MONGO_PASSWORD              | dbpass                       | MongoDB connection password         |
| MONGO_COLLECTION_APPS       | apps                         | MongoDB apps collection name        |
| MONGO_COLLECTION_CURRENCIES | currencies                   | MongoDB currency collection name    |
| USE_SAMPLE_DATA             | false                        | Use sample data                     |
| CURRENCY_API_KEY            | XXXXXXXXXXXXXXXXXXXX         | Currency conversion service API KEY |

### Running The App

Run the command `node server.js` to start the server. It is usually running at [http://localhost:3000](http://localhost:3000) but will tell you if the port differs.

If you're doing any development on it, I recommend installing `nodemon` as a global (`npm i nodemon -g`) and running with `nodemon server.js` instead. This will enable auto reboots on change. Also consider using the sample data where possible to keep the load off any third-party services.

## Looking for a hosting partner

Currently this is a service privately hosted and I'm on the lookout for an awesome hosting service, like [DigitalOcean (referral link)](https://m.do.co/c/b241e6fa3487) or Heroku, who would be willing to donate hosting to offset my personal costs and handle more traffic. NodeJS & MongoDB hosting would be required.

## That's it!

Remember we're using third-party services so play nice. Have fun :)
