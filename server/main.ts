import { Context, Hono } from "hono";
import { cors } from "hono/cors";
import { generate } from "./nameGenerator.ts";
import { upgradeWebSocket } from "hono/deno";

const expiration = 604800000; // one week in ms

const app = new Hono({ strict: false });

app.get("/", (c: Context) => {
  return c.text("Hello Hono!");
});

app.use(
  "/v1/game/new",
  cors({
    origin: "https://pinochle.spenserbushey.com",
    allowMethods: ["GET", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
  })
);

app.get("/v1/game/new", async (c: Context) => {
  const kv = await Deno.openKv();

  async function getName() {
    const possibleName = generate();
    console.log(`Generated name ${possibleName}, testing for collisions.`);
    const result = await kv.get(["gameName", possibleName]);
    if (result.versionstamp !== null) {
      console.log("Name collision, generating new name.");
      return getName();
    }
    return possibleName;
  }

  const name = await getName();

  // await kv.set(["gameName", name], "test", {
  //   expireIn: expiration,
  // });

  return c.json({ name: name });
});

app.all(
  "/v1/game/connect/:name",
  upgradeWebSocket(async (c: Context) => {
    const gameName = c.req.param("name");
    const kv = await Deno.openKv();
    return {
      onOpen: async (_evt, ws) => {
        console.log(`Connected to websocket for game: ${gameName}`);

        // KV watch already sends first game state
        // const gameState = await kv.get(["gameName", gameName]);
        // if (gameState.versionstamp != null) {
        //   ws.send(JSON.stringify(gameState.value));
        // }

        const stream = kv.watch([["gameName", gameName]]);
        for await (const [entry] of stream) {
          ws.send(JSON.stringify(entry.value));
          console.log(JSON.stringify(entry.value));
        }
      },

      onMessage: (evt, _ws) => {
        console.log("Received WS message", evt);
        const data = JSON.parse(evt.data.toString());
        kv.set(["gameName", gameName], data, { expireIn: expiration });
      },

      onClose: () => console.log("Disconnected"),

      onError: (error) => console.error("Error: ", error),
    };
  })
);

Deno.serve(app.fetch);
