const { EmbedBuilder, SlashCommandBuilder } = require('discord.js');
const hhmmss = require('hhmmss');

module.exports = {
    name: ['queue', 'q'],
    data: new SlashCommandBuilder()
        .setName('queue').setDescription('Displays the current queue.'),
    /**
     * 
     * @param {import('discord.js').Message | import('discord.js').CommandInteraction} message 
     */
    async execute(message) {
        /** @type {import('discord-player').Player} */
        const player = message.client['player'];
        const queue = player.nodes.get(message.guild.id);
        
        if (!queue || !queue.currentTrack) return message.reply('There is no song in the queue.');
        const firstTen = queue.tracks.toArray().slice(0, 10);

        const initialTimeLeft = (queue.currentTrack.durationMS - queue.node.getTimestamp().current.value) / 1000;
        const queueTimeLeft = ((queue.estimatedDuration + queue.currentTrack.durationMS) - queue.node.getTimestamp().current.value) / 1000;
        const overallQueue = ((queue.estimatedDuration + queue.currentTrack.durationMS));
        let iterator = 0;

        return message.reply({
            embeds: [
                new EmbedBuilder().setColor('Blue')
                .setThumbnail(queue.currentTrack.thumbnail)
                .setTitle(`Queue for ${message.guild.name}`)
                .addFields({
                    name: 'Now Playing',
                    value: `${queue.currentTrack.title} \`[${hhmmss(queue.node.getTimestamp().current.value / 1000)} / ${queue.currentTrack.duration}]\``,
                    inline: true
                },
                {
                    name: 'Entries',
                    value: `${queue?.tracks?.size || 0} tracks`,
                    inline: true
                },
                {
                    name: 'Up Next',
                    value: firstTen.length < 1 ? 'There are no songs in the queue.' : firstTen.map((track) => {
                        let totalTime = initialTimeLeft;
                        for (let i = 1; i <= iterator; i++) {
                            totalTime += queue.tracks.toArray()[i]?.durationMS / 1000;
                        }

                        return `${++iterator}. ${track.title}  \`[${track.duration}]\` \`(${hhmmss(totalTime)} left)\``
                    }).join('\n')
                })
                .setFooter({ text: `Overall duration: ${hhmmss(overallQueue / 1000)} | Time left: ${hhmmss(queueTimeLeft)}` })
            ]
        })
    }
}