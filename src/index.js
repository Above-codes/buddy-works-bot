const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const SqliteController = require('./database/sqlite-controller');
const Listner = require('./hook-listener/listener');
const { token } = require('../config.json');
const DiscordIntegration = require('./hook-listener/discord-integration');

const database = new SqliteController();
database.create();

const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

client.commands = new Collection();

const commandFiles = fs.readdirSync('./src/commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	// Set a new item in the Collection
	// With the key as the command name and the value as the exported module
	client.commands.set(command.data.name, command);
}

const eventFiles = fs.readdirSync('./src/events').filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
	const event = require(`./events/${file}`);
	if (event.once) {
		client.once(event.name, (...args) => event.execute(...args));
	} else {
		client.on(event.name, (...args) => event.execute(client, database, ...args));
	}
}

client.login(token);

// Setup app to listen to the webhooks after
const discordIntegration = new DiscordIntegration(database, client);

const listener = new Listner(discordIntegration);
client.once('ready', () => {
	listener.listen();
});

// Make sure the db closes on exit
[`exit`, `SIGINT`, `SIGUSR1`, `SIGUSR2`, `uncaughtException`, `SIGTERM`].forEach((eventType) => {
  process.on(eventType, async function() {
    await database.close();
  });
});