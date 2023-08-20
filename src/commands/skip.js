const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: ['skip'],
    data: new SlashCommandBuilder()
        .setName('skip').setDescription('Skips the current song.'),
    /**
     * 
     * @param {import('discord.js').Message | import('discord.js').CommandInteraction} message 
     */
    async execute(message) {
        /** @type {import('discord-player').Player} */
        const player = message.client['player'];
        const voiceChannel = message.member?.voice?.channel;

        const queue = player.nodes.get(message.guild.id);

        if (!voiceChannel) {
            return message.reply('You are not connected to a voice channel.');
        } else {
            if (queue) {
                if (queue.channel.id !== voiceChannel.id) return message.reply('You must be in the same voice channel before using this command.');
                if (!queue.currentTrack) return message.reply('There are no songs to be skipped.');
                const skippedTrack = queue.currentTrack;

                queue.node.skip();
                return message.reply(`Skipped \`${skippedTrack.title}\``);
            }

            return message.reply('There is no song in the queue.');
        }
    }
}