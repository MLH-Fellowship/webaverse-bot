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
- `predicate(message)` (optional): if the command should also work on arbitrary messages, in addition to the `!command` syntax, then this `predicate` should be a function taking the discord.js `messsage` object and return true/false to determine whether this handler should be called for this message
- `execute(message)`: a function taking the discord.js `message` object

## Testing

To test locally, run `node index.js` in the root (note: >= Node v12 required!)

## Bot commands

`!help` will produce a list of commands that the bot supports, using the `help` string exported by each command handler:

```
- To add a package to your inventory, post !add [package] [username].
- To create an empty world, post !createworld [name] [description] (name and description are optional)
- To get a list of files in an XRPK, post !extract [name] or !extract [link to the XRPK on xrpackage.org]
- To get a summary of an XRPK, post !inspect [name] or the link to the XRPK
- To remove a package to your inventory, post !remove [package] [username].
- To get a user's avatar, post !avatar [username]
- To set a user's avatar, post !avatar [username] [XRPK name]
- To view augs in your inventory, type !inventory [username].
- To get a summary of a world, post !world [id] or the link to the xrpackage.org edit page for the world
- To upload an XRPackage, send a .wbn file as an attachment to a message with !upload
- To upload a package from your computer to your inventory, type !inventory [username] when uploading a .wbn file.
```
