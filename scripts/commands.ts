import hello from "../commands/hello.js"
import APIHandler from "../lib/api.js"
import dev_config from "../dev.config.js"
import prod_config from "../prod.config.js"
let config = dev_config
let guild = false

const args = process.argv.splice(2)

// checking for flags
for (let [i, arg] of args.entries()) {
    // check if production flag was used, and remove it from the args, then change configuration to match
    if (["--production", "--prod", "-p"].includes(arg.toLowerCase())) {
        args.splice(i, 1)
        config = prod_config
    }
	
	if (["--guild", "-g"].includes(arg.toLowerCase())) {
		args.splice(i, 1)
		guild = true
	}
    // help menu
    if (["--help", "-h"].includes(arg.toLowerCase())) {
        console.log(`Commands:
    init - Initializes and overwrites all global commands
    update [command] - Updates specified command
    delete [command] - Deletes specified command
    show - Shows 

Providing no command defaults to the "show" command

Flags:
    --help (-h) - Shows this menu
    --production (--prod, -p) - Uses "prod.config.ts" instead of "dev.config.ts"
	--guild (-g) - Uses the guild verson of commands (Ex: Create a guild command instead of a global command)
        `)
    }
}
// default command
if (args.length == 0) {
    args[0] = "show"
}

// array of valid commands with their associated function
const _commands = {
    show: show
}

// make sure command specified is a valid command
if (!Object.keys(_commands).includes(args[0])) {
    console.log(`Unknown command: ${args[0]}
Try running with the "--help" flag to view all valid commands`
    )
    process.exit(1)
}
// setup client
const client = new APIHandler(config.id, config.secret, config.guild)
await client.fetchToken()

// get function and call it
const fn = _commands[args[0]]
await fn()

// good practice to revoke the token after we're done
await client.revokeToken()


/*
    COMMANDS BELOW
*/

async function show(): Promise<void> {
    let commands = []

    // change behavior based on guild
    if (guild == true) {
        commands = await client.getGuildCommands()
    } else {
        commands = await client.getGlobalCommands()
    }

    let names = []

    for (let command of commands) {
        names.push(command["name"])
    }

    console.log(`There are ${names.length} ${guild ? "guild" : "global"} commands

Commands:
    ${names.join("\n")}
    `)
}

