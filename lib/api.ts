import fetch from "node-fetch"


class APIHandler {
    token: string;
    id: string
    secret: string;

    constructor(id: string, secret: string) {
        this.id = id
        this.secret = secret
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