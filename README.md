![Banner](img/velibot_banner.png)
 
Discord bot made for checking Vélib' stations availability. Only in french. Made with [discord.js](https://discord.js.org/#/). Website available : https://velibot.fr.

## Deploy on your computer

Setup tokens to connect to the Discord API : Create the file `config.json` and add your bot tokens :
```json
{
    "token": "BOT_TOKEN_HERE",
    "applicationId": "APPLICATION_ID_HERE"
}
```

Dependencies installation :

```bash
npm install 
```

Declare commands to the Discord API :
```bash
node deploy-commands.js
```

Start the bot :
```bash
node .
```

## Data analysis - Work In Progress

Gather data from Vélib' API, save every 10 min stations data in `data/data.csv`:

```bash
node data_loader.js
```

To read the data, use the notebook `data_analysis.ipynb`.