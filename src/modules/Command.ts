import { CommandData, CommandExecute, SlashCommandAutocomplete } from "../util/types.js";

export default class Command {
    data: CommandData;
    execute: CommandExecute;
    autocomplete?: SlashCommandAutocomplete;

    constructor() { };

    setData(data: CommandData): Command {
        this.data = data;

        return this;
    };

    setExecute(execute: CommandExecute): Command {
        this.execute = execute;

        return this;
    };

    setAutocomplete(autocomplete: SlashCommandAutocomplete): Command {
        this.autocomplete = autocomplete;

        return this;
    };
};