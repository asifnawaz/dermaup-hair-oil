import recoveredApp from "./app.js";

const GENERATED_STYLESHEET = "/_next/static/css/05fce39a406715ff.css";
const ARCHIVED_LIVE_STYLESHEET =
  "/_next/static/css/recovery-fa88a64dc1919ad8-6ebf69a93c833e24.css?v=2";

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

async function useArchivedLiveStyles(response) {
  const contentType = response.headers.get("content-type") || "";
  if (!contentType.includes("text/html")) return response;

  const html = await response.text();
  const headers = new Headers(response.headers);
  headers.delete("content-length");

  return new Response(
    html.replaceAll(GENERATED_STYLESHEET, ARCHIVED_LIVE_STYLESHEET),
    {
      status: response.status,
      statusText: response.statusText,
      headers,
    }
  );
}

export default {
  async fetch(request, env, ctx) {
    const staticResponse = await serveStaticAsset(request, env);
    if (staticResponse) return staticResponse;

    const assetsBinding = {
      async fetch(input, init) {
        const assetRequest = input instanceof Request ? input : new Request(input, init);
        return (
          (await serveStaticAsset(assetRequest, env)) ||
          new Response("Not Found", { status: 404 })
        );
      },
    };

    const response = await recoveredApp.fetch(
      request,
      { ...env, ASSETS: assetsBinding },
      ctx
    );
    return useArchivedLiveStyles(response);
  },
};
