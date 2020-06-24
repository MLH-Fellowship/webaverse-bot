const fs = require('fs');
const dotenv = require('dotenv');
const {Client, Collection} = require('discord.js');
dotenv.config();

const client = new Client();
client.commands = new Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => console.log('Client ready'));

client.on('message', message => {
  // Ignore messages from the bot itself
  if (message.author.bot) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();

  if (command === 'help') {
    let helpText = '\n';
    client.commands.forEach(c => {
      if (!c.name) return;
      helpText += `!${c.name} => ${c.description}\n`;
    });
    message.reply(helpText);
    return;
  }

  // Find command handler for regex-commands
  // Store the match so we don't have to re-perform the regex match inside the handler
  let commandHandler;
  let match;
  for (const handler of client.commands.value()) {
    if (!handler.regex) continue;
    match = message.content.match(handler.regex);
    if (match) {
      commandHandler = handler;
      break;
    }
  }

  if (commandHandler && match) {
    commandHandler.execute(message, match[1].trim());
  } else if (client.commands.has(command)) {
    client.commands.get(command).execute(message, args);
  }
});

client.login(process.env.BOT_TOKEN);
