module.exports = {
  name: 'test',
  description: 'test',
  execute(message, args) {
    message.channel.send('Test!');
  },
};
