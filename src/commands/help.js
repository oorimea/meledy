const { SlashCommandBuilder, EmbedBuilder } = require('@discordjs/builders');

module.exports = {
    name: ['help', 'commands'],
    data: new SlashCommandBuilder()
        .setName('help').setDescription('Show the list of available commands.'),

    async execute(message) {
        return message.reply({
            embeds: [new EmbedBuilder()
                .setColor(0x4437db).setTitle(`${message.client.user.username}'s Available Commands`)
                .setDescription('In this way, you will not get confused whether you\'re using the right prefix for the bot or not.')
                .addFields([{
                    name: '[!autoplay] or /autoplay', value: 'Activates the autoplay mode, making the queue play indefinitely.', inline: false
                }, {
                    name: '[!help | !commands] or `/help`', value: 'Show the list of available commands.', inline: false
                }, {
                    name: '[!leave | !disconnect] or `/leave`', value: 'Make the bot leave the voice channel.', inline: false
                }, {
                    name: '[!nowplaying | !np] or `/nowplaying`', value: 'Shows the current song playing.', inline: false
                }, {
                    name: '[!play (url/title) | !p (url/title)] or `/play (url/title)`', value: 'Play a song by providing its title or URL.', inline: false
                }, {
                    name: '[!queue | !q] or `/queue`', value: 'Displays the current queue.', inline: false
                }, {
                    name: '[!skip] or `/skip`', value: 'Skips the current song.', inline: false
                }, {
                    name: '[!stop | !clearqueue | !cq] or `/stop`', value: 'Stops/clears the current queue (does not make the bot not leave the voice channel).', inline: false
                }])
                     .setThumbnail(message.client.user.displayAvatarURL())
                     .setTimestamp()
            ]
        });
    }
}
