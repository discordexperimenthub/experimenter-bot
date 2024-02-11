import { EmbedBuilder } from "discord.js";
import { CommandMapCommand } from "./types.js";

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

export class FeatureSetUpSave {
    feature: string;
    lastStep: string;

    setFeature(feature: string): FeatureSetUpSave {
        this.feature = feature;

        return this;
    };

    setLastStep(lastStep: string): FeatureSetUpSave {
        this.lastStep = lastStep;

        return this;
    };

    toEmbed() {
        return new EmbedBuilder()
            .setTitle(this.feature)
            .setDescription(this.lastStep)
            .setFields({
                name: 'Almost done!',
                value: `Now you can save the changes and enable the ${this.feature} feature.`
            });
    };
};

export class FeatureSetUpSuccess {
    feature: string;

    setFeature(feature: string): FeatureSetUpSuccess {
        this.feature = feature;

        return this;
    };

    toEmbed() {
        return new EmbedBuilder()
            .setTitle(this.feature)
            .setDescription(`🎉 Congratulations! The ${this.feature} feature has been successfully set up.`);
    };
};