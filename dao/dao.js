const mongo = require("mongodb").MongoClient;
const dotenv = require("dotenv");

dotenv.config();

const url = `${process.env.DATABASE_URL}`;

const settings = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const createDatabase = async name => {
  const client = await mongo.connect(url, settings);
  if (!client) return;

  const db = client.db(name);
  console.log(`Database created with name: ${name}`);
  client.close();
};

const insertRecord = async (collectionName, record) => {
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

const findAllFromCollection = async collectionName => {
  const client = await mongo.connect(url, settings);

  if (!client) return;

  const db = client.db(`${process.env.DATABASE_NAME}`);
  try {
    const collection = db.collection(collectionName);
    const result = await collection.find({}).sort({"_id": -1}).limit(100).toArray();
    return result.reverse();
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};

module.exports = {
  createDatabase,
  insertRecord,
  findAllFromCollection
}
