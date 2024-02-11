import { Snowflake } from "discord.js";
import { HomeData } from "../../util/types.js";
import Database from "../Database.js";

export default class Home {
    guildId: Snowflake;
    data: HomeData;

    constructor(guildId: Snowflake, database: Database) {
        this.guildId = guildId;
        this.data = database.get(`guilds.${guildId}.home`) || {
            set: false,
            enabled: false,
            channelId: null
        };

        database.set(`guilds.${guildId}.home`, this.data);
    };

    setEnabled(enabled: boolean): void {
        this.data.enabled = enabled;
    };

    setChannel(channelId: Snowflake): void {
        this.data.channelId = channelId;
    };

    setSet(set: boolean): void {
        this.data.set = set;
    };
};