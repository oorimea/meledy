const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const hhmmss = require('hhmmss');

module.exports = {
    name: ['nowplaying', 'np'],
    data: new SlashCommandBuilder()
        .setName('nowplaying').setDescription('Shows the current song playing.'),
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        /** @type {import('discord-player').Player} */
        const player = message.client['player'];
        const queue = player.nodes.get(message.guild.id);
        
        if (!queue || !queue.currentTrack) return message.reply('There is no song in the queue.');

        return message.reply({
            embeds: [
                new EmbedBuilder().setColor('Blue')
                .setThumbnail(queue.currentTrack.thumbnail)
                .setTitle('Now Playing')
                .setDescription(`${queue.isPlaying() ? queue.currentTrack.title : `⏸ ${queue.currentTrack.title}`} \n\`[${hhmmss(queue.node.getTimestamp().current.value / 1000)} / ${queue.currentTrack.duration}]\``)
            ]
        });
    }
}