import fetch from "node-fetch"
import { Command } from "./framework.js"


class APIHandler {
    token: string;
    id: string
    secret: string;
    guild: string

    constructor(id: string, secret: string, guild: string) {
        this.id = id
        this.secret = secret
        this.guild = guild
    }

    async request(method: string, path: string, body?: {}): Promise<any> {
        this.verifyTokenExists("request()")

        let options = {
            method: method,
            headers: {
                Authorization: `Bearer ${this.token}`
            }
        }

        if (body != null) {
            options["body"] = JSON.stringify(body)
            options.headers["Content-Type"] = "application/json"
        }

        const modifiedPath = path.replace("{id}", this.id).replace("{guild}", this.guild)

        const res = await fetch("https://discord.com/api/v9" + modifiedPath, options)

        if (!res.ok) {
            throw new Error(`${path} failed with code ${res.status}: ${await res.text()}`)
        }

        if (res.status == 204) {
            return {}
        }

        return await res.json()
    }

    async overwriteGlobalCommands(commands) {
        this.verifyTokenExists("overwriteGlobalCommands()")

        return await this.request("PUT", "/applications/{id}/commands", commands)
    }

    async overwriteGuildCommands(commands) {
        this.verifyTokenExists("overwriteGuildCommands()")

        return await this.request("PUT", "/applications/{id}/guilds/{guild}/commands", commands)
    }


    async getGlobalCommands(): Promise<[]> {
        this.verifyTokenExists("getGlobalCommands()")

        return await this.request("GET", "/applications/{id}/commands")
    }

    async getGuildCommands(): Promise<[]> {
        this.verifyTokenExists("getGuildCommands()")

        return await this.request("GET", "/applications/{id}/guilds/{guild}/commands")
    }

    async createGlobalCommand(command): Promise<{}> {
        this.verifyTokenExists("createGlobalCommand()")

        return await this.request("POST", "/applications/{id}/commands", command)
    }

    async createGuildCommand(command): Promise<{}> {
        this.verifyTokenExists("createGuildCommand()")

        return await this.request("POST", "/applications/{id}/guilds/{guild}/commands", command)
    }

    async editGlobalCommand(id: string, command): Promise<{}> {
        this.verifyTokenExists("editGlobalCommand()")

        return await this.request("PATCH", "/applications/{id}/commands/" + id, command)
    }

    async editGuildCommand(id: string, command): Promise<{}> {
        this.verifyTokenExists("editGlobalCommand()")

        return await this.request("PATCH", "/applications/{id}/guilds/{guild}/commands/" + id, command)
    }

    async getGlobalCommand(id: string): Promise<{}> {
        this.verifyTokenExists("getGlobalCommand()")

        return await this.request("GET", "/applications/{id}/commands/" + id)
    }

    async getGuildCommand(id: string): Promise<{}> {
        this.verifyTokenExists("getGlobalCommand()")

        return await this.request("GET", "/applications/{id}/guilds/{guild}/commands/" + id)
    }

    async deleteGlobalCommand(id: string): Promise<{}> {
        this.verifyTokenExists("deleteGlobalCommand()")

        return await this.request("DELETE", "/applications/{id}/commands/" + id)
    }

    async deleteGuildCommand(id: string): Promise<{}> {
        this.verifyTokenExists("deleteGlobalCommand()")

        return await this.request("DELETE", "/applications/{id}/guilds/{guild}/commands/" + id)
    }

    verifyTokenExists(name: string) {
        if (this.token === null) {
            throw new Error("Please call fetchToken() before using " + name)
        }
    }

    async fetchToken(): Promise<string> {
        const res = await fetch("https://discord.com/api/oauth2/token", {
            body: `client_id=${this.id}&client_secret=${this.secret}&grant_type=client_credentials&scope=applications.commands.update`,
            headers: {
                "Content-Type": "application/x-www-form-urlencoded"
            },
            method: "POST"
        })

		if (!res.ok) {
			throw new Error(`${res.status}: Could not fetch token: ${await res.text()}`)
		}

        const data = await res.json()
        this.token = data["access_token"]
        return this.token
    }
	
	async revokeToken() {
		this.verifyTokenExists("revokeToken()")
		
		const res = await fetch("https://discord.com/api/oauth2/token/revoke", {
			method: "POST",
			headers: {
				"Content-Type": "application/x-www-form-urlencoded"
			},
			body: `client_id=${this.id}&client_secret=${this.secret}&token=${this.token}`
		})
		
		if (!res.ok) {
			throw new Error(`${res.status}: Could not revoke token: ${await res.text()}`)
		}
		
		return await res.json()
	}
}

export default APIHandler