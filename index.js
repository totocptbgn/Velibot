// Require the necessary discord.js classes
const fs = require('node:fs');
const path = require('node:path');
const https = require('https');
const { Client, Collection, GatewayIntentBits, InteractionType, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
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

// Executed at startù
client.once('ready', () => {

	// Loading and keeping stations info
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
			console.log('Ready!');
		});

	}).on("error", (err) => {
		console.log("Error: " + err.message);
	});
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
	}

	// Handling Button (Reaload button)
	else if (interaction.isButton()) {

		// await interaction.deferUpdate();

		// Get station names
		const ids = [];
		const names = [];
		const stations = JSON.parse(fs.readFileSync('data.json'));

		for (i in interaction.message.embeds[0].fields) {
			names[i] = interaction.message.embeds[0].fields[i].name.slice(3);
		}

		// Get station IDs
		for (i in interaction.message.embeds[0].fields) {
			for (y in stations) {
				if (stations[y].name === names[i]) {
					ids.push(stations[y].station_id);
					break;
				}
			}
		}

		// Get data and update the embed message
		https.get('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json', (resp) => {

			let raw_data = '';
			resp.on('data', (chunk) => {
				raw_data += chunk;
			});

			resp.on('end', () => {
				const infos = JSON.parse(raw_data).data.stations;
				const new_data = {};

				for (i in infos) {
					for (y in ids) {
						if (infos[i].station_id == ids[y]) {
							new_data[y] = infos[i];
							break;
						}
					}
				}

				const fields = [];
				for (i in new_data) {
					fields[i] = {
						name: `${Number(i) + 1}. ${names[i]}`,
						value: `🟩 : **${new_data[i].num_bikes_available_types[0].mechanical}**　　·　　🟦 : **${new_data[i].num_bikes_available_types[1].ebike}**　　·　　🅿️ : **${new_data[i].num_docks_available}**`
					};
				}

				const new_embed = new EmbedBuilder()
					.setColor(0x473c6b)
					.setFields(fields)
					.setImage(interaction.message.embeds[0].data.image.url)
					.setTimestamp()
					.setFooter({ text: interaction.message.embeds[0].data.footer.text });

				const row = new ActionRowBuilder()
					.addComponents(
						new ButtonBuilder()
							.setCustomId('reload')
							.setStyle(ButtonStyle.Primary)
							.setLabel('　　　　　　Recharger les infos.　　　　　　　'));

				interaction.update({ embeds: [new_embed], files: [], components: []})
					.then(setTimeout(() => {interaction.editReply({ components: [row]})}, 30000));

			});

		}).on("error", (err) => {
			console.log(err);
		});

	}

});

// Login to Discord with your client's token
client.login(token);
