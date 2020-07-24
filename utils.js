const wbn = require('wbn');

async function extract(buffer) {
  const bundle = new wbn.Bundle(buffer);
  const manifestUrl = bundle.urls.find(u => u.endsWith('manifest.json'));
  const manifest = bundle.getResponse(manifestUrl).body.toString('utf-8');

  return {
    urls: bundle.urls,
    manifest,
    bundle,
  };
}

module.exports = {extract};
