enum CommandType {
    CHAT_INPUT = 1,
    USER = 2,
    MESSAGE = 3
}

enum CommandOptionType {
    SUB_COMMAND = 1,	
    SUB_COMMAND_GROUP = 2,
    STRING = 3,
    INTEGER = 4,
    BOOLEAN = 5,
    USER = 6,	
    CHANNEL = 7,
    ROLE = 8,	
    MENTIONABLE = 9,
    NUMBER = 10,
}

enum ChannelTypes {
    GUILD_TEXT = 0,	//a text channel within a server
    DM = 1,	//a direct message between users
    GUILD_VOICE	= 2,	//a voice channel within a server
    GROUP_DM = 3,	//a direct message between multiple users
    GUILD_CATEGORY = 4,	//an organizational category that contains up to 50 channels
    GUILD_NEWS = 5,	//a channel that users can follow and crosspost into their own server
    GUILD_STORE = 6,	//a channel in which game developers can sell their game on Discord
    GUILD_NEWS_THREAD = 10,	//a temporary sub-channel within a GUILD_NEWS channel
    GUILD_PUBLIC_THREAD = 11,	//a temporary sub-channel within a GUILD_TEXT channel
    GUILD_PRIVATE_THREAD = 12,	//a temporary sub-channel within a GUILD_TEXT channel that is only viewable by those invited and those with the MANAGE_THREADS permission
    GUILD_STAGE_VOICE = 13,
}


class CommandOptionChoice {
    name;
    value;

    constructor(private vars: {
        name: string,
        value: string | number,
    }) {
        const {name, value} = vars
        if (name.length < 1 || name.length > 32) {
            throw new Error("option choice name must be at least 1 and no more than 32")
        }
        if (typeof value == "number") {
            this.value = value
        }
        if (typeof value == "string") {
            if (value.length < 1 || name.length > 100) {
                throw new Error("option choice value must be at least 1 and no more than 100")
            }
            this.value = name
        }
 
    }

    to_json(): any {
        return {
            name: this.name,
            value: this.value,
        }
    }
}

class CommandOption {
    type;
    name;
    description;
    required;
    choices;
    options;
    channel_types;
    min_value;
    max_value;
    autocomplete;

    constructor(private vars: {
        type: CommandOptionType,
        name: string,
        description: string,
        required?: boolean,
        choices?: CommandOptionChoice[],
        options?: CommandOption[],
        channel_types?: ChannelTypes[],
        min_value?: number,
        max_value?: number,
        autocomplete?: boolean
    }) {
        const {type, name, description, required, choices, options, channel_types, min_value, max_value, autocomplete} = vars
        this.type = type
        if (name.length < 1 || name.length > 32) {
            throw new Error("option name must be at least 1 and no more than 32")
        }
        this.name = name
        if (description.length < 1 || description.length > 100) {
            throw new Error("command description must be at least 1 and no more than 100")
        }
        this.description = description
        this.required = required || null
        if (choices != null && choices.length > 25) {
            throw new Error("amount of choices must not exceed 25")
        }
        this.choices = choices || null
        this.options = options || null
        if (this.type != CommandOptionType.CHANNEL && channel_types != null) {
            throw new Error("option type must be channel to use channel_types")
        }
        this.channel_types = channel_types || null
        if (([CommandOptionType.STRING, CommandOptionType.INTEGER].some(i => i != this.type)) && (min_value != null || max_value != null)) {
            throw new Error("cannot use min_value or max_value if option type is not integer or number")
        }
        this.min_value = min_value
        this.max_value = max_value
        if (([CommandOptionType.STRING, CommandOptionType.INTEGER, CommandOptionType.NUMBER].some(i => i != this.type)) && autocomplete != null) {
            throw new Error("autocomplete can only be enabled or disabled if the type is string, number, or integer")
        }
        this.autocomplete = autocomplete
    }

    to_json(): any {
        let obj: {[k: string]: any} = {
            type: this.type,
            name: this.name,
            description: this.description,
        }


        for (let item of ["required", "min_value", "max_value", "autocomplete", "channel_types"]) {
            if (this[item] != null) {
                obj[item] = this[item]
            }
        }

        for (let item of ["options", "choices"]) {
            if (this[item] != null) {
                obj[item] = this[item].map(o => o.to_json())
            }
        }
        return obj
    }
}

class Command {
    type;
    guild_id;
    name;
    description;
    options;
    default_permission;

    constructor(private vars: {
        type?: CommandType,
        guild_id?: number,
        name: string,
        description: string,
        options?: CommandOption[],
        default_permission?: boolean,

    }) {
        const {type, guild_id, name, description, options, default_permission} = vars
        this.type = type || null
        this.guild_id = guild_id || null;
        if (name.length < 1 || name.length > 32) {
            throw new Error("command name must be at least 1 and no more than 32")
        }
        this.name = name
        if (description.length < 1 || description.length > 100) {
            throw new Error("command description must be at least 1 and no more than 100")
        }
        this.description = description
        this.options = options || null
        this.default_permission = default_permission || null

    }

    to_json() {
        let obj: {[k: string]: any} = {
            name: this.name,
            description: this.description,
        }

        for (let item of ["type", "guild_id", "default_permission"]) {
            if (this[item] != null) {
                obj[item] = this[item]
            }
        }

        if (this.options != null) {
            obj["options"] = this.options.map(o => o.to_json())
        }

        return obj
    }
}

export {
    Command,
    CommandType,
    CommandOption,
    CommandOptionType,
    CommandOptionChoice,
    ChannelTypes
}