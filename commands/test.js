const { SlashCommandBuilder } = require('discord.js');
const https = require('https');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('test')
		.setDescription('Test feature for the Vélibot - still in development.'),

	async execute(interaction) {
		
		// Log
		if (interaction.inGuild()) {
			console.log(`> /${interaction.commandName} | ` + `tag: ${interaction.user.tag}` + `, server: ${interaction.guild.name}`);
		} else {
			console.log(`> /${interaction.commandName} | ` + `tag: ${interaction.user.tag}` + `, server: [None]`);
		}
		

		/*
		https.get('https://velib-metropole-opendata.smoove.pro/opendata/Velib_Metropole/station_status.json', (resp) => {
			
			let raw_data = '';
			resp.on('data', (chunk) => {
				raw_data += chunk;
			});

			// The whole response has been received. Print out the result.
			resp.on('end', () => {
				let data = JSON.parse(raw_data).data.stations;
				// console.log(data[0]);
				
			});


		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
		*/
		await interaction.reply('Done.');
	},
};
