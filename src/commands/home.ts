import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
import Home from "../modules/features/Home.js";
import { FeatureAlreadySetUp, FeatureReset } from "../util/embedPresets.js";
import Command from "../modules/Command.js";
import { mentionCommand } from "../util/functions.js";

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
            .addSubcommand(subcommand => subcommand
                .setName('toggle')
                .setDescription('Toggle the Home feature.')
                .addBooleanOption(option => option
                    .setName('enabled')
                    .setDescription('Enable or disable the Home feature.')
                    .setRequired(true)
                )
            )
            .addSubcommand(subcommand => subcommand
                .setName('reset')
                .setDescription('Reset the Home feature.')
            )
            .addSubcommand(subcommand => subcommand
                .setName('channel')
                .setDescription('Set the Home channel.')
                .addChannelOption(option => option
                    .setName('channel')
                    .setDescription('Please select a channel where the best moments of your server will be highlighted.')
                    .setRequired(true)
                )
            )
    )
    .setExecute(async (interaction, database, commands) => {
        await interaction.deferReply({ ephemeral: true });

        const home = new Home(interaction.guild.id, database);

        let subcommand = interaction.options.getSubcommand();

        if (subcommand === 'setup') {
            if (home.isSet) {
                interaction.editReply({
                    embeds: [
                        new FeatureAlreadySetUp(commands)
                            .setFeature('Home')
                            .addSuggestedCommand('home toggle', 'home channel')
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
        } else {
            if (!home.isSet) {
                interaction.editReply(`You need to set up the Home feature first. Use the ${mentionCommand(commands, 'home setup')} to do so.`);

                return;
            };

            switch (subcommand) {
                case 'toggle': {
                    let enabled = interaction.options.getBoolean('enabled');

                    home.setEnabled(enabled);
                    interaction.editReply(`The Home feature has been ${enabled ? 'enabled' : 'disabled'}.`);

                    return;
                };
                case 'reset': {
                    interaction.editReply({
                        embeds: [
                            new FeatureReset()
                                .setFeature('Home')
                                .toEmbed()
                        ],
                        components: [
                            new ActionRowBuilder<ButtonBuilder>()
                                .setComponents(
                                    new ButtonBuilder()
                                        .setCustomId('reset_home')
                                        .setStyle(ButtonStyle.Danger)
                                        .setLabel('Reset Home')
                                )
                        ]
                    });

                    break;
                };
                case 'channel': {
                    let channel = interaction.options.getChannel('channel');

                    home.setChannel(channel.id);
                    interaction.editReply(`The Home channel has been set as <#${channel.id}>.`);

                    break;
                };
                default: {
                    interaction.editReply('This subcommand is not available.');

                    return;
                };
            };
        };
    });