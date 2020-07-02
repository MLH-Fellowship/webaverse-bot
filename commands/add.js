const fetch = require('node-fetch');

const {BASE_INSPECT_URL, BASE_IPFS_URL, BASE_API_URL} = require('../constants');

const name = 'add';
const help = 'To add a package to your inventory, post `!add [package] [username]`.';

const execute = async message => {
    const packageName = message.content.slice(1).split(' ')[1];
    const username = message.content.slice(1).split(' ')[2];
    if (!username || !packageName) { return message.reply('Incorrect usage.') };

    const packageRes = await fetch(`${BASE_API_URL}${packageName}`);
    const packageObj = await packageRes.json();

    if (packageObj.error) {
        throw new Error(packageRes.status);
        return message.reply('No XRPK name was found!');
    }

    const userRes = await fetch(`${BASE_USER_URL}${username}`);
    const userObj = await userRes.json();

    if (userObj.error) {
        throw new Error(userRes.status)
        return message.reply('No user was found!');
    }

    userObj.inventory.push({ packageObj });
    console.log(userObj.inventory);

    message.reply(`Added "${packageName}" XRPK from Inventory`);
};

module.exports = {name, help, execute};
