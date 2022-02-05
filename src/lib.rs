use serde_json::json;
use worker::*;

use twilight_model::application::{
    callback::{CallbackData, InteractionResponse},
    interaction::Interaction,
};

use ed25519_dalek::{PublicKey, Verifier, PUBLIC_KEY_LENGTH, Signature};
use hex::FromHex;



async fn interaction_handler(mut req: Request, ctx: RouteContext<()>) -> Result<Response> {
    if let Some(ct) = req.headers().get("Content-Type").unwrap() {
        if ct != "application/json" {
            return Response::error("Bad Content Type", 400);
        }
    } else {
        return Response::error("Bad Content Type", 400);
    }

    let body = req.bytes().await?;
    let timestamp = req.headers().get("x-signature-timestamp").unwrap();
    let signature = req.headers().get("x-signature-ed25519").unwrap();
    if timestamp.is_none() {
        return Response::error("no timestamp provided", 400)
    }
    if signature.is_none() {return Response::error("no signature provided", 400)}

    let decoding_signature = hex::decode(signature.unwrap().as_bytes());
    if decoding_signature.is_err() { return Response::error("could not decode signature", 400) }

    let decoded_signature: &[u8] = &decoding_signature.unwrap();

    let signature = Signature::from_bytes(decoded_signature).unwrap();

    let public_key = PublicKey::from_bytes(&<[u8; PUBLIC_KEY_LENGTH] as FromHex>::from_hex(ctx.secret("PUBLIC_KEY")?.to_string()).unwrap())
        .unwrap();

    if public_key.verify(
        vec![timestamp.unwrap().as_bytes(), &body].concat().as_ref(),
        &signature,
    ).is_err() {
        return Response::error("not authorized", 401);
    }

    let interaction = serde_json::from_slice::<Interaction>(&body)?;

    match interaction {
        // Return a Pong if a Ping is received.
        Interaction::Ping(_) => {
            Response::from_json(&json!(InteractionResponse::Pong))
        }
        // Respond to a slash command.
        Interaction::ApplicationCommand(_) => {
            let res = handler(interaction).await.unwrap();

            console_log!("{:?}", res);

            Response::from_json(&json!(res))
        }
        // Unhandled interaction types.
        _ => Response::error("idk what this is", 400)
    }
}

/// Interaction handler that matches on the name of the interaction that
/// have been dispatched from Discord.
async fn handler(i: Interaction) -> Result<InteractionResponse> {
    match &i {
        Interaction::ApplicationCommand(cmd) => match cmd.data.name.as_ref() {
            "hello" => vroom(i).await,
            "debug" => debug(i).await,
            _ => debug(i).await,
        },
        _ => Err("invalid interaction data".into()),
    }
}

/// Example of a handler that returns the formatted version of the interaction.
async fn debug(i: Interaction) -> Result<InteractionResponse> {
    Ok(InteractionResponse::ChannelMessageWithSource(
        CallbackData {
            allowed_mentions: None,
            components: None,
            flags: None,
            tts: None,
            content: Some(format!("```rust\n{:?}\n```", i)),
            embeds: None,
        },
    ))
}

/// Example of interaction that responds with a message saying "Vroom vroom".
async fn vroom(_: Interaction) -> Result<InteractionResponse> {
    Ok(InteractionResponse::ChannelMessageWithSource(
        CallbackData {
            allowed_mentions: None,
            components: None,
            flags: None,
            tts: None,
            content: Some("Vroom vroom".to_owned()),
            embeds: None,
        },
    ))
}

#[event(fetch)]
pub async fn main(req: Request, env: Env, _ctx: worker::Context) -> Result<Response> {
    // Optionally, use the Router to handle matching endpoints, use ":name" placeholders, or "*name"
    // catch-alls to match on specific patterns. Alternatively, use `Router::with_data(D)` to
    // provide arbitrary data that will be accessible in each route via the `ctx.data()` method.
    let router = Router::new();

    // Add as many routes as your Worker needs! Each route will get a `Request` for handling HTTP
    // functionality and a `RouteContext` which you can use to  and get route parameters and
    // Environment bindings like KV Stores, Durable Objects, Secrets, and Variables.
    router
        .get("/", |_, _| Response::ok("Hello from Workers!"))
        .get("/worker-version", |_, ctx| {
            let version = ctx.var("WORKERS_RS_VERSION")?.to_string();
            Response::ok(version)
        })
        .post_async("/interaction", |req, ctx| async move {
            interaction_handler(req, ctx).await
        })
        .run(req, env)
        .await
}
