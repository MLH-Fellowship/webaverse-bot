const fetch = require('node-fetch');

const {BASE_INSPECT_URL, BASE_IPFS_URL, BASE_API_URL} = require('../constants');

module.exports = {
  name: 'screenshot',
  description: 'Get a screenshot of an XRPK',
  async execute(message, args) {
    if (!args.length) return message.channel.send('Please give me a name of an XRPK!');
    const [packageName] = args;

    const res = await fetch(`${BASE_API_URL}${packageName}`);
    const apiResponse = await res.json();

    message.channel.send({
      embed: {
        title: `Screenshot for the "${packageName}" XRPK`,
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
  },
};
