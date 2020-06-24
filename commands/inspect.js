const fetch = require('node-fetch');

const {BASE_INSPECT_URL, BASE_IPFS_URL, BASE_API_URL} = require('../constants');

const name = 'inspect';
const help = 'To get a summary of an XRPK, post `!inspect [name]` or the link to the XRPK';
const regex = /xrpackage\.org\/inspect\.html\?p=([^\s]+)/;

async function execute(message, args) {
  const [packageName] = args;
  if (!packageName) return message.reply('No XRPK name was found in your message!');

  const res = await fetch(`${BASE_API_URL}${packageName}`);
  const apiResponse = await res.json();

  message.channel.send({
    embed: {
      title: `"${packageName}" XRPK`,
      url: `${BASE_INSPECT_URL}?p=${packageName}`,
      fields: [{
        name: 'type',
        value: apiResponse.description,
      }, {
        name: 'name',
        value: packageName,
      }, {
        name: 'hash',
        value: apiResponse.dataHash,
      }],
      image: {
        url: `${BASE_IPFS_URL}${apiResponse.icons[0].hash}.gif`,
      },
    },
  });
}

module.exports = {name, help, regex, execute};
