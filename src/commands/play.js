const { EmbedBuilder, SlashCommandBuilder, CommandInteraction } = require('discord.js');

function trimStringWithDots(inputString, maxLength = 96) {
	if (inputString.length <= maxLength) {
		return inputString; // No need to trim
	} else {
		const trimmedString = inputString.substring(0, maxLength - 3).trim();
		return trimmedString + '...';
	}
}

module.exports = {
	name: ['play', 'p'],
	data: new SlashCommandBuilder()
		.setName('play').setDescription('Play a song by providing the name or URL.')
		.addStringOption((input) => input.setName('query')
		.setDescription('Song title/url')
		.setRequired(true).setAutocomplete(false)),
	/**
	 *
	 * @param {import('discord.js').Message | import('discord.js').CommandInteraction} message
	 * @param {string[]} args
	 */
	async execute(message, args) {
		/** @type {import('discord-player').Player} */
		const player = message.client['player'];
		const queue = player.nodes.get(message.guild.id);
		const voiceChannel = message.member?.voice?.channel;
		const searchQuery = message instanceof CommandInteraction ? message.options.getString('query', true) : args.join(' ');

		if (!voiceChannel) {
			return message.reply('You are not connected to a voice channel.');
		} else {
			if (message instanceof CommandInteraction) {
				await message.deferReply();
			}

			const search = await player.search(searchQuery);
			if (search.isEmpty()) return message instanceof CommandInteraction ?
				message.editReply('No results found.') : message.reply('No results found.');

			if (queue) {
				if (queue.channel.id !== voiceChannel.id) return message.reply('You must be in the same voice channel before using this command.');

				if (search.playlist) {
					const playlist = search.playlist;
					if (playlist.tracks < 1) return (message instanceof CommandInteraction) ? message.editReply(`The playlist you provided is empty.`) :
						message.reply(`The playlist you provided is empty.`)
	
					for (const track of playlist.tracks) {
						track.setMetadata(message); 
					}
	
					const { track } = await queue.play(playlist);
					return (message instanceof CommandInteraction) ? message.editReply({
						embeds: [
							new EmbedBuilder()
							.setColor('Blurple').setTitle(`Playlist loaded`)
							.setDescription(`${playlist?.title}`)
							.addFields({
								name: 'Duration', value: playlist?.durationFormatted,
								inline: true
							}, {
								name: 'Entries',
								value: `${playlist?.tracks?.length || 0} tracks`,
								inline: true
							})
							.setFooter({ text: `Queued by: ${message.member.user.username}` })
							.setThumbnail(track?.thumbnail)
							.setTimestamp()
						]
					}) : message.reply({
						embeds: [
							new EmbedBuilder()
							.setColor('Blurple').setTitle(`Playlist loaded`)
							.setDescription(`[${playlist?.title}](${playlist?.url})`)
							.addFields({
								name: 'Duration', value: playlist?.durationFormatted,
								inline: true
							}, {
								name: 'Entries',
								value: `${playlist?.tracks?.length || 0} tracks`,
								inline: true
							})
							.setFooter({ text: `Queued by: ${message.member.user.username}` })
							.setThumbnail(track?.thumbnail)
							.setTimestamp()
						]
					});
				}

				const { track } = await queue.play(search.tracks);

				return (message instanceof CommandInteraction) ? message.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor('Red').setTitle(`Added to queue`)
						.setDescription(`${track?.title} \`[${track?.duration}]\``)
						.setFooter({ text: `Queued by: ${message.member.user.username}` })
						.setThumbnail(track.thumbnail)
						.setTimestamp()
					]
				}) : message.reply({
					embeds: [
						new EmbedBuilder()
						.setColor('Red').setTitle(`Added to queue`)
						.setDescription(`${track?.title} \`[${track?.duration}]\``)
						.setFooter({ text: `Queued by: ${message.member.user.username}` })
						.setThumbnail(track.thumbnail)
						.setTimestamp()
					]
				});
			}

			const queueConstruct = player.nodes.create(message.guild, {
				selfDeaf: true,
				metadata: message,
                leaveOnEnd: true,
				skipOnNoStream: true,
                leaveOnEmpty: true,
                leaveOnEmptyCooldown: 3000,
			});

			if (!queueConstruct.connection) await queueConstruct.connect(voiceChannel);
			if (search.playlist) {
				const playlist = search.playlist;
				if (playlist.tracks < 1) return (message instanceof CommandInteraction) ? message.editReply(`The playlist you provided is empty.`) :
					message.reply(`The playlist you provided is empty.`)

				for (const track of playlist.tracks) {
					track.setMetadata(message);
				}

				const { track } = await queueConstruct.play(playlist);
				return (message instanceof CommandInteraction) ? message.editReply({
					embeds: [
						new EmbedBuilder()
						.setColor('Blurple').setTitle(`Playlist loaded`)
						.setDescription(`${playlist?.title}`)
						.addFields({
							name: 'Duration', value: playlist?.durationFormatted,
							inline: true
						}, {
							name: 'Entries',
							value: `${playlist?.tracks?.length || 0} tracks`,
							inline: true
						})
						.setFooter({ text: `Queued by: ${message.member.user.username}` })
						.setThumbnail(track?.thumbnail)
						.setTimestamp()
					]
				}) : message.reply({
					embeds: [
						new EmbedBuilder()
						.setColor('Blurple').setTitle(`Playlist loaded`)
						.setDescription(`[${playlist?.title}](${playlist?.url})`)
						.addFields({
							name: 'Duration', value: playlist?.durationFormatted,
							inline: true
						}, {
							name: 'Entries',
							value: `${playlist?.tracks?.length || 0} tracks`,
							inline: true
						})
						.setFooter({ text: `Queued by: ${message.member.user.username}` })
						.setThumbnail(track?.thumbnail)
						.setTimestamp()
					]
				});
			} else {
                const { track } = await queueConstruct.play(search.tracks);
                return (message instanceof CommandInteraction) ? message.editReply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('Red').setTitle(`Added to queue`)
                        .setDescription(`${track?.title} \`[${track?.duration}]\``)
                        .setFooter({ text: `Queued by: ${message.member.user.username}` })
                        .setThumbnail(track.thumbnail)
                        .setTimestamp()
                    ]
                }) : message.reply({
                    embeds: [
                        new EmbedBuilder()
                        .setColor('Red').setTitle(`Added to queue`)
                        .setDescription(`${track?.title} \`[${track?.duration}]\``)
                        .setFooter({ text: `Queued by: ${message.member.user.username}` })
                        .setThumbnail(track.thumbnail)
                        .setTimestamp()
                    ]
                });
            }
		}
	},
	/**
	 *
	 * @param {import('discord.js').CommandInteraction} interaction
	 * @returns
	 */
	async autocompleteRun(interaction) {
        try {
            /** @type {import('discord-player').Player} */
            const player = interaction.client['player'];
            const query = interaction.options ? interaction.options.getString('query', true) : "";
            if (!query || query.trim().length < 1) return interaction.respond([{ name: 'Invalid value provided, please provide a track.', value: '' }]);

            const results = await player.search(query);
            if (!results || results.isEmpty()) return interaction.respond([{ name: 'No results found', value: '' }]);
    
            //Returns a list of songs with their title
            return interaction.respond(
                results.tracks.slice(0, 6).map((t) => ({
                    name: trimStringWithDots(t.title, 90),
                    value: t.url
                }))
            );
        } catch (error) {
            return interaction.respond([{ name: 'Invalid value provided, please provide a track.', value: '' }]);
        }
	}
}
