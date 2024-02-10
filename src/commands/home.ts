import { PermissionFlagsBits, SlashCommandBuilder } from "discord.js";
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
            };
        };
    });