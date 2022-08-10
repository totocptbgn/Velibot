![Banner](img/velibot_banner.png)
 
Discord bot made for checking Vélib' stations availability. Still a work in progress. Translated in french. You can add it to your server [here](https://discord.com/api/oauth2/authorize?client_id=1000050553520398356&permissions=534723950656&scope=bot).

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

The bot is actually deployed on [Heroku](https://www.heroku.com/), check the branch [heroku-deploy](https://github.com/totocptbgn/Velibot/tree/heroku-deploy).
