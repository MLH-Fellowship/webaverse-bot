# webaverse-bot

Discord bot for Webaverse.

## Development setup
- You need at least Node v12 installed
- You'll need to make a `.env` file in the root with `BOT_TOKEN=[token]`
- `npm install` in the root

## Making commands

Add a command handler to [`./commands`](./commands), in the form `command_name.js`, with the following exports:
- `name`: the name of the command, to be written after the `!`, e.g. `!inspect1
- `help`: a string explaining how this command can be used. Use `\n` characters if newlines are needed
- `execute(message, args)`: a function taking the discord.js `message` object and array of `args`
- `regex` (optional): if the command should also work on arbitrary messages, in addition to the `!command` syntax, then this `regex` should contain a single capturing group, whose value will be the first argument in `args` above

## Testing

To test locally, run `node index.js` in the root (note: >= Node v12 required!)
