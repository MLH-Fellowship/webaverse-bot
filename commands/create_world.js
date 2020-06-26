const wbn = require('wbn');
const fetch = require('node-fetch');

const {BASE_EDIT_URL, BASE_WORLDS_URL, PRIMARY_URL, BASE_IPFS_URL} = require('../constants');

const name = 'createworld';
const help = 'To create an empty world, post `!createworld [name] [description]` (name and description are optional)';

// Copied from https://github.com/webaverse/xrpackage-site/blob/01f909304e8ffba17322bb75567dc4fdc011459e/edit.js#L1730
const makeId = () => {
  const length = 8;
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const charactersLength = characters.length;

  let result = '';
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
};

const execute = async message => {
  const split = message.content.slice(1).split(' ');
  const worldId = makeId();

  const worldName = split[1] || worldId;
  const worldDescription = split[2] ? split.slice(2).join(' ') : 'This is a world description';

  message.reply(`creating world with id "${worldId}", name "${worldName}", description "${worldDescription}"...`);

  const manifest = {
    name: worldId, // XRPackage name needs to be unique so use ID
    description: worldDescription,
    xr_type: 'xrpackage-scene@0.0.1',
    start_url: 'manifest.json',
    xrpackage_scene: {children: []},
  };

  const manifestUrl = `${PRIMARY_URL}manifest.json`;
  const builder = new wbn.BundleBuilder(manifestUrl);
  builder.addExchange(manifestUrl, 200, {
    'Content-Type': 'application/json',
  }, JSON.stringify(manifest, null, 2));

  const ipfsRes = await fetch(BASE_IPFS_URL, {
    method: 'PUT',
    body: builder.createBundle(),
  });
  if (!ipfsRes.ok) {
    console.error('error uploading', ipfsRes);
    throw new Error(`upload failed with status ${ipfsRes.status}`);
  }

  const hash = (await ipfsRes.json()).hash;
  const res = await fetch(`${BASE_WORLDS_URL}${worldId}`, {
    method: 'PUT',
    body: JSON.stringify({
      id: worldId,
      name: worldName,
      description: worldDescription,
      hash,
      objects: [],
    }),
  });
  if (!res.ok) {
    console.error('error saving new world', res);
    throw new Error(res.status);
  }

  message.channel.send({
    embed: {
      title: `Empty world ("${worldName}") created!`,
      description: 'Your world has been created',
      url: `${BASE_EDIT_URL}?w=${worldId}`,
      fields: [
        {name: 'description', value: worldDescription},
        {name: 'hash', value: hash},
      ],
    },
  });
};

module.exports = {name, help, execute};
