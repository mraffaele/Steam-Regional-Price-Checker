const MongoClient = require("mongodb").MongoClient;
const Notices = require("../Utils/Notices");
const { Config } = require("../Utils/AppConfig");
const UseCacheDb = Config.USE_CACHE_DB === "true" || false;

class CacheDb {
  constructor(collection) {
    this.collection = collection;
    this.mongoUrl = `mongodb://${Config.MONGO_USERNAME}:${Config.MONGO_PASSWORD}@${Config.MONGO_DOMAIN}:${
      Config.MONGO_PORT
    }/${Config.MONGO_DB}`;
  }

  getDocuments(options) {
    const defaultOpts = {
      filter: {},
      limit: 10,
      sort: {}
    };

    if (!UseCacheDb) {
      return Promise.resolve([]);
    }

    const { filter, sort, limit } = Object.assign(defaultOpts, options);

    return new Promise((resolve, reject) => {
      MongoClient.connect(
        this.mongoUrl,
        { useNewUrlParser: true },
        (err, client) => {
          if (err) {
            return reject(`CacheDB: ${Notices.DBNOCONNECT}`);
          }

          const db = client.db(Config.MONGO_DB);
          const collection = db.collection(this.collection);
          const parsedLimit = parseInt(limit) || 10;
          const docLimit = parsedLimit > 100 ? 100 : parsedLimit;

          collection
            .find(filter || {})
            .sort(sort || {})
            .limit(docLimit)
            .toArray((err, docs) => {
              resolve(docs);
            });
        }
      );
    });
  }

  check(filter) {
    const payload = {
      data: null,
      isExpired: null
    };

    if (!UseCacheDb) {
      console.log(`CacheDB (${this.collection}): Skip`);
      return Promise.resolve({ ...payload, isExpired: true });
    }

    return new Promise((resolve, reject) => {
      MongoClient.connect(
        this.mongoUrl,
        { useNewUrlParser: true },
        (err, client) => {
          if (err) {
            return reject(`CacheDB: ${Notices.DBNOCONNECT}`);
          }

          const db = client.db(Config.MONGO_DB);
          const collection = db.collection(this.collection);

          collection.find(filter).toArray((err, docs) => {
            if (docs.length > 0) {
              const dif = Math.floor(Date.now() / 1000) - docs[0].timestamp;
              payload.data = docs[0];

              if (isNaN(Config.CACHE_TIME)) {
                reject(Notices.CACHEINVALIDTIME);
              }

              if (dif < Config.CACHE_TIME) {
                console.log(`CacheDB (${this.collection}): Serve`);
                payload.isExpired = false;
              } else {
                payload.isExpired = true;
                console.log(`CacheDB (${this.collection}): Expired`);
              }
            } else {
              payload.isExpired = true;
              console.log(`CacheDB (${this.collection}): New Document`);
            }

            resolve(payload);
            client.close();
          });
        }
      );
    });
  }

  save(data, id) {
    if (!UseCacheDb) {
      return;
    }
    const savedData = JSON.parse(JSON.stringify(data)); //CLONE OBJ FOR IMMUTABILITY

    MongoClient.connect(
      this.mongoUrl,
      { useNewUrlParser: true },
      (err, client) => {
        if (err) {
          return reject(`CacheDB: ${Notices.DBNOCONNECT}`);
        }

        const db = client.db(Config.MONGO_DB);
        const collection = db.collection(this.collection);

        if (id) {
          collection.replaceOne({ _id: id }, savedData).then(done => {
            client.close();
          });
        } else {
          collection.insertOne(savedData, {}, () => {
            client.close();
          });
        }
      }
    );
  }

  incrementHits(filter) {
    if (!UseCacheDb) {
      return;
    }

    MongoClient.connect(
      this.mongoUrl,
      { useNewUrlParser: true },
      (err, client) => {
        if (err) {
          return reject(`CacheDB: ${Notices.DBNOCONNECT}`);
        }

        const db = client.db(Config.MONGO_DB);
        const collection = db.collection(this.collection);

        collection.update(filter, { $inc: { hits: 1 } }).then(done => {
          client.close();
        });
      }
    );
  }
}

module.exports = CacheDb;
