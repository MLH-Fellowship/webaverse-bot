const wbn = require('wbn');
const fetch = require('node-fetch');

async function extract(xrpkUrl) {
  const res = await fetch(xrpkUrl);
  const buffer = await res.buffer();
  const bundle = new wbn.Bundle(buffer);

  const manifestUrl = bundle.urls.find(u => u.endsWith('manifest.json'));
  const manifest = bundle.getResponse(manifestUrl).body.toString('utf-8');

  return {
    urls: bundle.urls,
    manifest,
  };
}

module.exports = {extract};
