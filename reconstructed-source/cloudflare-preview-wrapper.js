/*
 * Exact-recovery preview wrapper.
 *
 * `app.js` is the sanitized recovered Worker module supplied during the
 * controlled Cloudflare restore. Static assets are served from an isolated R2
 * bucket so the recovered Next.js route filenames remain unchanged.
 */
import recoveredApp from "./app.js";

function assetKey(request) {
  const url = new URL(request.url);

  try {
    return decodeURIComponent(url.pathname.replace(/^\/+/, ""));
  } catch {
    return null;
  }
}

async function serveStaticAsset(request, env) {
  if (request.method !== "GET" && request.method !== "HEAD") return null;

  const key = assetKey(request);
  if (!key) return null;

  const object = await env.STATIC_ASSETS.get(key);
  if (!object) return null;

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("ETag", object.httpEtag);
  headers.set(
    "Cache-Control",
    key.startsWith("_next/static/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=3600"
  );

  return new Response(request.method === "HEAD" ? null : object.body, {
    status: 200,
    headers,
  });
}

export default {
  async fetch(request, env, ctx) {
    const staticResponse = await serveStaticAsset(request, env);
    if (staticResponse) return staticResponse;

    const assetsBinding = {
      async fetch(input, init) {
        const assetRequest =
          input instanceof Request ? input : new Request(input, init);

        return (
          (await serveStaticAsset(assetRequest, env)) ||
          new Response("Not Found", { status: 404 })
        );
      },
    };

    return recoveredApp.fetch(
      request,
      { ...env, ASSETS: assetsBinding },
      ctx
    );
  },
};
