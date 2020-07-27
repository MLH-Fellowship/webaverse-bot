const fetch = require('node-fetch');

const {BASE_USER_URL, BASE_API_URL} = require('../constants');

const name = 'remove';
const help = 'To remove a package from your inventory, post `!remove [XRPK name] [username]`.';

const execute = async message => {
  const packageName = message.content.slice(1).split(' ')[1];
  const username = message.content.slice(1).split(' ')[2];
  if (!username || !packageName) return message.reply('Incorrect usage.');

  const packageRes = await fetch(`${BASE_API_URL}${packageName}`);
  const packageObj = await packageRes.json();

  if (packageObj.error) {
    return message.reply(`the package "${packageName}" was not found!`);
  }

  const userRes = await fetch(`${BASE_USER_URL}${username}`);
  const userObj = await userRes.json();

  if (userObj.error) {
    return message.reply(`the user "${username}" was not found!`);
  }

  userObj.inventory = userObj.inventory.filter(item => {
    return item.name !== packageName;
  });

  const setRes = await fetch(`${BASE_USER_URL}${username}`, {
    method: 'PUT',
    body: JSON.stringify(userObj),
  });

  const setJson = await setRes.json();
  if (!setJson.ok) {
    console.error(setJson);
    return message.reply(`there was an error removing ${packageName} from ${username}'s inventory`);
  } else {
    message.reply(`Removed "${packageName}" XRPK from Inventory`);
  }
};

module.exports = {name, help, execute};
