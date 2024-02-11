import { EmbedBuilder } from "discord.js";
import { CommandMap, CommandMapCommand } from "./types.js";
import { mentionCommand } from "./functions.js";

export class FeatureAlreadySetUp {
    commandMap: CommandMap;
    feature: string;
    suggestedCommands: string[];

    constructor(commandMap: CommandMap) {
        this.commandMap = commandMap;
    };

    setFeature(feature: string): FeatureAlreadySetUp {
        this.feature = feature;

        return this;
    };

    addSuggestedCommand(...commands: string[]): FeatureAlreadySetUp {
        this.suggestedCommands = commands;

        return this;
    };

    toEmbed() {
        return new EmbedBuilder()
            .setTitle(this.feature)
            .setDescription(`This feature has already been set up. If you want to change the settings, here is what you can do:\n\n${this.suggestedCommands.map(command => `- **${mentionCommand(this.commandMap, command)}:** ${this.commandMap[command].description}`).join(`\n`)}`);
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

export class FeatureReset {
    feature: string;

    setFeature(feature: string): FeatureReset {
        this.feature = feature;

        return this;
    };

    toEmbed() {
        return new EmbedBuilder()
            .setTitle(this.feature)
            .setDescription(`Resetting a feature will delete all the settings and data. Are you sure you want to reset the ${this.feature} feature? **This action cannot be undone.**`);
    };
};

export class FeatureResetSuccess {
    feature: string;

    setFeature(feature: string): FeatureResetSuccess {
        this.feature = feature;

        return this;
    };

    toEmbed() {
        return new EmbedBuilder()
            .setTitle(this.feature)
            .setDescription(`The ${this.feature} feature has been reset.`);
    };
};