module.exports = {
	name: 'interactionCreate',
	async execute(client, db, interaction) {
    if (!interaction.isSelectMenu()) return;

    if (interaction.customId === 'buddySetupSelectChannel') {
      const selectedChannelId = interaction.values[0];
      const selectedChannel = await interaction.guild.channels.fetch(selectedChannelId);

      await db.insertNewWebhook(interaction.guild.id, selectedChannelId);

      await interaction.update({content: `${selectedChannel.name} was selected to use as the reporting channel`, components: []});
    }
	},
};