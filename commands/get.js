const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const https = require('https');
const fs = require('node:fs');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('get')
		.setDescription('Obtenez la disponibilité des vélos dans la stations de votre choix.')
		.addStringOption(option =>
			option.setName('nom')
				.setDescription('Nom de la station.')
				.setRequired(true)
				.setAutocomplete(true)),

	async execute(interaction) {
		// Get stations info
		const stations = JSON.parse(fs.readFileSync('data/data.json'));
		const station_name = interaction.options.getString('nom');

		for (i in stations) {

			// If we find a station with the right name, check the API to get bikes numbers
			if (stations[i].name == station_name) {

				https.get('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json', (resp) => {

					let raw_data = '';
					resp.on('data', (chunk) => {
						raw_data += chunk;
					});

					// Reply to the interaction with station data
					resp.on('end', () => {
						const infos = JSON.parse(raw_data).data.stations;
						for (y in infos) {
							if (infos[y].station_id == stations[i].station_id) {

								const embed = new EmbedBuilder()
									.setColor(0x473c6b)
									.setTitle('Station : ' + station_name)
									.setDescription(
										'🟩　 Vélos méchaniques 　　　 **' + infos[y].num_bikes_available_types[0].mechanical + '**' +
										'\n🟦　 Vélos électriques 　　　　 **' + infos[y].num_bikes_available_types[1].ebike + '**' +
										'\n🅿️　 Bornes libres 　　　 　　 **' + infos[y].num_docks_available + '**'
									)
									.setTimestamp()
									.setFooter({ text: 'Station n°' + infos[y].stationCode });

								interaction.reply({ embeds: [embed] });
								return;
							}
						}
					});

				}).on("error", (err) => {
					interaction.reply({ content: 'Erreur: l\'API Vélib\' n\'est pas disponible...', ephemeral: true });
				});
				return;
			}

		}

		// If the user search for a station that's not in the list
		if (interaction.isRepliable()) {
			await interaction.reply({ content: 'Station non trouvée.', ephemeral: true });
		}

	}
};
