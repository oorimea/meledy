const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
    name: ['join'],
    data: new SlashCommandBuilder()
        .setName('join')
        .setDescription('Initiates the bot to join the voice channel you\'re connected to.'),
    
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
                if (!player.connected) player.connect({ deaf: true, voiceChannel: voiceChannel.id });
                if (player.connected && player.voiceChannel === voiceChannel.id) return message.reply('I\'m already connected to the voice channel.');
            } else {
                manager.createConnection({
                    guildId: message.guild.id, voiceChannel: voiceChannel.id,
                    textChannel: message.channel.id, deaf: true
                });

                return message.reply('Connected to the voice channel!');
            }
        }
    }
}