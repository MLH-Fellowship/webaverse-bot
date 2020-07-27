const fetch = require('node-fetch');
const {uploadPackage} = require('./upload');
const {BASE_INSPECT_URL, BASE_USER_URL} = require('../constants');

const name = 'upload-to-inventory';

const help =
  'To upload a package from your computer to your inventory, type `!inventory [username]` when uploading a `.wbn` file.';
const predicate = (message) =>
  message.attachments.size > 0 && message.content.startsWith('!inventory');

const execute = async (message) => {
  const args = message.content.split(' ').slice(1);
  const [username] = args;
  if (!username) return message.reply('please enter a username!');

  const wbnAttachment = message.attachments.values().next().value;
  const fileName = wbnAttachment.name;
  const ipfsUrl = wbnAttachment.attachment;
  if (!fileName.endsWith('.wbn')) {
    return message.reply("please make sure you're uploading a `.wbn` file!");
  }

  try {
    message.reply('attempting to upload package to inventory...');
    const uploadData = await uploadPackage(ipfsUrl, fileName);
    const user = await fetch(`${BASE_USER_URL}${username}`);
    const userObj = await user.json();
    if (userObj.error) {
      console.log(`userObj Error: ${userObj.error}`);
      return message.reply(`unable to find a user named \`${username}\`.`);
    }

    userObj.inventory.push({
      name: uploadData.metadata.name,
      hash: uploadData.metadata.dataHash,
      iconHash: uploadData.metadata.icons[0].hash,
    });
    const res = await fetch(`${BASE_USER_URL}${username}`, {
      method: 'PUT',
      body: JSON.stringify(userObj),
    });

    const resp = await res.json();

    if (!resp.ok) {
      console.log(`user PUT response not ok: ${resp}`);
      return message.reply(
        `error updating user inventory for \`${username}\`.`,
      );
    }

    message.channel.send({
      embed: {
        title: `Uploaded "${uploadData.metadata.name}" to ${username}'s inventory!`,
        url: `${BASE_INSPECT_URL}?p=${uploadData.metadata.name}`,
        fields: [
          {name: 'name', value: uploadData.metadata.name},
          {name: 'hash', value: uploadData.metadata.dataHash},
        ],
      },
    });
  } catch (err) {
    console.log(`Error uploading package ${fileName} to  IPFS: ${err.message}`);
    message.reply(`there was an error uploading your package: ${err.message}`);
  }
};

module.exports = {name, help, predicate, execute};
