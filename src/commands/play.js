const { SlashCommandBuilder, CommandInteraction, EmbedBuilder } = require('discord.js');
const hhmmss = require('hhmmss');

module.exports = {
    name: ['play'],
    data: new SlashCommandBuilder()
        .setName('play').setDescription('Play a song by providing the name or URL.')
        .addStringOption((input) => input.setName('query')
        .setDescription('The title/URL of the track.')
        .setRequired(true).setAutocomplete(false)),
    
    /**
     * 
     * @param {import('discord.js').Message | CommandInteraction} message 
     * @param {string[]} args 
     */
    async execute(message, args) {
        /** @type {import('riffy').Riffy} */
        const manager = message.client['riffy'];
        /** @type {import('discord.js').VoiceChannel} */
        const voiceChannel = message.member?.voice?.channel;
		const searchQuery = message instanceof CommandInteraction ? message.options.get('query', true)?.value : args.join(' ');

        /**
         * @param {string | import('discord.js').MessagePayload | import('discord.js').InteractionEditReplyOptions | import('discord.js').MessageReplyOptions} options
         * @param {import('discord.js').Message | CommandInteraction} msg
         */
        const respondInteraction = (options, msg) => msg instanceof CommandInteraction ?
            msg.deferred ? msg.editReply(options) : msg.reply(options) : msg.reply(options);

        if (!voiceChannel) {
            return await respondInteraction('You are not connected to a voice channel.', message);
        } else {
            if (message instanceof CommandInteraction) {
                await message.deferReply();
            }

            const searchResult = await manager.resolve({ query: searchQuery, requester: message.member });
            if (searchResult.loadType === "NO_MATCHES") return await respondInteraction('No results found.', message);

            const player = manager.createConnection({
                guildId: message.guild.id, voiceChannel: voiceChannel.id,
                textChannel: message.channel.id, deaf: true
            });

            if (player) {
				if (player.voiceChannel !== voiceChannel.id) return await respondInteraction('You must be in the same voice channel before using this command.', message);
            
                if (searchResult.loadType === "PLAYLIST_LOADED") {
                    for (const track of searchResult.tracks) {
                        track.info.requester = message.author;
                        player.queue.add(track);
                    }
         
                    await respondInteraction({
                        embeds: [
                            new EmbedBuilder().setColor('Blurple').setTitle(`Playlist loaded`)
                            .setDescription(`${searchResult.playlistInfo?.name}`)
                            .addFields({
                                name: 'Entries',
                                value: `${searchResult.tracks.length || 0} tracks`,
                                inline: true
                            })
                            .setFooter({ text: `Queued by: ${message.member.user.username}` })
                            .setTimestamp()
                        ]
                    }, message);
                } else if (searchResult.loadType === 'SEARCH_RESULT' || searchResult.loadType === 'TRACK_LOADED') {
                    const track = await (searchResult.tracks.shift().resolve(manager));
                    track.info.requester = message.member;
    
                    const position = track.info.stream ? track.info.seekable ? '[UNKNOWN]' : '[LIVESTREAM]' :
                        `[${hhmmss(track.info.length / 1000)}]`;
        
                    player.queue.add(track);
                    await respondInteraction({
                        embeds: [
                            new EmbedBuilder().setColor('Red').setTitle(`Added to queue`)
                            .setDescription(`${track?.info?.title} \`${position}\``)
                            .setFooter({ text: `Queued by: ${track.info.requester?.user?.username}` })
                            .setTimestamp()
                        ]
                    }, message);
                } else {
                    return await respondInteraction('No results found.');
                }
            } else {
                if (searchResult.loadType === "PLAYLIST_LOADED") {
                    for (const track of searchResult.tracks) {
                        track.info.requester = message.author;
                        player.queue.add(track);
                    }
         
                    await respondInteraction({
                        embeds: [
                            new EmbedBuilder().setColor('Blurple').setTitle(`Playlist loaded`)
                            .setDescription(`${searchResult.playlistInfo?.name}`)
                            .addFields({
                                name: 'Entries',
                                value: `${searchResult.tracks.length || 0} tracks`,
                                inline: true
                            })
                            .setFooter({ text: `Queued by: ${message.member.user.username}` })
                            .setTimestamp()
                        ]
                    }, message);
                } else if (loadType === 'SEARCH_RESULT' || loadType === 'TRACK_LOADED') {
                    const track = await (searchResult.tracks.shift().resolve(manager));
                    track.info.requester = message.member;
    
                    const position = track.info.stream ? track.info.seekable ? '[UNKNOWN]' : '[LIVESTREAM]' :
                        `[${hhmmss(track.info.length / 1000)}]`;
        
                    player.queue.add(track);
                    await respondInteraction({
                        embeds: [
                            new EmbedBuilder().setColor('Red').setTitle(`Added to queue`)
                            .setDescription(`${track?.info?.title} \`${position}\``)
                            .setFooter({ text: `Queued by: ${track.info.requester?.user?.username}` })
                            .setTimestamp()
                        ]
                    }, message);
                } else {
                    return await respondInteraction('No results found.');
                }
            }
                
            if (!player.playing && !player.paused) return player.play();
        }
    }
}