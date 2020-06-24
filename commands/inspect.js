const {BASE_INSPECT_URL} = require('../constants');

module.exports = {
  name: 'inspect',
  description: 'Get the URL for inspecting an XRPK',
  async execute(message, args) {
    if (!args.length) return message.channel.send('Please give me a name of an XRPK!');
    const [packageName] = args;

    message.channel.send(`Inspect URL for this package: ${BASE_INSPECT_URL}?p=${packageName}`);
  },
};
