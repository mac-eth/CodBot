const fs = require("fs");
const chalk = require("chalk");
const { Client, Collection, Intents } = require("discord.js");
const { REST } = require("@discordjs/rest");
const { Routes } = require("discord-api-types/v9");

const dotenv = require("dotenv");
dotenv.config();

const token = process.env.TOKEN;
const client_id = process.env.CLIENT_ID;
const test_guild_id = process.env.TEST_GUILD_ID;

const client = new Client({
  intents: [
    Intents.FLAGS.GUILDS,
    Intents.FLAGS.GUILD_MEMBERS,
    Intents.FLAGS.GUILD_BANS,
    Intents.FLAGS.GUILD_EMOJIS_AND_STICKERS,
    Intents.FLAGS.GUILD_INVITES,
    Intents.FLAGS.GUILD_VOICE_STATES,
    Intents.FLAGS.GUILD_MESSAGES,
    Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
  ],
});

const eventFolders = fs.readdirSync("./events");

for (const folder of eventFolders) {
  const eventFiles = fs
    .readdirSync(`./events/${folder}`)
    .filter((file) => file.endsWith(".js"));
  for (const file of eventFiles) {
    const event = require(`./events/${folder}/${file}`);
    if (event.once) {
      client.once(event.name, (...args) => event.execute(...args, client));
    } else {
      client.on(
        event.name,
        async (...args) => await event.execute(...args, client)
      );
    }
  }
}
console.log(chalk.greenBright("✅ Successfully registered 'Events'."));

client.slashCommands = new Collection();

const slashCommands = fs.readdirSync("./commands");

for (const module of slashCommands) {
  const commandFiles = fs
    .readdirSync(`./commands/${module}`)
    .filter((file) => file.endsWith(".js"));

  for (const commandFile of commandFiles) {
    const command = require(`./commands/${module}/${commandFile}`);
    client.slashCommands.set(command.data.name, command);
  }
}
console.log(
  chalk.greenBright("✅ Successfully registered 'application (/) commands'.")
);

const rest = new REST({ version: "9" }).setToken(token);

const commandJsonData = [
  ...Array.from(client.slashCommands.values()).map((c) => c.data.toJSON()),
];

(async () => {
  try {
    await rest.put(
      /**
       * By default, you will be using guild commands during development.
       * Once you are done and ready to use global commands (which have 1 hour cache time),
       * 1. Please uncomment the below (commented) line to deploy global commands.
       * 2. Please comment the below (uncommented) line (for guild commands).
       */

      Routes.applicationGuildCommands(client_id, test_guild_id),

      /**
       * Good advice for global commands, you need to execute them only once to update
       * your commands to the Discord API. Please comment it again after running the bot once
       * to ensure they don't get re-deployed on the next restart.
       */

      // Routes.applicationGuildCommands(client_id)

      { body: commandJsonData }
    );

    console.log(
      chalk.greenBright("✅ Successfully reloaded 'application (/) commands'.")
    );
  } catch (error) {
    console.error(error);
  }
})();

client.login(token);
