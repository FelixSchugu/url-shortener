require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const shortId = require("shortid");
const validUrl = require("valid-url");

mongoose
  .connect(
    "insert db direction here",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .catch((err) => handleError(err));

const Schema = mongoose.Schema;

const urlSchema = new Schema({
  original_url: String,
  short_url: String,
});

const Url = mongoose.model("Url", urlSchema);

const connect = mongoose.connection;

connect.on("error", console.error.bind(console, "connection error: "));
connect.once("open", () => {
  console.log("Connection succesfully");
});

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/new", async (req, res) => {
  const url = req.body.url;
  const urlCode = shortId.generate();
  console.log(url);

  if (!validUrl.isWebUri(url)) {
    res.status(401).json({
      error: "invalid url",
    });
  } else {
    try {
      let findOne = await Url.findOne({
        original_url: url,
      });
      if (findOne) {
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url,
        });
      } else {
        findOne = new Url({ original_url: url, short_url: urlCode });
        await findOne.save();
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url,
        });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json("Server error");
    }
  }
});

app.get("/api/shorturl/:shorturl?", async (req, res) => {
  try {
    const short = req.params.short_url;
    const urlParams = await Url.findOne({
      short_url: short,
    });

    if (urlParams) {
      return res.redirect(urlParams.original_url);
    } else {
      return res.status(404).json("Url not found ");
    }
  } catch (e) {
    console.error(e);
    res.status(500).json("Server error");
  }
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});

