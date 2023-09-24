const { SlashCommandBuilder, CommandInteraction, EmbedBuilder } = require('discord.js');
const hhmmss = require('hhmmss');

module.exports = {
    name: ['nowplaying'],
    data: new SlashCommandBuilder()
        .setName('nowplaying')
        .setDescription('Displays the title of the current song playing.'),
    
    /**
     * 
     * @param {import('discord.js').Message | CommandInteraction} message 
     * @param {string[]} args 
     */
    async execute(message, args) {
        /** @type {import('riffy').Riffy} */
        const manager = message.client['riffy'];
        const player = manager.players.get(message.guild.id);
        /** @type {import('discord.js').VoiceChannel} */
        const voiceChannel = message.member?.voice?.channel;

        if (!voiceChannel) {
            return message.reply('You are not connected to a voice channel.');
        } else {
            if (player) {
                if (!player.current) return message.reply('There is no song in the queue at the moment.');
                const position = player.current.info.stream ? player.current.info.seekable ? '[UNKNOWN]' : '[LIVESTREAM]' :
                    `[${hhmmss(player.position / 1000)} / ${hhmmss(player.current.info.length / 1000)}]`;

                return message.reply({
                    embeds: [
                        new EmbedBuilder().setColor('Blue')
                        .setThumbnail(player.current.info.thumbnail)
                        .setTitle('Now Playing')
                        .setDescription(`${player.current.info.title} \`${position}\``)
                    ]
                });
            } else {
                return message.reply('There is no song in the queue..');
            }
        }
    }
}