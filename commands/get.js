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
		const stations = JSON.parse(fs.readFileSync('data.json'));
		const station_name = interaction.options.getString('name');
		
		let replied = false;
		for (i in stations) {
			if (stations[i].name == station_name) {
				await interaction.reply('Name: `' + station_name + '`\nID: `' + stations[i].station_id + '`');
				replied = true;
			}
		}

		if (!replied) {
			await interaction.reply('Station not found.');
		}
	},
};
