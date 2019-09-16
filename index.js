var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var cors = require("cors");
var fetch = require("node-fetch");
var utils = require("./utils/index.js");
const dotenv = require('dotenv');

dotenv.config();

app.use(bodyParser.json());
app.use(cors());

/**
 * in-memory database
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
  if(req.body.repo) {
    const user = req.body.repo.split("/")[3];
    const repo = req.body.repo.split("/")[4];
    const url = `https://api.github.com/repos/${user}/${repo}/events`;
    fetch(url)
      .then(res => res.json())
      .then(json => res.json(json.map(utils.mapEvents).filter(utils.filterEvents)));
  }
});

io.on("connection", function(socket) {
  socket.on("clientMessageEvent", function(payload) {
    if (validatePayload(payload)) {
      payload.id = Math.random() * 10 + "";
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
