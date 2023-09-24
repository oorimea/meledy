require('dotenv').config();
const { clientID } = require('./config.json');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        const commands = await rest.get(Routes.applicationCommands(clientID));
        console.log(commands);
    } catch (error) {
        console.error(error);
    }
})();