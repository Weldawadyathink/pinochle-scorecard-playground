import { Context, Hono } from "hono";
import { generate } from "./nameGenerator.ts";

const expiration = 604800000; // one week in ms

const app = new Hono({ strict: false });

app.get("/", (c: Context) => {
  return c.text("Hello Hono!");
});

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

Deno.serve(app.fetch);
