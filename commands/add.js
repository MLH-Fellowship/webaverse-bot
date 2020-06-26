const fetch = require('node-fetch');

const {BASE_INSPECT_URL, BASE_IPFS_URL, BASE_API_URL} = require('../constants');

const name = 'add';
const help = 'To add a package to your inventory, post `!add [name]`.';

const execute = async message => {
    const packageName = message.content.slice(1).split(' ')[1];

    if (!packageName) return message.reply('No XRPK name was found in your message!');

    const res = await fetch(`${BASE_API_URL}${packageName}`);
    const apiResponse = await res.json();

    message.channel.send({
        embed: {
            title: `Added "${packageName}" XRPK to Inventory`,
            url: `${BASE_INSPECT_URL}?p=${packageName}`,
            image: {
                url: `${BASE_IPFS_URL}${apiResponse.icons[0].hash}.gif`,
            },
        },
    });
};

module.exports = {name, help, execute};
