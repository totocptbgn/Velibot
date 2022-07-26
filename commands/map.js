const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('map')
		.setDescription('Commande en cours de développement.')
		.addStringOption(option =>
			option.setName('name')
				.setDescription('Nom de la station')
				.setAutocomplete(true)),

	async execute(interaction) {
		interaction.reply('Done.');
	},
};
