const fetch = require('node-fetch');

const {BASE_INSPECT_URL, BASE_USER_URL} = require('../constants');

const name = 'upload-to-inventory';

const help = 'To upload a package from your computer to your inventory, type `!inv [username]` when uploading a `.wbn` file.';

const execute = async message => {
    const username = message.content.split(' ')[1];
    const res = await fetch(`${BASE_USER_URL}${username}`);
    const resp = res.json();
    
};

module.exports = {name, help, execute};
