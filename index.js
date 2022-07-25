// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const https = require('https');
const { Client, Collection, GatewayIntentBits, InteractionType } = require('discord.js');
const { token } = require('./config.json');

let stations; // Stations info
let station_names = []; // Stations name (for autocompletion)

// Create a new client instance
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

// Parsing existing commands
client.commands = new Collection();
const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const filePath = path.join(commandsPath, file);
	const command = require(filePath);
	client.commands.set(command.data.name, command);
}

// Executed at start
client.once('ready', () => {

	// Loading stations infos	
	https.get('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_information.json', (resp) => {
			
			let raw_data = '';
			resp.on('data', (chunk) => {
				raw_data += chunk;
			});

			resp.on('end', () => {
				stations = JSON.parse(raw_data).data.stations;
				for (i in stations) {
					station_names.push(stations[i].name);
				}
				fs.writeFileSync('data.json', JSON.stringify(stations));
			});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
	
	console.log('Ready!');
});

// Handling interactions
client.on('interactionCreate', async interaction => {

	// Handling commands
	if (interaction.isChatInputCommand()) {
		const command = client.commands.get(interaction.commandName);
		if (!command) return;

		try {
			if (interaction.inGuild()) {
				console.log(`> /${interaction.commandName} | ` + `tag: ${interaction.user.tag}` + `, server: ${interaction.guild.name}`);
			} else {
				console.log(`> /${interaction.commandName} | ` + `tag: ${interaction.user.tag}` + `, server: [None]`);
			}
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
	
	// Handling autocompletion
	else if (interaction.type == InteractionType.ApplicationCommandAutocomplete) {
		if (interaction.commandName === 'get') {
			const focusedValue = interaction.options.getFocused();
			
			let filtered = station_names.filter(choice => (choice.startsWith(focusedValue) || choice.toLowerCase().startsWith(focusedValue)));
			if (filtered.length > 25) {
				filtered = filtered.splice(0, 25);
			}
			await interaction.respond(
				filtered.map(choice => ({ name: choice, value: choice })),
			);

		}
	} else {
		return;
	}

	
});

// Login to Discord with your client's token
client.login(token);
