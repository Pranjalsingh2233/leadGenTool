const express = require("express");
const app = express();
const mongoose = require("mongoose");
const cors = require("cors");
const cookie = require("cookie-parser");
require("dotenv").config();
const routes = require("./routes/index");
const logger = require("./utils/logger");
const expressError = require("./utils/expressError");

main()
  .then(() => logger.info("Connected to DB"))
  .catch((err) => logger.info("Connection to DB failed=>", err));

async function main() {
  await mongoose.connect(process.env.MONGO_URI);
}

app.use(cors());
app.use(cookie());
app.use(express.json());
app.use("/api", routes);

app.get("/", (req, res) => {
  res.send("hello from server");
});

app.use((err, req, res, next) => {
  let { status = 500, message = "SOME ERROR" } = err;
  res.status(status).render("error.ejs", { message });
});

app.listen(process.env.PORT, () =>
  logger.info(`Server listening on port ${process.env.PORT}`),
);
