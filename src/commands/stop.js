const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    name: ['stop', 'clearqueue', 'cq'],
    data: new SlashCommandBuilder()
        .setName('stop').setDescription(`Stops/clears the current queue (does not make the bot not leave the voice channel).`),
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
                    const queueSize = queue.getSize();

                    queue.clear();
                    return message.reply(`The queue has been cleared. \`${queueSize}\` tracks have been removed. 🧼`);
                }
            }

            return message.reply('There is no song in the queue.');
        }
    }
}