/*
system for adding, updating, and checking commands
*/

import yargs from "yargs"
import { hideBin } from "yargs/helpers"
import hello from "../commands/hello.js"
import APIHandler from "../lib/api.js"

console.log(hello.to_json())

import config from "../dev.config.js"
import prod_config from "../prod.config.js"

const args = yargs(hideBin(process.argv))
    .option("prod", {
        default: false,
        type: "boolean",
        describe: "Using this flag will use \"prod.config.ts\" instead of \"dev.config.ts\"."
    })
    .argv

if (args["prod"] === true) {
    const config = prod_config
}

const client = new APIHandler(config.id, config.secret)

console.log(await client.fetchToken())

