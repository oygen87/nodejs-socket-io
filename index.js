var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var cors = require("cors");
var fetch = require("node-fetch");
var dotenv = require("dotenv");
const mongo = require("mongodb").MongoClient;

const {
  mapEvents,
  filterEvents,
  validatePayload
} = require("./utils/index.js");

dotenv.config();

app.use(bodyParser.json());
app.use(cors());

const url =
  "mongodb+srv://backendadmin:secretpasswordforbackendadmin@cluster0-f5tzt.mongodb.net/test?retryWrites=true&w=majority";

const settings = {
  useNewUrlParser: true,
  useUnifiedTopology: true
};

const createDatabase = async name => {
  const client = await mongo.connect(url, settings);
  if (!client) return;

  const db = client.db(name);
  console.log(`Database created : ${process.env.DATABASE_NAME}`);
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
    const result = await collection.find({}).toArray();
    return result;
  } catch (err) {
    console.log(err);
  } finally {
    client.close();
  }
};

createDatabase(`${process.env.DATABASE_NAME}`);

app.post("/messages", async function(req, res) {
  findAllFromCollection(req.body.repo).then(result => {
    res.json({ data: result });
  });
});

app.post("/github-events", function(req, res) {
  if (req.body.repo) {
    const user = req.body.repo.split("/")[3];
    const repo = req.body.repo.split("/")[4];
    const url = `https://api.github.com/repos/${user}/${repo}/events?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        try {
          res.json(json.map(mapEvents).filter(filterEvents));
        } catch (error) {
          res.status(404).send("Repository not found");
        }
      });
  }
});

io.on("connection", function(socket) {
  socket.on("clientMessageEvent", async function(payload) {
    if (validatePayload(payload)) {
      await insertRecord(payload.repo, payload);
      const repo = await findAllFromCollection(payload.repo);
      io.emit(`serverMessageEvent:${payload.repo}`, repo);
    }
  });
  socket.on("disconnect", function() {
    // console.log("user disconnected");
  });
});

http.listen(process.env.PORT || 4000, function() {
  console.log(`listening on *:${process.env.PORT}`);
});
