const fetch = require('node-fetch');

const {BASE_EDIT_URL, BASE_WORLDS_URL, BASE_IPFS_URL, BASE_INSPECT_URL} = require('../constants');

const name = 'world';
const help = 'To get a summary of a world, post `!world [id]` or the link to the xrpackage.org edit page for the world';
const regex = /xrpackage\.org\/edit\.html\?w=([^\s]+)/;

const predicate = message => message.content.match(regex);

const execute = async message => {
  const match = message.content.match(regex);
  const worldId = match ? match[1].trim() : message.content.slice(1).split(' ')[1];

  if (!worldId) return message.reply('No world ID was found in your message!');

  const res = await fetch(`${BASE_WORLDS_URL}${worldId}`);
  const apiResponse = await res.json();

  let objectsList = '';
  apiResponse.objects.forEach(object => {
    objectsList += `- [${object.name}](${BASE_INSPECT_URL}?p=${object.name})\n`;
  });

  message.channel.send({
    embed: {
      title: `"${apiResponse.name}" world`,
      description: `**Objects in world** (${apiResponse.objects.length}):\n${objectsList}`,
      url: `${BASE_EDIT_URL}?w=${worldId}`,
      fields: [
        {name: 'description', value: apiResponse.description},
        {name: 'scene download', value: `${BASE_IPFS_URL}${apiResponse.hash}.wbn`},
        {name: 'hash', value: apiResponse.hash},
      ],
      image: {url: `${BASE_IPFS_URL}${apiResponse.previewIconHash}.gif`},
    },
  });
};

module.exports = {name, help, predicate, execute};
