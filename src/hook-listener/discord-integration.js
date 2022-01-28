const { MessageEmbed } = require('discord.js');

module.exports = class DiscordIntegration {
  constructor(db, bot) {
    this.db = db;
    this.bot = bot;
  }

  async processReq(req) {
    try {
      const secretKey = req.headers.secret_key;

      if (!secretKey) {
        console.log('No secret key, can not do anything!');
        return;
      }

      const guildInfo = await this.db.getGuildInfoForSecretKey(secretKey);

      if (!guildInfo) {
        console.log('Did not find a matching secret');
        return;
      }

      if (guildInfo.isActive === 0) {
        console.log('That guild does not want me to speak to them, ignoring...');
        return;
      }

      this.reportWebhook(req.body, guildInfo);
    } catch (err) {
      console.log(err);
    }
  }

  async reportWebhook(body, guildInfo) {
    try {
      const projectName = body.project.display_name;
      const invokedBy = body.invoker.name;
      const pipelineName = body.execution.pipeline.name;
      const branch = body.execution.branch.name; 
      const executionUrl = body.execution.html_url;
      const status = body.execution.status;

      const channel = await this.bot.channels.fetch(guildInfo.channelId);

      let colour = '#0099ff';
      let niceStatus = null;

      if (status === 'FAILED') {
        channel.send(`@here It's on fire!! 🔥🔥🔥🔥`);
        colour = '#ff0000';
        niceStatus = 'Failed';
      } else if (status === 'INPROGRESS') {
        colour = '#ffbf00';
        niceStatus = 'In Progress';
      } else if (status === 'SUCCESSFUL') {
        colour = '#00ff00';
        niceStatus = 'Successful';
      } else if (status === 'TERMINATED') {
        colour = '#ff0000';
        niceStatus = 'Terminated';
      }

      const embededMessage = new MessageEmbed()
        .setColor(colour)
        .setTitle(`[${projectName}] [${branch}]`)
        .setURL(executionUrl)
        .addField('Status', niceStatus ? niceStatus : status)
        .addField('Pipeline', pipelineName)
        .addField('Started By', invokedBy)
        .setTimestamp();

      channel.send({ embeds: [embededMessage] });
    } catch (err) {
      console.log(err);
    }
  }
}