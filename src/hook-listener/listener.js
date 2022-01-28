const express = require('express');
const bodyParser = require('body-parser');
const { webhookPort } = require('../../config.json');

module.exports = class Listener {
  constructor(discordIntegration) {
    this.discordIntegration = discordIntegration;
  }

  listen() {
    this.app = express();

    this.app.use(bodyParser.json());

    this.app.post('/hook', (req, res) => {
      res.status(200).end();
      this.discordIntegration.processReq(req);
    });

    this.app.listen(webhookPort, () => {
      console.log(`🚀 Server running on port ${webhookPort}`)
    });
  }
}