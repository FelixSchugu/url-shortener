require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const urlParser = require("url");
const dns = require("dns");

mongoose
  .connect(
    "mongodb+srv://elFelix:Jujuy1030@clusterchuru.v8yea.mongodb.net/ClusterChuru?retryWrites=true&w=majority",
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  )
  .catch((err) => handleError(err));

const Schema = mongoose.Schema;

const webPage = new Schema({
  original_url: { type: String },
  short_url: { type: Number },
});

const Url = mongoose.model("Url", webPage);

console.log(mongoose.connection.readyState);

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
  res.sendFile(process.cwd() + "/views/index.html");
});

app.get("/api/shorturl/:num", async (req, res) => {
  const { num } = req.params;

  if (await Url.exists({ short_url: num })) {
    await Url.find({ short_url: num }, (err, docs) => {
      if (err) return res.json({ error: "Unespected error" });
      const { original_url } = docs[0];
      res.redirect(original_url);
    });
  } else {
    res.json({ error: "Short link not found" });
  }
});

app.get("/api/elem", async (req, res) => {
  let number = 0;
  let size = 0;
  try {
    await Url.find((err, docs) => {
      if (err) return console.log(err);
      size = docs.length;
      res.json({ "Document size": docs.length });
      size = docs.length;
    });
    console.log(size);
  } catch (e) {
    res.json({ error: "Errtor" });
  }
});

app.get("/api/test", (req, res) => {
  res.end();
});

app.post("/api/shorturl", (req, res) => {
  const addNewUrl = async (address) => {
    if (await Url.exists({ original_url: address })) {
      await Url.find({ original_url: address }, (err, docs) => {
        if (err) return res.json({ error: "Impossible to acces to database" });
        const { original_url, short_url } = docs[0];
        return res.json({ original_url: original_url, short_url: short_url });
      });
    } else {
      let num = 0;
      try {
        await Url.find((err, docs) => {
          if (err) return console.log(err);
          num = docs.length + 1;
        });
      } catch (e) {
        return res.json({ Error: "Error" });
      }
      console.log(num);

      const newUrl = new Url({ original_url: address, short_url: num });

      let status = {};
      newUrl.save((err, data) => {
        if (err) {
          status = { error: "The address did not save" };
          console.error(err);
          return res.json(status);
        }
        status = { original_url: address, short_url: num };
        console.log(status);
        return res.json(status);
      });
    }
  };

  const options = {
    family: 6,
    hints: dns.ADDRCONFIG | dns.V4MAPPED,
  };

  // The process begin here
  const reqUrl = req.body.url;
  const validUrl = /^https?:\/\/[\w\-]+(\.[\w\-]+)+[/#?]?.*$/;

  console.log(reqUrl);

  if (!validUrl.test(reqUrl)) return res.json({ Error: "Invalid Url" });

  dns.lookup(
    urlParser.parse(reqUrl).hostname,
    options,
    (err, address, family) => {
      if (err) {
        res.json({ error: "Ivalid url" });
      } else {
        if (address === null) return res.json({ error: "Invalid Url" });
        addNewUrl(reqUrl);
      }
    }
  );
});

app.listen(port, function () {
  console.log(`Listening on port ${port}`);
});
