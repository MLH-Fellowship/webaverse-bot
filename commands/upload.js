const fetch = require('node-fetch');
const path = require('path');

const {extract} = require('../utils');

const {PACKAGE_NAME_REGEX, BASE_IPFS_URL} = require('../constants');
const name = 'upload';
const help = 'To upload an XRPackage, send a .wbn file as an attachment to a message with "!upload"';
const predicate = message => message.attachments && message.content.startsWith('!upload');

async function uploadPackage(xrpkUrl, xrpkName) {
  const res = await fetch(xrpkUrl);
  const buffer = await res.buffer();
  const bundleData = await extract(buffer);
  if (!bundleData.manifest) throw new Error('no manifest.json found');

  const manifest = JSON.parse(bundleData.manifest);
  if (typeof manifest.name !== 'string') throw new Error('no name field provided in manifest.json');
  if (!PACKAGE_NAME_REGEX.test(manifest.name)) throw new Error('invalid name provided in manifest.json');

  const isBaked = manifest => {
    const {icons} = manifest;
    if (!Array.isArray(icons)) return false;
    return ['image/gif', 'model/gltf-binary', 'model/gltf-binary+preview'].every(type =>
      icons.some(i => i && i.type === type),
    );
  };
  if (!isBaked(manifest)) throw new Error('your package is not baked; try xrpk bake');

  const {bundle} = bundleData;
  const {name, description, icons = []} = manifest;
  const iconObjects = [];
  for (let i = 0; i < icons.length; i++) {
    const icon = icons[i];
    const {src, type} = icon;
    const response = bundle.getResponse(`https://xrpackage.org/${src}`);
    const hash = await fetch(`${BASE_IPFS_URL}`, {
      method: 'PUT',
      body: response.body,
    }).then(res => res.json()).then(j => j.hash);
    iconObjects.push({
      hash,
      type,
    });
  }

  const dataHash = await fetch(`${BASE_IPFS_URL}`, {
    method: 'PUT',
    body: buffer,
  }).then(res => res.json()).then(j => j.hash);
  const objectName = typeof name === 'string' ? name : path.basename(xrpkName);
  const objectDescription = typeof description === 'string' ? description : `Package for ${path.basename(xrpkName)}`;
  const metadata = {
    name: objectName,
    description: objectDescription,
    icons: iconObjects,
    dataHash,
  };
  const metadataHash = await fetch(`${BASE_IPFS_URL}`, {
    method: 'PUT',
    body: JSON.stringify(metadata),
  }).then(res => res.json()).then(j => j.hash);

  return {metadata, metadataHash};
}

const execute = async message => {
  const wbnAttachment = message.attachments.values().next().value;
  const filename = wbnAttachment.name;
  if (!filename.endsWith('.wbn')) return message.reply("that doesn't seem like a `.wbn` file!");

  const url = wbnAttachment.attachment;
  try {
    message.reply('attempting to upload package to IPFS...');
    const uploadData = await uploadPackage(url, filename);
    message.channel.send({
      embed: {
        title: `Uploaded "${uploadData.metadata.name}" XRPK to IPFS!`,
        url: `${BASE_IPFS_URL}${uploadData.metadata.dataHash}.wbn`,
        fields: [
          {name: 'type', value: uploadData.metadata.description},
          {name: 'name', value: uploadData.metadata.name},
          {name: 'hash', value: uploadData.metadata.dataHash},
        ],
        image: {url: `${BASE_IPFS_URL}${uploadData.metadata.icons[0].hash}.gif`},
      },
    });
  } catch (err) {
    console.error(err);
    message.reply(`there was an error uploading your package: ${err.message}`);
  }
};

module.exports = {name, help, predicate, execute, uploadPackage};
