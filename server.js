const app = require("./app");
const MongoClient = require("mongodb").MongoClient;
const port = process.env.PORT || 3000;

const server = app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
