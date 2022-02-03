import * as lib from "../lib/framework.js"

export default new lib.Command({
    name: "greet",
    description: "Greets a user",
    options: [
        new lib.CommandOption({
            type: lib.CommandOptionType.STRING,
            name: "person",
            description: "the person to greet"
        })
    ]
})