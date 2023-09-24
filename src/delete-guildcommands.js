require('dotenv').config();
const { clientID } = require('./config.json');
const { REST, Routes } = require('discord.js');
const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

(async () => {
    try {
        const guilds = await rest.get(Routes.userGuilds());
        for (const guild of guilds) {
            const guildCommands = await rest.get(Routes.applicationGuildCommands(clientID, guild.id));
            for (const command of guildCommands) {
                setTimeout(async () => {
                    console.log(`[Deletion] Command ${command.name} [${command.id}], Guild ${guild.id}`);
                    await rest.delete(Routes.applicationGuildCommand(clientID, guild.id, command.id));
                }, 5000);
            }
        }
    } catch (error) {
        console.error(error);
    }
})();