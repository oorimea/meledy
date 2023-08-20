const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
	name: ['loop', 'repeat'],
    data: new SlashCommandBuilder()
    	.setName('loop').setDescription('Activates the loop mode, making the current track or queue repeat indefinitely.'),
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
                        queue.setRepeatMode(2);
                        response = 'Queue repeat mode set to `queue`, the current queue playing will continuously repeat.';
                        break;
                    case 2:
                        queue.setRepeatMode(1);
                        response = 'Queue repeat mode set to `track`, the current playing track will continuously repeat.';
                        break;
                    case 1:
                        queue.setRepeatMode(0);
                        response = 'Queue repeat mode set to `off`, the current queue will proceed with regular playback.';
                        break;
                }

               	return message.reply(response);
            }

            return message.reply('There is no song in the queue.');
        }
    }
}