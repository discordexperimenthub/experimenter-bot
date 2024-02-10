import { EmbedBuilder } from "discord.js";
import { CommandMapCommand } from "../util/types.js";

export class FeatureAlreadySetUp {
    feature: string;
    suggestedCommands: CommandMapCommand[];

    setFeature(feature: string): FeatureAlreadySetUp {
        this.feature = feature;

        return this;
    };

    addSuggestedCommand(...commands: CommandMapCommand[]): FeatureAlreadySetUp {
        this.suggestedCommands = commands;

        return this;
    };

    toEmbed() {
        return new EmbedBuilder()
            .setTitle(this.feature)
            .setDescription(`This feature has already been set up. If you want to change the settings, here is what you can do:\n\n${this.suggestedCommands.map(command => `- **</${command.name}:${command.id}>:** ${command.description}`).join(`\n`)}`);
    };
};