const { SlashCommandBuilder, CommandInteraction, EmbedBuilder } = require('discord.js');
const hhmmss = require('hhmmss');

module.exports = {
    name: ['queue'],
    data: new SlashCommandBuilder()
        .setName('queue')
        .setDescription('Displays the current queued tracks of the server.'),
    
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

                const firstTen = player.queue.slice(0, 10);
                const estimatedQueueDuration = player.queue
                    .filter((track) => track.info.seekable).filter((track) => !track.info.stream)
                    .map((track) => track.info.length)

                const initialTimeLeft = (player.current.info.length - player.position) / 1000;
                const queueTimeLeft = ((estimatedQueueDuration + player.current.info.length) - player.position) / 1000;
                const overallQueue = (estimatedQueueDuration + player.current.info.length);
                let iterator = 0;

                return message.reply({
                    embeds: [
                        new EmbedBuilder().setColor('Blue')
                        .setThumbnail(player.current.info.thumbnail)
                        .setTitle(`Queue for ${message.guild.name}`)
                        .setDescription('*Unseekable and tracks that are in a state of livestream are excluded from the overall duration timestamp.*')
                        .addFields({
                            name: 'Now Playing',
                            value: `${player.current.info.title} \`${position}\``,
                            inline: true
                        },
                        {
                            name: 'Entries',
                            value: `${(player.queue?.size + 1) || 0} tracks`,
                            inline: true
                        },
                        {
                            name: 'Up Next',
                            value: firstTen.length < 1 ? 'There are no songs in the queue.' : firstTen.map((track) => {
                                let totalTime = initialTimeLeft;
                                for (let i = 1; i <= iterator; i++) {
                                    totalTime += player.queue[i]?.info.length / 1000;
                                }
        
                                return `${++iterator}) ${track.title}  \`[${track.duration}]\` \`(${hhmmss(totalTime)} left)\``
                            }).join('\n')
                        })
                        .setFooter({ text: `Overall duration: ${hhmmss(overallQueue / 1000)} | Time left: ${hhmmss(queueTimeLeft)}` })
                    ]
                });
            } else {
                return message.reply('There is no song in the queue..');
            }
        }
    }
}