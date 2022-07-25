const { SlashCommandBuilder } = require('discord.js');
const https = require('https');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get')
		.setDescription('Test feature for the Vélibot - still in development.')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Nom de la station')
				.setAutocomplete(true)),

	async execute(interaction) {
		// Get stations info
		const stations = JSON.parse(fs.readFileSync('data.json'));
		const station_name = interaction.options.getString('name');

		for (i in stations) {

			// If we find a station with the right name, check the API
			if (stations[i].name == station_name) {

				https.get('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json', (resp) => {

						let raw_data = '';
						resp.on('data', (chunk) => {
							raw_data += chunk;
						});

						resp.on('end', () => {
							const infos = JSON.parse(raw_data).data.stations;
							for (y in infos) {
								if (infos[y].station_id == stations[i].station_id) {
									interaction.reply(
										'Name: `' + station_name + '`' +
										'\nMechanical bikes: `' +  infos[y].num_bikes_available_types[0].mechanical + '`' +
										'\nElectric bikes: `' +  infos[y].num_bikes_available_types[1].ebike + '`' +
										'\nAvailable docks: `' +  infos[y].num_docks_available + '`');
									return;
								}
							}
						});

				}).on("error", (err) => {
					interaction.reply('Error: Vélib API not available...');
				});
				return;
			}
		}

		if (interaction.isRepliable()) {
			await interaction.reply('Station not found.');
		}
		
	},
};
