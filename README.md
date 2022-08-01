# Velibot
 
>Work In Progress

Discord bot made for checking Vélib' stations availability.

## Use

Setup tokens to connect to the Discord API : Create the file `config.json` and add your bot tokens :
```json
{
	"token": "BOT_TOKEN_HERE",
	"applicationId": "APPLICATION_ID_HERE"
}
```

Declare commands to the Discord API :
```bash
node deploy-commands.js
```

Start the bot :
```bash
node .
```

## Dependencies installation

```bash
npm install discord.js @discordjs/rest node-open-geocoder staticmaps
```
