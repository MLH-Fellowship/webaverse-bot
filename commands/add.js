const fetch = require('node-fetch');

const {BASE_USER_URL, BASE_API_URL} = require('../constants');

const name = 'add';
const help = 'To add a package to your inventory, post `!add [XRPK name] [username]`.';

const execute = async message => {
  const packageName = message.content.slice(1).split(' ')[1];
  const username = message.content.slice(1).split(' ')[2];
  if (!username || !packageName) return message.reply('no XRPK name or username found!');

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

  userObj.inventory.push({
    name: packageObj.name,
    dataHash: packageObj.dataHash,
    iconHash: packageObj.icons.find(i => i.type === 'image/gif').hash,
  });

  const setRes = await fetch(`${BASE_USER_URL}${username}`, {
    method: 'PUT',
    body: JSON.stringify(userObj),
  });

  const setJson = await setRes.json();
  if (!setJson.ok) {
    console.error(setJson);
    return message.reply(`there was an error adding ${packageName} to ${username}'s inventory`);
  } else {
    message.reply(`Added "${packageName}" XRPK from Inventory`);
  }
};

module.exports = {name, help, execute};
