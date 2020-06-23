const dotenv = require('dotenv');
const {Client} = require('discord.js');
dotenv.config();

const client = new Client();

client.once('ready', () => console.log('Client ready'));
