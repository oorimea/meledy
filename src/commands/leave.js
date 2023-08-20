const { SlashCommandBuilder } = require('@discordjs/builders');

module.exports = {
    name: ['leave', 'disconnect'],
    data: new SlashCommandBuilder()
        .setName('leave').setDescription('Make the bot leave the voice channel.'),
    /**
     * 
     * @param {import('discord.js').Message} message 
     */
    async execute(message) {
        /** @type {import('discord-player').Player} */
        const player = message.client['player'];
        const queue = player.nodes.get(message.guild.id);
        const voiceChannel = message.member?.voice?.channel;

        if (!voiceChannel) {
            return message.reply('You are not connected to a voice channel.');
        } else {
            if (queue) {
                if (queue.channel.id !== voiceChannel.id) return message.reply('You must be in the same voice channel before using this command.');
                if (voiceChannel.members.size > 1) {
                    if (!message.member.permissions.has('ModerateMembers')) return message.reply('Insufficient permissions, requires the `ModerateMembers` permission node.');

                    queue.delete();
                    return message.reply('I have left the voice channel... Music playback has stopped. 👋');
                }
            }

            return message.reply('There is no song in the queue.');
        }
    }
}