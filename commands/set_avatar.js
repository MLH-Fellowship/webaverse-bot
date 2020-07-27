const fetch = require('node-fetch');

const {extract} = require('../utils');

const {BASE_IPFS_URL, BASE_USER_URL, BASE_API_URL, BASE_INSPECT_URL} = require('../constants');

const name = 'avatar';
const help = "To get a user's avatar, post `!avatar [username]`\n- To set a user's avatar, post `!avatar [username] [XRPK name]`";

async function getPackageDetails(xrpkUrl) {
  const res = await fetch(xrpkUrl);
  const buffer = await res.buffer();
  const bundleData = await extract(buffer);
  const manifest = JSON.parse(bundleData.manifest);

  const {name} = manifest;
  const packageRes = await fetch(`${BASE_API_URL}${name}`);
  const json = await packageRes.json();
  const iconHash = json.icons.find(i => i.type === 'image/gif').hash;
  return {name, gif: `${BASE_IPFS_URL}${iconHash}.gif`};
}

const execute = async message => {
  const args = message.content.slice(1).split(' ').slice(1);
  const [username, avatarName] = args;
  if (!username) return message.reply('no username was found in your message!');

  const res = await fetch(`${BASE_USER_URL}${username}`);
  const userJson = await res.json();
  if (userJson.error) return message.reply(`there was an error fetching the user: ${userJson.error}`);

  // Setting the avatar
  if (avatarName) {
    const newAvatarRes = await fetch(`${BASE_API_URL}${avatarName}`);
    const newAvatarJson = await newAvatarRes.json();
    if (newAvatarJson.error) return message.reply(`there was an error fetching the xrpk: ${newAvatarJson.error}`);

    const newAvatarHash = newAvatarJson.dataHash;
    userJson.avatarHash = newAvatarHash;

    const setRes = await fetch(`${BASE_USER_URL}${username}`, {
      method: 'PUT',
      body: JSON.stringify(userJson),
    });

    const setJson = await setRes.json();
    if (!setJson.ok) {
      console.error(setJson);
      return message.reply(`there was an error setting the avatar for ${username}`);
    }

    const iconHash = newAvatarJson.icons.find(i => i.type === 'image/gif').hash;
    return message.channel.send({
      embed: {
        title: `Set avatar for ${username}!`,
        description: `The new avatar for ${username} is ${newAvatarJson.name}`,
        image: {url: `${BASE_IPFS_URL}${iconHash}.gif`},
        fields: [{name: 'hash', value: newAvatarHash}],
      },
    });
  }

  // Getting the current avatar
  const packageDetails = await getPackageDetails(`${BASE_IPFS_URL}${userJson.avatarHash}.wbn`);
  return message.channel.send({
    embed: {
      title: `Current avatar for ${username}`,
      url: `${BASE_INSPECT_URL}?p=${packageDetails.name}`,
      image: {url: packageDetails.gif},
      description: `The current avatar for ${username} is ${packageDetails.name}`,
      fields: [{name: 'hash', value: userJson.avatarHash}],
    },
  });
};

module.exports = {name, help, execute};
