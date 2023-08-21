const { Collection, EmbedBuilder } = require('discord.js');
const { Player } = require('discord-player');
const path = require('path');
const fs = require('fs');

/**
 * 
 * @param {import('discord.js').Client} client
 * 
 */
module.exports = async (client, prefix) => {
    client.commands = new Collection();

    const commandFiles = fs.readdirSync(path.join(__dirname, 'commands')).filter(file => file.endsWith('.js'));

    for (const file of commandFiles) {
        const command = require(`./commands/${file}`);

        if (command.name) {
            if (typeof command.name === "string") client.commands.set(command.name, command);
            if (Array.isArray(command.name)) {
                for (const alias of command.name) {
                    client.commands.set(alias, command);
                }
            }
        }
    }

    client.once('ready', () => {
        console.log(`Logged in as ${client.user.username}`);
        client.user.setPresence({
            status: 'dnd',
            activities: [
                { name: '"!help" for help.', type: 1 }
            ]
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

    client.player = new Player(client);
    await client.player.extractors.loadDefault();
    
    client.player.events.on('playerStart', (queue, track) => {
    	if (queue.repeatMode === 0) return queue.metadata.channel.send({
        	embeds: [
        		new EmbedBuilder()
        		.setColor('Blue').setTitle(`Now Playing`)
        		.setDescription(`${track?.title} \`[${track?.duration}]\``)
        		.setFooter({ text: `Queued by: ${queue.metadata.member.user.username}` })
        		.setThumbnail(track.thumbnail)
        		.setTimestamp()
        	]
        })
    });

    client.player.events.on('audioTrackAdd', (queue, track) => {
        if (!queue.isPlaying() && queue.tracks > 0 && !queue.isEmpty()) queue.revive();
    });

    client.player.events.on('error', (queue, error) => {
        console.error(error);
    });

    client.player.events.on('playerError', async (queue, error, trackie) => {
        const { track } = await queue.play(`${trackie?.title}`, { searchEngine: 'soundcloudSearch' });

        return queue.metadata.channel.send({
            embeds: [
                new EmbedBuilder()
                .setColor('Gold')
                .addFields({
                    name: 'Found an alternative from SoundCloud!', value: `Added ${track?.title} \`[${track?.duration}]\` to the queue!`
                })
		    .setFooter({ text: `Originally queued by: ${queue.metadata.member.user.username}` })
		    .setThumbnail(track.thumbnail)
		    .setTimestamp()
            ]
        });
    });
}
