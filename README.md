Discord bot that runs on a Cloudflare Worker

Worker is written in Rust and the CLI tool + command framework is written in TypeScript for ease of use

## Configuration:
Make two bots, a production one and a development one.

> prod.config.ts
```ts
export default {
    id: "12345678910",
    secret: "your secret from the Oauth2 tab",
    guild: "testing guild id, can leave blank if needed"
}
```
> dev.config.ts
```ts
export default {
    id: "12345678910",
    secret: "client secret",
    guild: "testing guild id"
}
```

Set up the public key on dev and prod: 
```bash
$ wrangler secret PUBLIC_KEY
$ wrangler secret PUBLIC_KEY -e dev
```

## Application Commands
Create commands in the `commands` folder.
Run the CLI tool after running `yarn install` with 
```bash
$ yarn discord
```

Use the `--help` flag to view all commands and flags

## Deployment
Deploy to Cloudflare Workers I guess.

`package.json` contains useful scripts (like `miniflare`) for both the Worker and CLI tool

Set the Interaction Endpoint in the Discord Developer tab for the bot to the worker at the `/interaction` endpoint