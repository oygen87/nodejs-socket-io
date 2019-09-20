const app = require("express")();
const http = require("http").createServer(app);
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");

const { createDatabase } = require("./dao/dao.js");
const routes = require("./routes/routes.js");
const initializeSocketIO = require("./socket-io/socket-io.js");

dotenv.config();

/**
 *
 * Messages are stored under collections
 * where name is a Github repository url.
 *
 * Schema for messages :
 *
 * id: Number,
 * created: String <YYYY-MM-DDTHH:MM:SSZ>
 * actor: String,
 * action: String,
 * avatar: String,
 * type: String,
 * url: String,
 *
 */

app.use(bodyParser.json());
app.use(cors());

app.use("/", routes);

createDatabase(`${process.env.DATABASE_NAME}`);

initializeSocketIO(http);

http.listen(process.env.PORT || 4000, function() {
  console.log(`listening on *:${process.env.PORT}`);
});
