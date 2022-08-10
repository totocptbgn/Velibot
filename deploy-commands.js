// Register to Discord the slash commands.
// Once this program executed, the commands will be added automatically when the bot joins a server.

const fs = require('node:fs');
const path = require('node:path');
const { REST } = require('@discordjs/rest');
const { Routes } = require('discord.js');
const { token, applicationId } = require('./config.json');


const commands = [];
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	commands.push(command.data.toJSON());
}

const rest = new REST({ version: '10' }).setToken(token);

rest.put(Routes.applicationCommands(applicationId), { body: commands })
	.then(() => console.log('Successfully registered application commands.'))
	.catch(console.error);