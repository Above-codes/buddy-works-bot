const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');
const { webhookUrl } = require('../../config.json');
const uuidv4 = require('uuid').v4;

module.exports = {
  data: new SlashCommandBuilder()
		.setName('setup')
		.setDescription('Setup buddy works webhook integration'),
	async execute(db, interaction) {

    // Check if the guild is already setup
    const guildId = interaction.guildId;
    const isSetup = await db.isGuildAlreadySetup(guildId);

    if (isSetup) {
      await interaction.reply(`Webhook is already setup, can not be setup again!`);
      return;
    }

    const channels = await interaction.guild.channels.fetch();

    const textChannels = channels
      .filter(channel => channel.type === 'GUILD_TEXT')
      .map(channel => ({ label: channel.name, value: channel.id }));

    const row = new MessageActionRow()
      .addComponents(
        new MessageSelectMenu()
          .setCustomId('buddySetupSelectChannel')
          .setPlaceholder('Reporting Channel')
          .addOptions(textChannels)
      );

    const hookSecret = uuidv4();

    await db.insertNewSecret(guildId, hookSecret);

    const dm = await interaction.user.createDM()
    await dm.send(`Please create a webhook integration pointing at ${webhookUrl} with a secret of \`\`\`${hookSecret}\`\`\``);

		await interaction.reply({ content: 'Please see your DMs and select a channel for me to report to!', components: [row]});
	},
}