const {uploadPackage} = require('../utils');

const {BASE_IPFS_URL} = require('../constants');

const name = 'upload';
const help = 'To upload an XRPackage, send a .wbn file as an attachment to a message with "!upload"';

const predicate = message => message.attachments && message.content.startsWith('!upload');

const execute = async message => {
  const wbnAttachment = message.attachments.values().next().value;
  const filename = wbnAttachment.name;
  if (!filename.endsWith('.wbn')) return message.reply('that doesn\'t seem like a `.wbn` file!');

  const url = wbnAttachment.attachment;
  try {
    message.reply('attempting to upload package to IPFS...');
    const uploadData = await uploadPackage(url, filename);
    message.channel.send({
      embed: {
        title: `Uploaded "${uploadData.metadata.name}" XRPK to IPFS!`,
        url: `${BASE_IPFS_URL}${uploadData.metadata.dataHash}.wbn`,
        fields: [{
          name: 'type',
          value: uploadData.metadata.description,
        }, {
          name: 'name',
          value: uploadData.metadata.name,
        }, {
          name: 'hash',
          value: uploadData.metadata.dataHash,
        }],
        image: {
          url: `${BASE_IPFS_URL}${uploadData.metadata.icons[0].hash}.gif`,
        },
      },
    });
  } catch (err) {
    console.error(err);
    message.reply(`there was an error uploading your package: ${err.message}`);
  }
};

module.exports = {name, help, predicate, execute};
