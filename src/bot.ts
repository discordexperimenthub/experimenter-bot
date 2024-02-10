import { APIApplicationCommand, Client, CommandInteraction, Events, GatewayIntentBits, MessageComponentInteraction } from "discord.js";
import { error, info, log } from "./modules/Logger.js";
import { CommandMap } from "./util/types.js";
import { readdirSync } from "fs";
import { RequestMethod, request } from "fetchu.js";
import Collection from "./modules/Collection.js";
import Database from "./modules/Database.js";
import Command from "./modules/Command.js";

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

        switch (component) {
            default: {
                return respondInteraction(interaction, 'This component does not exist.');
            };
        };
    };
});

client.login(process.env.DISCORD_BOT_TOKEN);