const Discord = require('discord.js');
const config = require('./config.js');
const client = new Discord.Client({
  intents: [
    'DirectMessageTyping',
    'DirectMessages',
    'GuildBans',
    'GuildEmojisAndStickers',
    'GuildMembers',
    'GuildMessageTyping',
    'GuildMessages',
    'GuildPresences',
    'Guilds',
    'MessageContent',
  ],
});
const fs = require('fs');
const api = require('./libs/axios.js');
const logger = require('./utils/logger.js');
const userData = require('./utils/userData.js');

// Handle uncaught exceptions
process.on('uncaughtException', function (error) {
  console.log(error.stack);
});

client.on('debug', (log) => {
  logger(log);
});

// Access to client
client.login(config.botToken);

// Initialize bot
client.on('ready', async () => {
  console.log(`BOT: Logged in as ${client.user.username}`);

  // Set status
  client.user.setStatus('dnd');
  client.user.setActivity('Kendi Dünyanı Yarat!');

  // Initialize User Data
  userData.init();

  // Load Settings
  client.settings = await api.getSettings();

  // Get guild
  client.guild = client.guilds.cache.get(client.settings.guildID);
  if (!client.guild || client.guild === undefined) {
    console.log('BOT: Guild not found.');
  }

  // Load Modules
  const modules = [
    {
      name: 'roleSyncing',
      status: client.settings.roleSyncingStatus,
    },
    {
      name: 'support',
      status: client.settings.ticketStatus,
    },
  ];
  console.log(`BOT: Loading ${modules.length} modules.`);
  let moduleCount = 0;
  modules.map((module) => {
    if (!module.status) return;

    moduleCount++;
    require(`./modules/${module.name}.js`)(client);
  });
  console.log(`BOT: ${moduleCount} modules loaded.`);

  // Load Commands
  const commands = [];
  client.commands = new Discord.Collection();

  const commandFiles = fs
    .readdirSync(`${__dirname}/commands`)
    .filter((file) => file.endsWith('.js'));
  console.log(`BOT: Loading ${commandFiles.length} commands.`);

  commandFiles.map((file) => {
    const cmd = require(`./commands/${file}`);
    client.commands.set(cmd.data.name, cmd);
    commands.push(cmd.data);
  });
  const rest = new Discord.REST({ version: '9' }).setToken(config.botToken);
  rest
    .put(Discord.Routes.applicationCommands(client.user.id), { body: commands })
    .then(() => {
      console.log(`BOT: ${commandFiles.length} commands loaded.`);
    });
});

// Command Handler
client.on('interactionCreate', async (interaction) => {
  if (
    !interaction.isCommand() ||
    !interaction.channel ||
    interaction.channel.type === 'DM'
  )
    return;

  const command = interaction.commandName;
  const cmd = client.commands.get(command);

  if (cmd) {
    cmd.run(client, interaction);
  }
});
