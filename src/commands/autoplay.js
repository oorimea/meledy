const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
    name: ['autoplay'],
    data: new SlashCommandBuilder()
        .setName('autoplay')
        .setDescription('Activates the autoplay mode, making the queue play indefinitely.'),
    
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
                if (player.voiceChannel !== voiceChannel.id) return message.reply('You must be in the same voice channel before using this command.');

                let response = '';
                switch (player.isAutoplay) {
                    case false:
                        if (player.loop === "none") {
                            await player.autoplay(player);
                            response = 'Autoplay mode has been enabled, the current queue will continue to play indefinitely.';
                        } else response = `The current loop setting \`[${player.loop.toUpperCase()}]\` is conflicting with the autoplay feature.`;
                        break;
                    default:
                        if (player.loop === "none") {
                            await player.autoplay(player);
                            response = 'Autoplay mode has been disabled, the current queue with regular playback.';
                        } else response = `The current loop setting \`[${player.loop.toUpperCase()}]\` is conflicting with the autoplay feature.`;
                        break;
                }

               	return message.reply(response);
            }

            return message.reply('There is no song in the queue.');
        }
    }
}