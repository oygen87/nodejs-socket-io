const app = require("express")();
const http = require("http").createServer(app);
const io = require("socket.io")(http);
const bodyParser = require("body-parser");
const cors = require("cors");
const fetch = require("node-fetch");
const dotenv = require("dotenv");

const {
  mapEvents,
  filterEvents,
  validatePayload
} = require("./utils/utils.js");

const {
  createDatabase,
  insertRecord,
  findAllFromCollection
} = require("./dao/dao.js");

dotenv.config();

app.use(bodyParser.json());
app.use(cors());

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
