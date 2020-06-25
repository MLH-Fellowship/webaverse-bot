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

  if (message.content === '!help') {
    let helpText = '\n';
    client.commands.forEach(c => { helpText += c.name ? `- ${c.help}\n\n` : ''; });
    message.reply(helpText);
    return;
  }

  const commandHandler = client.commands.find(c => c.predicate && c.predicate(message));
  if (commandHandler) return commandHandler.execute(message);

  // If the message hasn't matched any of the command regexes, we must be looking for a `!command`
  if (!message.content.startsWith('!')) return;

  const args = message.content.slice(1).split(/ +/);
  const command = args.shift().toLowerCase();

  if (client.commands.has(command)) {
    client.commands.get(command).execute(message);
  }
});

client.login(process.env.BOT_TOKEN);
