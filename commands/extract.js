const fetch = require('node-fetch');

const {extract} = require('../utils');

const {BASE_INSPECT_URL, BASE_IPFS_URL, BASE_API_URL} = require('../constants');

const name = 'extract';
const help = 'To get a list of files in an XRPK, post `!extract [name]` or `!extract [link to the XRPK on xrpackage.org]`';
const regex = /xrpackage\.org\/inspect\.html\?p=([^\s]+)/;

const predicate = message => message.content.match(regex) && message.content.startsWith('!extract');

const execute = async message => {
  const match = message.content.match(regex);
  const packageName = match ? match[1].trim() : message.content.slice(1).split(' ')[1];

  if (!packageName) return message.reply('No XRPK name was found in your message!');

  const res = await fetch(`${BASE_API_URL}${packageName}`);
  const apiResponse = await res.json();
  const hash = apiResponse.dataHash;

  const resp = await fetch(`${BASE_IPFS_URL}${hash}.wbn`);
  const buffer = await resp.buffer();
  const bundleData = await extract(buffer);

  let listOfFiles = '';
  bundleData.urls.forEach(url => {
    const file = url.match(/([^/]+$)/)[1];
    listOfFiles += `- ${file}\n`;
  });

  message.channel.send({
    embed: {
      title: `"${packageName}" XRPK files`,
      url: `${BASE_INSPECT_URL}?p=${packageName}`,
      description: 'Manifest:\n```' + bundleData.manifest + '```\nFiles:\n```' + listOfFiles + '```',
    },
  });
};

module.exports = {name, help, predicate, execute};
