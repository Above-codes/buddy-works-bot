const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('disable')
		.setDescription('Disable reporting in this server for the setup webhook'),
	async execute(db, interaction) {
    const guildId = interaction.guild.id;

    const channelId = await db.getChannelIdForGuildId(guildId);

    if (!channelId) {
      await interaction.reply('No integration has been setup for this server yet, please you /setup to create one.');
      return;
    }

    const isAlreadyActive = await db.isWebhookAlreadyActive(guildId);

    if (!isAlreadyActive) {
      await interaction.reply(`Webhook is not active so I can't disable it`);
      return;
    }

    await db.setWebhookActive(false, guildId);

    await interaction.reply(`I will no longer report pipelines in this server, if you want to turn me back on type /enable`);
	},
};