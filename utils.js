const path = require('path');

const wbn = require('wbn');
const fetch = require('node-fetch');

const {PACKAGE_NAME_REGEX, BASE_IPFS_URL} = require('./constants');

async function extract(xrpkUrl) {
  const res = await fetch(xrpkUrl);
  const buffer = await res.buffer();
  return _extract(buffer);
}

async function uploadPackage(xrpkUrl, xrpkName) {
  const res = await fetch(xrpkUrl);
  const buffer = await res.buffer();
  const bundleData = await _extract(buffer);
  if (!bundleData.manifest) throw new Error('no manifest.json found');

  const {bundle} = bundleData;
  const manifest = JSON.parse(bundleData.manifest);

  if (typeof manifest.name !== 'string') throw new Error('no name field provided in manifest.json');
  if (!PACKAGE_NAME_REGEX.test(manifest.name)) throw new Error('invalid name provided in manifest.json');

  const _isBaked = manifest => {
    const {icons} = manifest;
    if (!Array.isArray(icons)) return false;
    return ['image/gif', 'model/gltf-binary', 'model/gltf-binary+preview'].every(type =>
      icons.some(i => i && i.type === type),
    );
  };
  if (!_isBaked(manifest)) throw new Error('your package is not baked; try xrpk bake');

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

async function _extract(buffer) {
  const bundle = new wbn.Bundle(buffer);
  const manifestUrl = bundle.urls.find(u => u.endsWith('manifest.json'));
  const manifest = bundle.getResponse(manifestUrl).body.toString('utf-8');

  return {
    urls: bundle.urls,
    manifest,
    bundle,
  };
}

module.exports = {extract, uploadPackage};
