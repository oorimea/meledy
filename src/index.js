require('dotenv').config();
const { Client, GatewayIntentBits, REST, Routes } = require('discord.js');
const { clientID } = require('./config.json');
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.GuildPresences,
        GatewayIntentBits.MessageContent, GatewayIntentBits.GuildMembers, GatewayIntentBits.GuildVoiceStates,
    ],
});

const rest = new REST({ version: '9' }).setToken(process.env.TOKEN);

const prefix = '!';
require('./loader')(client, prefix);

(async () => {
    const commands = [...new Set(Array.from(client.commands.values()))];

    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);

        const data = await rest.put(
            Routes.applicationCommands(clientID),
            { body: commands.map(command => command.data.toJSON()) },
        );

        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    } catch (error) {
        console.error(error);
    }

    client.login(process.env.TOKEN);
})();