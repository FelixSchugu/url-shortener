// Based on this tutorial https://baristure.medium.com/freecodecamp-apis-and-microservices-url-shortener-microservice-720951cb68db

require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const Api = require("./src/api/api-methods");

mongoose
  .connect(
    "insert db direction ",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .catch((err) => handleError(err));

const connect = mongoose.connection;

connect.on("error", console.error.bind(console, "connection error: "));
connect.once("open", () => {
  console.log("Connection succesfully");
});

const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", (req, res) => Api.postUrl(req, res));
app.get("/api/shorturl/:shorturl?", (req, res) => Api.getUrl(req, res));

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
