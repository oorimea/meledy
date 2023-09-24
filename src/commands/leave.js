const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
    name: ['leave'],
    data: new SlashCommandBuilder()
        .setName('leave')
        .setDescription('Initiates the bot to leave the voice channel that it\'s in.'),
    
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
                if (!player.connected) return message.reply('I\'m currently not connected to any voice channel.');
                if (player.connected && player.voiceChannel !== voiceChannel.id) return message.reply('You must be connected in the same voice channel.');

                player.destroy();
                return message.reply('Disconnected from the voice channel.');
            } else {
                return message.reply('I\'m currently not connected to any voice channel.');
            }
        }
    }
}