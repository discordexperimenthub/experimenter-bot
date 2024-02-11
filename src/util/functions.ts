import { CommandMap, SlashCommandMention } from "./types.js";

export function mentionCommand(map: CommandMap, command: string): SlashCommandMention {
    return `</${command}:${map[command].id}>`;
};