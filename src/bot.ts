import { APIApplicationCommand, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelSelectMenuBuilder, ChannelSelectMenuInteraction, ChannelType, Client, CommandInteraction, EmbedBuilder, Events, GatewayIntentBits, MessageComponentInteraction, OverwriteType } from "discord.js";
import { error, info, log } from "./modules/Logger.js";
import { CommandMap } from "./util/types.js";
import { readdirSync } from "fs";
import { RequestMethod, request } from "fetchu.js";
import Collection from "./modules/Collection.js";
import Database from "./modules/Database.js";
import Command from "./modules/Command.js";
import Home from "./modules/features/Home.js";
import { mentionCommand } from "./util/functions.js";
import { FeatureSetUpSave, FeatureSetUpSuccess } from "./util/embedPresets.js";

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.MessageContent
    ]
});
const database = new Database('database.json');
const commands = new Collection<string, Command>();

let commandFiles = readdirSync('dist/commands').filter(file => file.endsWith('.js'));

for (let file of commandFiles) {
    const command: Command = (await import(`./commands/${file}`)).default;

    commands.set(command.data.name, command);
};

let commandMap: CommandMap = {};

client.on(Events.ClientReady, async () => {
    info(`Logged in as ${client.user.tag}`);

    const response: APIApplicationCommand[] = (await request({
        url: `https://canary.discord.com/api/v10/applications/${client.user.id}/commands`,
        method: RequestMethod.Put,
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`
        },
        body: commands.map(command => command.data.toJSON())
    }, {
        isOk: response => log(`Registered ${(response.body as unknown as APIApplicationCommand[]).length} commands.`),
        isNotOk: response => error(`Failed to register commands: ${response.status} ${response.statusText}`)
    })).body;

    for (let command of response) {
        if (command.options?.length > 0) {
            for (let option of command.options) commandMap[`${command.name} ${option.name}`] = {
                id: command.id,
                name: `${command.name} ${option.name}`,
                description: option.description
            };
        } else commandMap[command.name] = {
            id: command.id,
            name: command.name,
            description: command.description
        };
    };
});

async function respondInteraction(interaction: CommandInteraction | MessageComponentInteraction, message: string) {
    await interaction.reply({
        content: message,
        ephemeral: true
    }).catch(() => interaction.editReply(message));
};

client.on(Events.InteractionCreate, async interaction => {
    if (interaction.isCommand()) {
        const command = commands.get(interaction.commandName);

        if (!command) return respondInteraction(interaction, 'This command does not exist.');

        try {
            await command.execute(interaction as never, database, commandMap);
        } catch (err) {
            await respondInteraction(interaction, 'There was an error while executing this command.');

            error(err);
        };
    } else if (interaction.isMessageComponent()) {
        let component = interaction.customId;

        const home = new Home(interaction.guildId, database);

        switch (component) {
            case 'setup_home': {
                interaction.update({
                    embeds: [
                        new EmbedBuilder()
                            .setTitle('Home')
                            .setFields(
                                {
                                    name: 'Home Channel',
                                    value: 'Please select a channel where the best moments of your server will be highlighted.'
                                },
                                {
                                    name: 'Protip',
                                    value: `You can change this later by using the ${'**/home channel (not added yet)**' /*mentionCommand(commandMap, 'home channel')*/} command.`
                                }
                            )
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .setComponents(
                                new ButtonBuilder()
                                    .setCustomId('setup_home_create_channel')
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel('Create one for me!')
                            ),
                        new ActionRowBuilder<ChannelSelectMenuBuilder>()
                            .setComponents(
                                new ChannelSelectMenuBuilder()
                                    .setCustomId('setup_home_channel')
                                    .setPlaceholder('Or select a channel...')
                                    .setChannelTypes(ChannelType.GuildText)
                            )
                    ]
                });

                break;
            };
            case 'setup_home_create_channel': {
                if (!interaction.appPermissions.has('ManageChannels')) return respondInteraction(interaction, 'I need the **Manage Channels** permission to create a channel.');

                const channel = await interaction.guild.channels.create({
                    name: 'home',
                    type: ChannelType.GuildText,
                    topic: 'The best moments of your server will be highlighted here.',
                    permissionOverwrites: [
                        {
                            type: OverwriteType.Role,
                            id: interaction.guild.id,
                            allow: ['ViewChannel'],
                            deny: ['SendMessages']
                        },
                        {
                            type: OverwriteType.Member,
                            id: client.user.id,
                            allow: ['SendMessages']
                        }
                    ]
                }).catch(err => {
                    error(err);

                    respondInteraction(interaction, 'Uh, oh! There was an error while creating the channel. Please try again later.');
                });

                if (!channel) return;

                home.setChannel(channel.id);

                interaction.update({
                    embeds: [
                        new FeatureSetUpSave()
                            .setFeature('Home')
                            .setLastStep(`The home channel has been created as <#${channel.id}>.`)
                            .toEmbed()
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .setComponents(
                                new ButtonBuilder()
                                    .setCustomId('save_and_enable_home')
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel('Save Changes and Enable'),
                                new ButtonBuilder()
                                    .setCustomId('save_home')
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel('Save Changes')
                            )
                    ]
                });

                break;
            };
            case 'setup_home_channel': {
                let channel = (interaction as ChannelSelectMenuInteraction).channels.first();

                const original = await interaction.guild.channels.fetch(channel.id);

                if (!original.permissionsFor(client.user.id).has('ViewChannel')) return respondInteraction(interaction, 'I need the **View Channel** permission to use this channel.');
                if (!original.permissionsFor(client.user.id).has('SendMessages')) return respondInteraction(interaction, 'I need the **Send Messages** permission to use this channel.');

                home.setChannel(channel.id);

                interaction.update({
                    embeds: [
                        new FeatureSetUpSave()
                            .setFeature('Home')
                            .setLastStep(`The home channel has been set as <#${channel.id}>.`)
                            .toEmbed()
                    ],
                    components: [
                        new ActionRowBuilder<ButtonBuilder>()
                            .setComponents(
                                new ButtonBuilder()
                                    .setCustomId('save_and_enable_home')
                                    .setStyle(ButtonStyle.Success)
                                    .setLabel('Save Changes and Enable'),
                                new ButtonBuilder()
                                    .setCustomId('save_home')
                                    .setStyle(ButtonStyle.Primary)
                                    .setLabel('Save Changes')
                            )
                    ]
                });

                break;
            };
            default: {
                if (['save_and_enable_home', 'save_home'].includes(component)) {
                    home.setSet(true);

                    if (component === 'save_and_enable_home') home.setEnabled(true);

                    interaction.update({
                        embeds: [
                            new FeatureSetUpSuccess()
                                .setFeature('Home')
                                .toEmbed()
                        ],
                        components: []
                    });
                } else return respondInteraction(interaction, 'This component does not exist.');
            };
        };
    };
});

client.login(process.env.DISCORD_BOT_TOKEN);