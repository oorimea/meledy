const { Collection, EmbedBuilder, ActivityType, GatewayDispatchEvents } = require('discord.js');
const { nodes } = require('./config.json');
const { Riffy } = require('riffy');
const path = require('path');
const fs = require('fs');

/**
 * @param {import('discord.js').Client} client
 */
module.exports = async (client, prefix) => {
    client.commands = new Collection();
    client.riffy = new Riffy(client, nodes, {
        send: (payload) => {
            const guild = client.guilds.cache.get(payload.d.guild_id);
            if (guild) guild.shard.send(payload);
        },
        restVersion: 'v3'
    });

    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);

        if (command.name) {
            if (typeof command.name === 'string') client.commands.set(command.name, command);
            if (Array.isArray(command.name)) {
                for (const alias of command.name) {
                    client.commands.set(alias, command);
                }
            }
        }
    }
 
    client.on("raw", (d) => {
        if (![GatewayDispatchEvents.VoiceStateUpdate, GatewayDispatchEvents.VoiceServerUpdate,].includes(d.t)) return;
        client.riffy.updateVoiceState(d);
    });

    client.once('ready', () => {
        client.riffy.init(client.user.id);
        console.log(`Logged in as ${client.user.username}.`);
        client.user.setPresence({
            activities: [{ type: ActivityType.Custom, name: 'customstatus', state: `${client.guilds.cache.size} servers.` }],
        });
    });

    client.on('messageCreate', (message) => {
        if (!message.content.startsWith(prefix) || message.author.bot) return;

        const args = message.content.slice(prefix.length).trim().split(/ +/);
        const commandName = args.shift().toLowerCase();
        const command = client.commands.get(commandName) || client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

        if (!command) return;
        try {
            command.execute(message, args);
            delete require.cache[require.resolve(`./commands/${command.name[0]}.js`)];
        } catch (error) {
            console.error(error);
            message.reply('There was an error trying to execute that command.');
        }
    });

    client.on('interactionCreate', async (interaction) => {
        const { commandName } = interaction;
        const command = client.commands.get(commandName);

        if (interaction.isAutocomplete()) {
            if (typeof command.autocompleteRun === "function") await command.autocompleteRun(interaction);
            else return;
        } else if (interaction.isChatInputCommand()) {
            await command.execute(interaction);
        }
    });

    client.riffy.on("queueEnd", async (player) => {
        const channel = client.channels.cache.get(player.textChannel);

        if (player.isAutoplay) {
            player.autoplay(player);
        } else {
            channel.send("Queue has ended.");
        }
    });
}