var app = require("express")();
var http = require("http").createServer(app);
var io = require("socket.io")(http);
var bodyParser = require("body-parser");
var cors = require("cors");

const SERVER_PORT = 4000;

app.use(bodyParser.json());
app.use(cors());

/**
 * in-memory database
 *
 * key: string
 * value: Array<{id?: string, repo: string, message: string, username: string}>
 * 
 * id is added server side
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

io.on("connection", function(socket) {
  socket.on("clientMessageEvent", function(payload) {
    if (validatePayload(payload)) {
      payload.id = (Math.random() * 10) + ""; // generate key
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
