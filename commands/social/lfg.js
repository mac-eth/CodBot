const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageEmbed } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lfg')
        .setDescription('Creates a LFG post in the LFG channel')
        .addStringOption((option) =>
        option
            .setName('message')
            .setDescription('The message you want to send')    
            .setRequired(true)
    ),
    
    async execute(interaction) {

        const notInVoiceChannelEmbed = new MessageEmbed()
            .setColor('RED')
            .setTitle('You must be in a Voice Channel To do this Command!')

        const message = interaction.options.getString('message');

        if (interaction.member.voice.channel == null) {
            interaction.reply({ embeds: [notInVoiceChannelEmbed], ephemeral: true});
        }

        else {
            const voiceChannelUserArray = Array.from(interaction.member.voice.channel.members);
            const usersNeeded = 4 - voiceChannelUserArray.length;

            const voiceChannelId = interaction.member.voice.channel.id;
            const voiceChannelName = interaction.member.voice.channel.name;
            const cachedVoiceChannelId = interaction.client.channels.cache.get(voiceChannelId);

            const userIds = [];
            for (let i = 0; i < voiceChannelUserArray.length; i++) {
                userIds.push(voiceChannelUserArray[i][0]);
            }
            const mappedCachedUserIds = userIds.map(id => ` <@${id}>`);

            const lfgEmbed = new MessageEmbed()
                .setColor('BLUE')
                .setDescription(`**${cachedVoiceChannelId} | LF${usersNeeded}**`)
                .setThumbnail(interaction.user.avatarURL())
                .addFields(
                    { name: 'Members in Voice:', value: `${mappedCachedUserIds}`,},
                    { name: '\u200b', value: '```'+`${message}` + '```'},
                    { name: `\u200b`, value: `**[Click to Join ${voiceChannelName}](https://discord.com/channels/${interaction.member.guild.id}/${voiceChannelId})**`},
                )


            interaction.reply({ embeds: [lfgEmbed] });
        }
    },
};
