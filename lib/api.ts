import fetch from "node-fetch"


class APIHandler {
    token: string;
    id: string
    secret: string;

    constructor(id: string, secret: string) {
        this.id = id
        this.secret = secret
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

        const modifiedPath = path.replace("{id}", this.id)

        const res = await fetch("https://discord.com/api/v9" + modifiedPath, options)

        if (!res.ok) {
            throw new Error(`${path} failed with code ${res.status}: ${await res.text()}`)
        }

        return await res.json()
    }

    async getGlobalCommands(): Promise<[]> {
        this.verifyTokenExists("getGlobalCommands()")

        return await this.request("GET", "/applications/{id}/commands")
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
            const text = await res.text()
            throw new Error("could not fetch token: " + text)
        }

        const data = await res.json()
        this.token = data["access_token"]
        return this.token
    }
}

export default APIHandler