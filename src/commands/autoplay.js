const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
	name: ['autoplay'],
    data: new SlashCommandBuilder()
    	.setName('autoplay').setDescription('Activates the autoplay mode, making the queue play indefinitely.'),
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

                let response = '';
                switch (queue.repeatMode) {
                    case 0:
                    case 1:
                    case 2:
                        queue.setRepeatMode(3);
                        response = 'Autoplay mode has been enabled, the current queue will continue to play indefinitely.';
                        break;
                    default:
                        queue.setRepeatMode(0);
                        response = 'Autoplay mode has been disabled, the current queue with regular playback.';
                        break;
                }

               	return message.reply(response);
            }

            return message.reply('There is no song in the queue.');
        }
    }
}
