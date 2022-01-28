const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('enable')
		.setDescription('Enable reporting in this server for the setup webhook'),
	async execute(db, interaction) {
    const guildId = interaction.guild.id;
    const channelId = await db.getChannelIdForGuildId(guildId);

    if (!channelId) {
      await interaction.reply('No integration has been setup for this server yet, please you /setup to create one.');
      return;
    }

    const channel = await interaction.guild.channels.fetch(channelId);
    const channelName = channel.name;

    const isAlreadyActive = await db.isWebhookAlreadyActive(guildId);

    if (isAlreadyActive) {
      await interaction.reply(`Webhook is already active, I should be reporting in ${channelName}`);
      return;
    }

    await db.setWebhookActive(true, guildId);

    await interaction.reply(`Setting your buddy webhook integration to active, I will report in the ${channelName} channel`);
	},
};