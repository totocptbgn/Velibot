const { SlashCommandBuilder, AttachmentBuilder, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const openGeocoder = require('node-open-geocoder');
const StaticMaps = require('staticmaps');
const fs = require('node:fs');
const https = require('https');
const path = require('path');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Affiche une carte des stations proches et leurs infos.')
		.addStringOption(option =>
			option.setName('adresse')
				.setDescription('Votre adresse.')
				.setRequired(true))
		.addIntegerOption(option =>
			option.setName('nb_station')
				.setDescription('Nombre de stations à afficher, entre 3 et 5.')
				.setRequired(false)
				.addChoices(
					{ name: '3', value: 3 },
					{ name: '4', value: 4 },
					{ name: '5', value: 5 },
					{ name: '6', value: 6 },
					{ name: '7', value: 7 },
					{ name: '8', value: 8 },
					{ name: '9', value: 9 },
				)),

	async execute(interaction) {
		// Tell the user the bot is thinking, also gives more time to reply
		await interaction.deferReply();

		let nb_station = interaction.options.getInteger('nb_station');
		if (nb_station == null) {
			nb_station = 3;
		}

		// Get coordonates from the adress given
		openGeocoder()
			.geocode(interaction.options.getString('adresse'))
			.end((err, res) => {

				if (res === undefined) {
					interaction.editReply({ content: 'Erreur: l\'API OpenStreetMap est hors-service. Réessayez plus tard.', ephemeral: true });
					return;
				}

				// Checking if the geocoder found a result
				if (res.length === 0) {
					interaction.editReply({ content: 'Erreur: L\'adresse est incorrecte.', ephemeral: true });
					return;
				}

				let result;

				// Keep the first result located in Paris' state
				for (i in res) {
					if (res[i].address.state === 'Île-de-France') {
						result = res[i];
						break;
					}
				}

				if (result === undefined) {
					interaction.editReply({ content: 'Erreur: L\'adresse fournie n\'est pas en Île-de-France.', ephemeral: true });
				} else {
					this.process(result, interaction, nb_station);
				}

			});
	},

	async process(result, interaction, nb_station) {

		const stations = JSON.parse(fs.readFileSync('data/data.json'));
		let stations_coord = [];

		// Get the 3 closest stations from coordonates
		for (i in stations) {
			stations_coord[i] = {
				id: stations[i].station_id,
				name: stations[i].name,
				lat: stations[i].lat,
				lon: stations[i].lon,
				dist: Math.pow((stations[i].lat - result.lat), 2) + Math.pow((stations[i].lon - result.lon), 2)
			}
		}
		stations_coord.sort((a, b) => { return a.dist - b.dist });
		stations_coord = stations_coord.slice(0, nb_station);

		// Get stations status
		https.get('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json', (resp) => {

			let raw_data = '';
			resp.on('data', (chunk) => {
				raw_data += chunk;
			});

			resp.on('end', () => {
				const stations_status = JSON.parse(raw_data).data.stations;
				const station_array = [];

				for (i in stations_status) {
					for (let j = 0; j < nb_station; j++) {
						if (stations_status[i].station_id == stations_coord[j].id) {
							station_array[j] = stations_status[i];
							station_array[j].info = stations_coord[j];
						}
					}
				}
				this.make_map(result, interaction, station_array);
			});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
			interaction.editReply({ content: 'Error: l\'API Vélib\' est hors service. Réessayez plus tard.', ephemeral: true });
		});

	},

	// Building map with marker and message
	async make_map(result, interaction, station_array) {

		// Creating map
		const map_options = {
			width: 800,
			height: 800
		};
		const map = new StaticMaps(map_options);

		// Adding markers
		const marker = {
			offsetX: 24,
			offsetY: 48,
			width: 48,
			height: 48
		};
		marker.img = 'img/marker.png';
		marker.coord = [Number(result.lon), Number(result.lat)];
		map.addMarker(marker);

		for (i in station_array) {
			marker.img = `img/marker${Number(i) + 1}.png`;
			marker.coord = [station_array[i].info.lon, station_array[i].info.lat];
			map.addMarker(marker);
		}

		// Creating map image
		const filename = `map_${new Date().getTime()}.png`;
		const filepath = path.join(__dirname, `../data/${filename}`);

		await map.render();
		await map.image.save(filepath);

		// Building and sending embed message
		let footer;
		if (result.address.city_block != undefined) {
			footer = result.address.city_block;
		} else if (result.address.suburb != undefined) {
			footer = result.address.suburb;
		} else if (result.address.neighbourhood != undefined) {
			footer = result.address.neighbourhood;
		} else if (result.address.municipality != undefined) {
			footer = result.address.municipality;
		} else {
			footer = 'Île-de-France';
			console.log(result);
		}

		const fields = [];
		for (i in station_array) {
			fields[i] = {
				name: `${Number(i) + 1}. ${station_array[i].info.name}`,
				value: `🟩 : **${station_array[i].num_bikes_available_types[0].mechanical}**　　·　　🟦 : **${station_array[i].num_bikes_available_types[1].ebike}**　　·　　🅿️ : **${station_array[i].num_docks_available}**`
			};
		}

		const file = new AttachmentBuilder(filepath);
		const embed = new EmbedBuilder()
			.setColor(0x473c6b)
			.addFields(fields)
			.setImage(`attachment://${filename}`)
			.setTimestamp()
			.setFooter({ text: footer });

		const row = new ActionRowBuilder()
			.addComponents(
				new ButtonBuilder()
					.setCustomId('reload')
					.setStyle(ButtonStyle.Primary)
					.setLabel('　　　　　　Recharger les infos.　　　　　　　'));

		await interaction.editReply({ embeds: [embed], files: [file], components: [row] });

		fs.unlinkSync(filepath);
	}
};
