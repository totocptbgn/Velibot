const { SlashCommandBuilder } = require('discord.js');
const openGeocoder = require('node-open-geocoder');
const StaticMaps = require('staticmaps');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Commande en cours de développement.')
		.addStringOption(option =>
			option.setName('adresse')
				.setDescription('Votre adresse.')
				.setRequired(true)),

	async execute(interaction) {
		await interaction.deferReply();
		openGeocoder()
			.geocode(interaction.options.getString('adresse'))
			.end((err, res) => {

				// Checking if the geocoder found a result
				if (res.length === 0) {
					interaction.editReply('Erreur: L\'adresse est incorrecte.');
				} else {
					let result;
					for (i in res) {
						if (res[i].address.state === 'Île-de-France') {
							result = res[i];
							break;
						}
					}

					if (result === undefined) {
						interaction.editReply('Erreur: L\'adresse fournie n\'est pas en Île-de-France.');
					} else {
						this.map_reply(result, interaction);
					}
				}

			});
	},

	async map_reply(result, interaction) {
		const options = {
			width: 1000,
			height: 1000
		};
		const map = new StaticMaps(options);
		
		const bbox = [
			Number(result.lon), Number(result.lat)
		];
		
		await map.render(bbox);

		const filename = `map_${new Date().getTime()}.png`;
		await map.image.save(filename);
		
		interaction.editReply('Done.');
		

	}
};
