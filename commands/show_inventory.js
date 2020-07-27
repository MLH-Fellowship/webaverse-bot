const fetch = require('node-fetch');

const name = 'inventory';

const {
  BASE_USER_URL,
  BASE_INSPECT_URL,
} = require('../constants');

const help =
  'To view augs in your inventory, type `!inventory [username]`.';
const predicate = message => message.content.startsWith('!inventory') && message.attachments.size === 0;

const execute = async (message) => {
  const args = message.content.split(' ').slice(1);
  const [username] = args;
  if (!username) return message.reply('please enter a username!');

  const res = await fetch(`${BASE_USER_URL}${username}`);
  const resp = await res.json();

  if (resp.error) {
    return message.reply(`unable to find a user named \`${username}\`.`);
  }
  // For each inventory item, reply with the item name and xrpackage link
  resp.inventory.forEach((element, i) => {
    message.channel.send({
      embed: {
        title: `${username} Inventory - ${element.name}`,
        url: `${BASE_INSPECT_URL}?p=${element.name}`,
        fields: [{
          name: 'hash',
          value: element.hash,
        }],
      },
    });
  });
};

module.exports = {name, help, predicate, execute};
