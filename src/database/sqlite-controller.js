const Database = require('sqlite-async');

module.exports = class SqliteController {
  async create() {
    try {
      this.db = await Database.open('./db/db.db');
      console.log('Database Started');
      await this.createTables();
    } catch (err) {
      console.error(err.message);
    }
  }

  async createTables() {
    try {
      await this.db.exec(`
        CREATE TABLE webhook (
          id integer primary key,
          guild_id text not null,
          channel_id text not null,
          is_active bool not null
        );

        CREATE TABLE webhookSecrets (
          id integer primary key,
          guild_id text not null,
          secret text not null
        );
      `);
    } catch (err) {
      console.log('No need to create tables, they already exist');
    }
  }

  async insertNewWebhook(guildId, channelId) {
    console.log('Inserting new webhook row', guildId, channelId);
    try {
      await this.db.exec(`
        INSERT INTO webhook (guild_id, channel_id, is_active)
        VALUES ('${guildId}', '${channelId}', false);
      `);
    } catch (err) {
      console.log(err);
    }
  }

  async insertNewSecret(guildId, secret) {
    console.log('Inserting new webhook secret row', guildId, secret);

    try {
      await this.db.exec(`
        INSERT INTO webhookSecrets (guild_id, secret)
        VALUES ('${guildId}', '${secret}');
      `);
    } catch (err) {
      console.log(err);
    }
  }

  async setWebhookActive(isActive, guildId) {
    console.log('Updating webhook active row', isActive, guildId);

    try {
      await this.db.exec(`
        UPDATE webhook 
        SET is_active = ${isActive}
        WHERE guild_id = '${guildId}'
      `);
    } catch (err) {
      console.log(err);
    }
  }

  async getChannelIdForGuildId(guildId) {
    try {
      const channelId = await this.db.get(`
        SELECT * FROM webhook WHERE guild_id = '${guildId}'
      `);

      return channelId?.channel_id;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async isGuildAlreadySetup(guildId) {
    try {
      const webhook = await this.db.get(`
        SELECT * FROM webhook WHERE guild_id = '${guildId}'
      `);

      return webhook?.guild_id !== undefined;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async isWebhookAlreadyActive(guildId) {
    try {
      const channelId = await this.db.get(`
        SELECT * FROM webhook WHERE guild_id = '${guildId}'
      `);

      return channelId?.is_active === 1;
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async getGuildInfoForSecretKey(secretKey) {
    try {
      const guildId = await this.db.get(`
        SELECT guild_id FROM webhookSecrets WHERE secret = '${secretKey}'
      `);

      if (!guildId?.guild_id) {
        return null;
      } else {
        const webhook = await this.db.get(`
          SELECT * FROM webhook WHERE guild_id = '${guildId.guild_id}'
        `);

        return { guildId: guildId.guild_id, isActive: webhook.is_active, channelId: webhook.channel_id };
      }
    } catch (err) {
      console.log(err);
      return null;
    }
  }

  async close() {
    try {
      await this.db.close();
      console.log('Database closed');
    } catch (err) {
      console.error(err.message);
    }
  }
}