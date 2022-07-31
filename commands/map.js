const { SlashCommandBuilder, AttachmentBuilder } = require('discord.js');
const openGeocoder = require('node-open-geocoder');
const StaticMaps = require('staticmaps');
const fs = require('node:fs');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Commande en cours de développement.')
		.addStringOption(option =>
			option.setName('adresse')
				.setDescription('Votre adresse.')
				.setRequired(true)),

	async execute(interaction) {
		// Tell the user the bot is thinking, also gives more time to reply
		await interaction.deferReply();

		// Get coordonates from the adress given
		openGeocoder()
			.geocode(interaction.options.getString('adresse'))
			.end((err, res) => {

				// Checking if the geocoder found a result
				if (res.length === 0) {
					interaction.editReply('Erreur: L\'adresse est incorrecte.');
				} else {
					let result;

					// Keep the first result located in Paris' state
					for (i in res) {
						if (res[i].address.state === 'Île-de-France') {
							result = res[i];
							break;
						}
					}

					if (result === undefined) {
						interaction.editReply('Erreur: L\'adresse fournie n\'est pas en Île-de-France.');
					} else {
						this.process(result, interaction);
					}
				}

			});
	},

	async process(result, interaction) {

		const stations = JSON.parse(fs.readFileSync('data.json'));
		let stations_coord = [];

		// Get the 3 closest stations from coordonates
		for (i in stations) {
			stations_coord[i] = {
				id: stations[i].station_id,
				lat: stations[i].lat,
				lon: stations[i].lon,
				dist: Math.pow((stations[i].lat - result.lat), 2) + Math.pow((stations[i].lon - result.lon), 2)
			}
		}
		stations_coord.sort((a, b) => { return a.dist - b.dist });
		stations_coord = stations_coord.slice(0, 3);

		// Get stations status
		https.get('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json', (resp) => {

			let raw_data = '';
			resp.on('data', (chunk) => {
				raw_data += chunk;
			});

			resp.on('end', () => {
				const stations_status = JSON.parse(raw_data).data.stations;

				let first;
				let second;
				let third;

				for (i in stations_status) {
					if (stations_status[i].station_id == stations_coord[0].id) {
						first = stations_status[i];
						first.info = stations_coord[0];
					} else if (stations_status[i].station_id == stations_coord[1].id) {
						second = stations_status[i];
						second.info = stations_coord[1];
					} else if (stations_status[i].station_id == stations_coord[2].id) {
						third = stations_status[i];
						third.info = stations_coord[2];
					}

					if (first != undefined && second != undefined && third != undefined) {
						break;
					}
				}

				this.make_map(result, interaction, first, second, third);
			});

		}).on("error", (err) => {
			console.log("Error: " + err.message);
			interaction.editReply('Error: Vélib API not available...');
		});

	},

	// Building map with marker and message
	async make_map(result, interaction, first, second, third) {

		const options = {
			width: 500,
			height: 500
		};
		const map = new StaticMaps(options);

		const marker = {
			offsetX: 24,
			offsetY: 48,
			width: 48,
			height: 48
		};

		marker.img = 'img/marker1.png';
		marker.coord = [first.info.lon, first.info.lat];
		map.addMarker(marker);

		marker.img = 'img/marker2.png';
		marker.coord = [second.info.lon, second.info.lat];
		map.addMarker(marker);

		marker.img = 'img/marker3.png';
		marker.coord = [third.info.lon, third.info.lat];
		map.addMarker(marker);

		marker.img = 'img/marker.png';
		marker.coord = [Number(result.lon), Number(result.lat)];
		map.addMarker(marker);
	
		await map.render();

		const filename = `map_${new Date().getTime()}.png`;
		await map.image.save(filename);
		
		await interaction.editReply({ files: [new AttachmentBuilder(filename, { name: 'map.png' })] });
		fs.unlinkSync(filename);
	}
};
