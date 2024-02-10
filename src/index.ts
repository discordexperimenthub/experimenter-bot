import { ShardingManager } from "discord.js";
import { config } from "dotenv";
import { info } from "./modules/Logger.js";

config();

const manager = new ShardingManager('dist/bot.js', {
    token: process.env.DISCORD_BOT_TOKEN
});

manager.on('shardCreate', shard => info(`Launched shard ${shard.id}`));

manager.spawn();