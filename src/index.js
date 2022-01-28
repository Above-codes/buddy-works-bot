require('dotenv').config();
const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const Listner = require('./hook-listener/listener');
const DiscordIntegration = require('./hook-listener/discord-integration');
const MongoController = require('./database/mongo-controller');

const database = new MongoController();
try {
	database.create();
} catch (err) {
	console.log('Error starting the database');
	console.log(err.message);
}

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

client.login(process.env.TOKEN);

// Setup app to listen to the webhooks after
const discordIntegration = new DiscordIntegration(database, client);

const listener = new Listner(discordIntegration);
client.once('ready', () => {
	listener.listen();
});