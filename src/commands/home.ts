import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Home from "../modules/features/Home.js";
import { FeatureAlreadySetUp } from "../util/embedPresets.js";
import Command from "../modules/Command.js";

export default new Command()
    .setData(
        new SlashCommandBuilder()
            .setName('home')
            .setDescription('Configure the Home feature.')
            .setDMPermission(false)
            .setDefaultMemberPermissions(PermissionFlagsBits.ManageChannels)
            .addSubcommand(subcommand => subcommand
                .setName('setup')
                .setDescription('Set up the Home feature.')
            )
    )
    .setExecute(async (interaction, database, commands) => {
        await interaction.deferReply({ ephemeral: true });

        const home = new Home(interaction.guild.id, database);

        let subcommand = interaction.options.getSubcommand();

        switch (subcommand) {
            case 'setup': {
                if (home.data.set) {
                    interaction.editReply({
                        embeds: [
                            new FeatureAlreadySetUp()
                                .setFeature('Home')
                                .addSuggestedCommand(commands['home setup'])
                                .toEmbed()
                        ]
                    });

                    return;
                };

                interaction.editReply({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Home')
                            .setDescription("Let's highlight the best moments of your server! Home feature will allow you to set up a channel where the best moments of your server will be highlighted.\n\n*imagine a screenshot of home here*")
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .setComponents(
                                new ButtonBuilder()
                                    .setCustomId('setup_home')
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel("Let's start!")
                            )
                    ]
                });
            };
        };
    });