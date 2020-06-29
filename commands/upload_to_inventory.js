const fetch = require('node-fetch');
const {uploadPackage} = require('./upload');
const {BASE_INSPECT_URL, BASE_USER_URL} = require('../constants');

const name = 'upload-to-inventory';

const help =
  'To upload a package from your computer to your inventory, type `!inv [username]` when uploading a `.wbn` file.';
const predicate = (message) =>
  message.attachments && message.content.startsWith('!inv');

const execute = async (message) => {
  console.log(`MESSAGE: ${message.content}`);
  const username = message.content.split(' ')[1];

  const wbnAttachment = message.attachments.values().next().value;
  const fileName = wbnAttachment.name;
  const ipfsUrl = wbnAttachment.attachment;
  if (!fileName.endsWith('.wbn')) {
    return message.reply("Please make sure you're uploading a `.wbn` file!");
  }

  try {
    message.reply('Attempting to upload package to inventory...');
    const uploadData = await uploadPackage(ipfsUrl, fileName);
    console.log('FINISHED UPLOAD DATA');
    const user = await fetch(`${BASE_USER_URL}${username}`);
    const userObj = await user.json();
    console.log(userObj);
    if (userObj.error) {
      return message.reply(`Unable to find a user named \`${username}\`.`);
    }
    console.log(userObj);
    userObj.inventory.push({
      name: uploadData.metadata.name,
      hash: uploadData.metadata.dataHash,
      iconHash: uploadData.metadata.icons[0].hash,
    });
    console.log(userObj);
    console.log(JSON.stringify(userObj));
    const res = await fetch(`${BASE_USER_URL}${username}`, {
      method: 'PUT',
      body: JSON.stringify(userObj),
    });

    const resp = await res.json();

    if (!resp.ok) {
      console.log(resp);
      return message.reply(
        `Error updating user inventory for \`${username}\`.`,
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
    message.reply(`There was an error uploading your package: ${err.message}`);
  }
};

module.exports = {name, help, predicate, execute};
