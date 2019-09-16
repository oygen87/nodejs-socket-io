var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var cors = require("cors");
var fetch = require("node-fetch");
const dotenv = require("dotenv");

var {mapEvents, filterEvents} = require("./utils/index.js");

dotenv.config();

app.use(bodyParser.json());
app.use(cors());

/**
 * in-memory database.
 * 
 * id is appended server side.
 *
 * key: string
 * value: Array<{id?: string, repo: string, message: string, username: string}>
 *
 */
const db = {};

app.post("/messages", function(req, res) {
  if (db[req.body.repo]) {
    res.json({ data: db[req.body.repo] });
  } else {
    db[req.body.repo] = [];
    res.json({ data: db[req.body.repo] });
  }
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
  socket.on("clientMessageEvent", function(payload) {
    if (validatePayload(payload)) {
      payload.id = Math.random() + "";
      if (db[payload.repo]) {
        db[payload.repo].push(payload);
        io.emit(`serverMessageEvent:${payload.repo}`, db[payload.repo]);
      } else {
        db[payload.repo] = [];
        db[payload.repo].push(payload);
        io.emit(`serverMessageEvent:${payload.repo}`, db[payload.repo]);
      }
    }
  });
  socket.on("disconnect", function() {
    // console.log("user disconnected");
  });
});

const validatePayload = payload => {
  return (
    payload.message.trim().length !== 0 &&
    payload.username.trim().length !== 0 &&
    payload.repo.trim().length !== 0
  );
};

http.listen(process.env.SERVER_PORT, function() {
  console.log(`listening on *:${process.env.SERVER_PORT}`);
});
