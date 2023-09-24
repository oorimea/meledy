const { SlashCommandBuilder, CommandInteraction } = require('discord.js');

module.exports = {
    name: ['loop'],
    data: new SlashCommandBuilder()
        .setName('loop')
        .setDescription('Activates the loop mode, making the current track or queue repeat indefinitely.')
        .addStringOption((input) => input.setName('type').setDescription('The loop type to set for the current queue.')
            .setRequired(false).setChoices(
                { name: 'none', value: 'none' }, { name: 'track', value: 'track' },
                { name: 'queue', value: 'queue' }
            )
        ),
    
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

        const loopArgs = message instanceof CommandInteraction ? message.options.get('type', false)?.value : args[0]?.toLowerCase() ?? null;

        if (!voiceChannel) {
            return message.reply('You are not connected to a voice channel.');
        } else {
            if (player) {
                if (player.voiceChannel !== voiceChannel.id) return message.reply('You must be in the same voice channel before using this command.');

                let response = '';
                if (loopArgs) {
                    switch (loopArgs) {
                        case "none":
                        case "track":
                        case "queue":
                            if (loopArgs !== player.loop) {
                                await player.setLoop(loopArgs);
                                response = `Loop type has been set to \`${loopArgs.toUpperCase()}\`.`;
                            } else response = `Loop type is already set to \`${loopArgs.toUpperCase()}\`.`;
                            break;

                        case "help":
                        default:
                            response = 'The available loop types are `track`, `queue`, and `none`.';
                            break;
                    }
                } else {
                    switch (player.loop) {
                        case "none":
                            await player.setLoop("track");
                            response = 'Loop type has been set to `TRACK`, the current track will continue to play indefinitely.';
                            break;
                        case "track":
                            await player.setLoop("queue");
                            response = 'Loop type has been set to `QUEUE`,  the current queue will continue to play indefinitely.';
                        default:
                            await player.setLoop("none");
                            response = 'Loop type has been set to `NONE`,  the current queue will continue until no songs are left.';
                            break;
                    }
                }

               	return message.reply(response);
            }

            return message.reply('There is no song in the queue.');
        }
    }
}