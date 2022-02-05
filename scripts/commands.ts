import { readdirSync } from "fs"

import APIHandler from "../lib/api.js"
import dev_config from "../dev.config.js"
import prod_config from "../prod.config.js"
let config = dev_config
let guild = false

let args = process.argv.splice(2)

const new_args = process.argv.splice(2)

// checking for flags
for (let [i, arg] of args.entries()) {

    // check if production flag was used, and remove it from the args, then change configuration to match
    if (["--production", "--prod", "-p"].includes(arg.toLowerCase())) {
        args = args.filter(function(value){ 
            return value.toLowerCase() !== arg.toLowerCase();
        });
        config = prod_config
    }
	if (["--guild", "-g"].includes(arg.toLowerCase())) {
		args = args.filter(function(value){ 
            return value.toLowerCase() !== arg.toLowerCase();
        });
		guild = true
	}
    // help menu
    if (["--help", "-h"].includes(arg.toLowerCase())) {
        console.log(`Commands:
    overwrite - Overwrites all existing commands / create new ones
    create [command] - Creates specified command
    update [command] - Updates specified command
    delete [command] - Deletes specified command
    view <command> - View command or all commands

Providing no command defaults to the "view" command

Flags:
    --help (-h) - Shows this menu
    --production (--prod, -p) - Uses "prod.config.ts" instead of "dev.config.ts"
	--guild (-g) - Uses the guild verson of commands (Ex: Create a guild command instead of a global command)
        `)
        process.exit()
    }
}
// default command
if (args.length == 0) {
    args[0] = "view"
}

// array of valid commands with their associated function
const _commands = {
    view: viewCommands,
    create: createCommand,
    update: updateCommand,
    delete: deleteCommand,
	overwrite: overwriteCommands
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

async function overwriteCommands(): Promise<void> {
	let res = {}
	
	let commands = []
	
	
	for (let cmd of readdirSync("./commands")) {
		const path = `../commands/${cmd.replace(".ts", ".js")}`
		const module = await import (path)
		commands.push(module.default.to_json())
	}
	
	if (guild === true) res = await client.overwriteGuildCommands(commands)
    else res = await client.overwriteGlobalCommands(commands)

    console.log(res)
}

async function deleteCommand(): Promise<void> {
    let res = {}

    const command_name = args[1] || null
    if (command_name === null) {
        console.log("Please provide a command to update!")
        process.exit(1)
    }

    if (guild == true) {
        const found = await findCommand(command_name)
        res = await client.deleteGuildCommand(found["id"])
    } else {
        const found = await findCommand(command_name)
        res = await client.deleteGlobalCommand(found["id"])
    }

    console.log(res)
}

async function updateCommand(): Promise<void> {
    let res = {}

    const command_name = args[1] || null
    if (command_name === null) {
        console.log("Please provide a command to update!")
        process.exit(1)
    }

    if (!readdirSync("./commands").includes(command_name + ".ts")) {
        console.log(`Cannot find "commands/${command_name}.ts". Command name must match with the file name of a command in the "commands" directory.`)
        process.exit(1)
    }

    const command = (await import(`../commands/${command_name}.js`)).default.to_json()

    if (guild == true) {
        const found = await findCommand(command_name)
        res = await client.editGuildCommand(found["id"], command)
    } else {
        const found = await findCommand(command_name)
        res = await client.editGlobalCommand(found["id"], command)
    }

    console.log(res)
}

async function createCommand(): Promise<void> {
    let res = {}

    const command_name = args[1] || null
    if (command_name === null) {
        console.log("Please provide a command to create!")
        process.exit(1)
    }

    if (!readdirSync("./commands").includes(command_name + ".ts")) {
        console.log(`Cannot find "commands/${command_name}.ts". Command name must match with the file name of a command in the "commands" directory.`)
        process.exit(1)
    }

    const command = (await import(`../commands/${command_name}.js`)).default.to_json()

    if (guild == true) {
        res = await client.createGuildCommand(command)
    } else {
        res = await client.createGlobalCommand(command)
    }

    console.log(res)
}

async function viewCommands(): Promise<void> {
    const command_name = args[1] || null

    if (command_name == null) {
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
    } else {
        console.log(await findCommand(command_name))
    }
}

async function findCommand(name: string): Promise<{} | null> {
    let commands = []

    if (guild == true) commands = await client.getGuildCommands()
    else commands = await client.getGlobalCommands()

    const ret = commands.find(c => c["name"] == name) || null

    if (ret == null) {
        console.log(`Could not find command with name ${name}`)
        process.exit(1)
    }

    return ret
}
