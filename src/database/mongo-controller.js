const { MongoClient } = require('mongodb');

module.exports = class MongoController {
  constructor() {
    this.uri = `mongodb+srv://${process.env.MONGO_USERNAME}:${process.env.MONGO_PASSWORD}@cluster0.7qtwh.mongodb.net/${process.env.MONGO_DATABASE}?retryWrites=true&w=majority`;

    this.client = new MongoClient(this.uri);
    this.database = null;
  }

  async create() {
    try {
      await this.client.connect();
      await this.client.db('admin').command({ ping: 1 });
      this.database = this.client.db(process.env.MONGO_DATABASE);
      console.log('Connected to MongoDB');
    } catch (err) {
      console.log(err);
    }
  }

  async insertNewWebhook(guildId, channelId) {
    console.log('Inserting new webhook row', guildId, channelId);

    try {
      const data = { guildId, channelId, isActive: false };
      const webhooks = this.database.collection('webhooks');

      await webhooks.insertOne(data);
    } catch (err) {
      console.log(err.message);
    }
  }

  async insertNewSecret(guildId, secret) {
    console.log('Inserting new webhook secret row', guildId, secret);

    try {
      const data = { guildId, secret };
      const webhookSecrets = this.database.collection('webhookSecrets');

      await webhookSecrets.insertOne(data);
    } catch (err) {
      console.log(err.message);
    }
  }

  async setWebhookActive(isActive, guildId) {
    console.log('Updating webhook active row', isActive, guildId);

    try {
      const filter = { guildId };

      const updateDocument = {
        $set: {
          isActive,
        },
      };

      const webhooks = this.database.collection('webhooks');
      await webhooks.updateOne(filter, updateDocument);
    } catch (err) {
      console.log(err.message);
    }
  }

  async getChannelIdForGuildId(guildId) {
    console.log('Getting channel id for guild', guildId);

    try {
      const webhooks = this.database.collection('webhooks');
      const results = await webhooks.findOne({
        guildId,
      });

      return results?.channelId;
    } catch (err) {
      console.log(err.message);
    }
  }

  async isGuildAlreadySetup(guildId) {
    console.log('Checking if guild is already setup', guildId);
    const results = await this.getChannelIdForGuildId(guildId);

    return results !== undefined;
  }

  async isWebhookAlreadyActive(guildId) {
    console.log('Checking if webhook is already active', guildId);
    const results = await this.getChannelIdForGuildId(guildId);

    return results?.isActive;
  }

  async getGuildInfoForSecretKey(secret) {
    console.log('Getting guild info for secret', secret);

    try {
      const webhookSecrets = this.database.collection('webhookSecrets');
      const secretResult = await webhookSecrets.findOne({
        secret,
      });

      if (!secretResult) {
        return null;
      }

      const webhooks = this.database.collection('webhooks');
      const webhookResult = await webhooks.findOne({
        guildId: secretResult.guildId
      });

      return webhookResult;
    } catch (err) {

    }
  }
}