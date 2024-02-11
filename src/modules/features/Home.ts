import { Snowflake } from "discord.js";
import { HomeData } from "../../util/types.js";
import Database from "../Database.js";

export default class Home {
    private database: Database;
    private data: HomeData;

    guildId: Snowflake;

    constructor(guildId: Snowflake, database: Database) {
        this.database = database;
        this.guildId = guildId;
        this.data = database.get(`guilds.${guildId}.home`) ?? {
            set: false,
            enabled: false,
            channelId: null
        };

        database.set(`guilds.${guildId}.home`, this.data);
    };

    private save(): void {
        this.database.set(`guilds.${this.guildId}.home`, this.data);
    };

    get isSet(): boolean {
        return this.data.set;
    };

    setEnabled(enabled: boolean): void {
        this.data.enabled = enabled;

        this.save();
    };

    setChannel(channelId: Snowflake): void {
        this.data.channelId = channelId;

        this.save();
    };

    setSet(set: boolean): void {
        this.data.set = set;

        this.save();
    };
};