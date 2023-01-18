![Banner](img/velibot_banner.png)
 
Discord bot made for checking Vélib' stations availability. Only in french. Made with [discord.js](https://discord.js.org/#/). Website available [here](https://totocptbgn.github.io/Velibot/).

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

## Deploy on Heroku

The bot was deployed on [Heroku](https://www.heroku.com/), check the branch [heroku-deploy](https://github.com/totocptbgn/Velibot/tree/heroku-deploy).
