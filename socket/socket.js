const setupSocket = http => {
  const io = require("socket.io")(http);

  const { validatePayload } = require("../utils/utils.js");
  const { insertRecord, findAllFromCollection } = require("../dao/dao.js");

  io.on("connection", function(socket) {
    socket.on("clientMessageEvent", async function(payload) {
      if (validatePayload(payload)) {
        await insertRecord(payload.repo, payload);
        const messages = await findAllFromCollection(payload.repo);
        io.emit(`serverMessageEvent:${payload.repo}`, messages);
      }
    });
  });
};

module.exports = setupSocket;
