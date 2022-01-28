const deployCommands = require('../deploy-commands');

module.exports = {
	name: 'guildCreate',
	async execute(client, db, interaction) {
    const guildId = interaction.id;

    console.log('Deploying commands to', interaction.name);
    deployCommands(guildId);
	},
};