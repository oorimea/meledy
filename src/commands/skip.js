const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
    name: ['skip'],
    data: new SlashCommandBuilder()
        .setName('skip')
        .setDescription('Proceeds to the next song in the queue.'),
    
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
                if (player.voiceChannel !== voiceChannel.id) return message.reply('You must be in the same voice channel before using this command.');

                player.stop();
               	return message.reply(`Skipped!`);
            }

            return message.reply('There is no song in the queue.');
        }
    }
}