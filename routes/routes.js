const express = require("express");
const router = express.Router();
const dotenv = require("dotenv");
const fetch = require("node-fetch");
const { mapEvents, filterEvents } = require("../utils/utils.js");
const { findAllFromCollection } = require("../dao/dao.js");

dotenv.config();

router.post("/messages", async function(req, res) {
  findAllFromCollection(req.body.repo).then(result => {
    res.json({ data: result });
  });
});

router.post("/github-events", function(req, res) {
  if (req.body.repo) {
    const user = req.body.repo.split("/")[3];
    const repo = req.body.repo.split("/")[4];
    const url = `https://api.github.com/repos/${user}/${repo}/events?client_id=${process.env.CLIENT_ID}&client_secret=${process.env.CLIENT_SECRET}`;
    fetch(url)
      .then(res => res.json())
      .then(json => {
        try {
          res.json(json.map(mapEvents).filter(filterEvents));
        } catch (error) {
          res.status(404).send("Repository not found");
        }
      });
  }
});

module.exports = router;
