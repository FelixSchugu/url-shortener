const mongoose = require("mongoose");
const express = require("express");
const shortId = require("shortid");
const validUrl = require("valid-url");
const Url = require("../models/db_model");

const app = express();

const postUrl = async (req, res) => {
  const url = req.body.url;
  const urlCode = shortId.generate();
  console.log(url);

  if (!validUrl.isWebUri(url)) {
    res.json({
     error: 'invalid URL' 
    });
  } else {
    try {
      let findOne = await Url.findOne({
        original_url: url
      });
      if (findOne) {
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        });
      } else {
        findOne = new Url({ original_url: url, short_url: urlCode });
        await findOne.save();
        res.json({
          original_url: findOne.original_url,
          short_url: findOne.short_url
        });
      }
    } catch (e) {
      console.error(e);
      res.status(500).json("Server error");
    }
  }
};

const getUrl = async (req, res) => {
  try {
    const short = req.params.shorturl;
    const urlParams = await Url.findOne({
      short_url: short
    });

    if (urlParams) {
      return res.redirect(urlParams.original_url);
    } else {
      return res.json({ error: 'invalid URL' });
    }
  } catch (e) {
    console.error(e);
    res.status(500).json("Server error");
  }
};

exports.postUrl = postUrl;
exports.getUrl = getUrl;
