import { AutocompleteInteraction, ChatInputCommandInteraction, ContextMenuCommandBuilder, SlashCommandBuilder, SlashCommandSubcommandsOnlyBuilder, Snowflake, UserContextMenuCommandInteraction } from "discord.js";
import Database from "../modules/Database.js";

export type CommandData = SlashCommandBuilder | ContextMenuCommandBuilder | SlashCommandSubcommandsOnlyBuilder;

export type SlashCommandExecute = (interaction: ChatInputCommandInteraction, database: Database, commands: CommandMap) => Promise<void>;

export type SlashCommandAutocomplete = (interaction: AutocompleteInteraction, database: Database, commands: CommandMap) => Promise<void>;

export type UserCommandExecute = (interaction: UserContextMenuCommandInteraction, database: Database) => Promise<void>;

export type MessageCommandExecute = (interaction: ChatInputCommandInteraction, database: Database) => Promise<void>;

export type CommandExecute = SlashCommandExecute | UserCommandExecute | MessageCommandExecute;

export interface HomeData {
    set: boolean;
    enabled: boolean;
    channelId: Snowflake;
};

export interface CommandMapCommand {
    id: Snowflake;
    name: string;
    description?: string;
};

export interface CommandMap {
    [name: string]: CommandMapCommand;
};

export type SlashCommandMention = `</${string}:${Snowflake}>`;