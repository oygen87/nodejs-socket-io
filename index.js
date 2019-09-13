var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var cors = require("cors");
var fetch = require("node-fetch");

const SERVER_PORT = 4000;

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
  const user = req.body.repo.split("/")[3];
  const repo = req.body.repo.split("/")[4];
  const url = `https://api.github.com/repos/${user}/${repo}/events`;
  fetch(url)
    .then(res => res.json())
    .then(json => res.json(json.map(mapEvents).filter()));
});

const mapEvents = e => {
  return {
    id: e.id,
    actor: e.actor.display_login,
    avatar: e.actor.avatar_url,
    action: e.payload.action ? e.payload.action : null,
    type: e.type.slice(0, -5),
    issue: e.payload.issue ? e.payload.issue.url : null,
    comment: e.payload.comment ? e.payload.comment.url : null,
    pull_request: e.payload.pull_request ? e.payload.pull_request : null,
    created: e.created_at
  };
};

const filterEvents = e => {
  return (
    e.type !== "Watch" &&
    e.type !== "Fork" &&
    e.type !== "Follow" &&
    e.type !== "Download"
  );
};

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

http.listen(SERVER_PORT, function() {
  console.log(`listening on *:${SERVER_PORT}`);
});
