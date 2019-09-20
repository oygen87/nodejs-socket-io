const mongo = require("mongodb").MongoClient;
const dotenv = require("dotenv");

var exports = (module.exports = {});

dotenv.config();

const url = `${process.env.DATABASE_URL}`;

const settings = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

exports.createDatabase = async name => {
  const client = await mongo.connect(url, settings);
  if (!client) return;

  const db = client.db(name);
  console.log(`Database created : ${process.env.DATABASE_NAME}`);
  client.close();
};

exports.insertRecord = async (collectionName, record) => {
  const client = await mongo.connect(url, settings);

  if (!client) return;

  const db = client.db(`${process.env.DATABASE_NAME}`);
  try {
    const collection = db.collection(collectionName);
    await collection.insertOne(record);
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};

exports.findAllFromCollection = async collectionName => {
  const client = await mongo.connect(url, settings);

  if (!client) return;

  const db = client.db(`${process.env.DATABASE_NAME}`);
  try {
    const collection = db.collection(collectionName);
    const result = await collection.find({}).toArray();
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};
