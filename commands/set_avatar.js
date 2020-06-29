const fetch = require('node-fetch');

const {BASE_IPFS_URL, BASE_USER_URL, BASE_API_URL} = require('../constants');

const name = 'avatar';
const help = "To get a user's avatar, post `!avatar [username]`\nTo set a user's avatar, post `!avatar [username] [avatar name]`";

const execute = async message => {
  const args = message.content.slice(1).split(' ').slice(1);
  const [username, avatarName] = args;
  if (!username) return message.reply('No username was found in your message!');

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
  return message.channel.send({
    embed: {
      title: `Current avatar for ${username}`,
      fields: [
        {name: 'hash', value: userJson.avatarHash},
      ],
    },
  });
};

module.exports = {name, help, execute};
