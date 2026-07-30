// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: server Worker route-entry module
// Deployed source path: next-metadata-route-loader?filePath=%2Fhome%2Fasifnawaz%2Fgit%2Fdermaup-hair-oil%2Fapp%2Fsitemap.ts&isDynamicRouteExtension=1!?__next_metadata_route__
// Project-relative source path: unknown
// Module ID: 25687
// Deployment location(s): dist/worker.js
// Captured factory SHA-256: 0c1114c938ee41dec9241c6fc0390077aad7d884366d2495e274bdb5a4888073
// The factory below is preserved as data and is not executed by the extractor.

((a2, b4, c2) => {
          "use strict";
          c2.r(b4), c2.d(b4, { handler: /* @__PURE__ */ __name(() => L3, "handler"), patchFetch: /* @__PURE__ */ __name(() => K3, "patchFetch"), routeModule: /* @__PURE__ */ __name(() => G3, "routeModule"), serverHooks: /* @__PURE__ */ __name(() => J2, "serverHooks"), workAsyncStorage: /* @__PURE__ */ __name(() => H3, "workAsyncStorage"), workUnitAsyncStorage: /* @__PURE__ */ __name(() => I3, "workUnitAsyncStorage") });
          var d = {};
          c2.r(d), c2.d(d, { default: /* @__PURE__ */ __name(() => C2, "default") });
          var e = {};
          c2.r(e), c2.d(e, { GET: /* @__PURE__ */ __name(() => F2, "GET") });
          var f = c2(95736), g2 = c2(9117), h = c2(4044), i = c2(39326), j3 = c2(32324), k3 = c2(261), l = c2(54290), m2 = c2(85328), n = c2(38928), o = c2(46595), p2 = c2(3421), q3 = c2(17679), r = c2(41681), s = c2(63446), t = c2(86439), u = c2(51356), v2 = c2(10641), w3 = c2(48689), x3 = c2(91132), y3 = c2(36993), z3 = c2(48508), A2 = c2(57600);
          let B2 = /* @__PURE__ */ new Set(["home", "delivery-returns", "privacy", "refund", "terms"]);
          async function C2() {
            let a3 = [{ url: (0, A2.rf)("/"), changeFrequency: "weekly", priority: 1 }, { url: (0, A2.rf)("/products"), changeFrequency: "weekly", priority: 0.9 }], b5 = (0, x3.qK)();
            if (!b5) return a3;
            let c3 = (0, x3.Lf)(b5), [d2, e2] = await Promise.all([(0, z3.Mh)(c3), c3.select({ slug: y3.pages.slug, type: y3.pages.type, updatedAt: y3.pages.updatedAt }).from(y3.pages).where((0, w3.Uo)((0, w3.eq)(y3.pages.active, true), (0, w3.eq)(y3.pages.type, "page"))).all()]);
            return a3.push(...d2.map((a4) => ({ url: (0, A2.rf)(`/products/${a4.slug}`), lastModified: (0, A2.ay)(a4.updatedAt), changeFrequency: "weekly", priority: 0.8 }))), a3.push(...e2.filter((a4) => !B2.has(a4.slug)).map((a4) => ({ url: (0, A2.rf)(`/pages/${a4.slug}`), lastModified: (0, A2.ay)(a4.updatedAt), changeFrequency: "monthly", priority: 0.7 }))), a3;
          }
          __name(C2, "C2");
          var D2 = c2(39582);
          let E2 = { ...d }.default;
          if (typeof E2 != "function") throw Error('Default export is missing in "/home/asifnawaz/git/dermaup-hair-oil/app/sitemap.ts"');
          async function F2(a3, b5) {
            let { __metadata_id__: c3, ...d2 } = await b5.params || {}, e2 = !!c3 && c3.endsWith(".xml");
            if (c3 && !e2) return new v2.NextResponse("Not Found", { status: 404 });
            let f2 = c3 && e2 ? c3.slice(0, -4) : void 0, g3 = await E2({ id: f2 }), h2 = (0, D2.resolveRouteData)(g3, "sitemap");
            return new v2.NextResponse(h2, { headers: { "Content-Type": "application/xml", "Cache-Control": "public, max-age=0, must-revalidate" } });
          }
          __name(F2, "F2");
          let G3 = new f.AppRouteRouteModule({ definition: { kind: g2.RouteKind.APP_ROUTE, page: "/sitemap.xml/route", pathname: "/sitemap.xml", filename: "sitemap", bundlePath: "app/sitemap.xml/route" }, distDir: ".next", relativeProjectDir: "", resolvedPagePath: "next-metadata-route-loader?filePath=%2Fhome%2Fasifnawaz%2Fgit%2Fdermaup-hair-oil%2Fapp%2Fsitemap.ts&isDynamicRouteExtension=1!?__next_metadata_route__", nextConfigOutput: "standalone", userland: e }), { workAsyncStorage: H3, workUnitAsyncStorage: I3, serverHooks: J2 } = G3;
          function K3() {
            return (0, h.patchFetch)({ workAsyncStorage: H3, workUnitAsyncStorage: I3 });
          }
          __name(K3, "K3");
          async function L3(a3, b5, c3) {
            var d2;
            let e2 = "/sitemap.xml/route";
            e2 === "/index" && (e2 = "/");
            let f2 = await G3.prepare(a3, b5, { srcPage: e2, multiZoneDraftMode: false });
            if (!f2) return b5.statusCode = 400, b5.end("Bad Request"), c3.waitUntil == null || c3.waitUntil.call(c3, Promise.resolve()), null;
            let { buildId: h2, params: v3, nextConfig: w4, isDraftMode: x4, prerenderManifest: y4, routerServerContext: z4, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, resolvedPathname: C3 } = f2, D3 = (0, k3.normalizeAppPath)(e2), E3 = !!(y4.dynamicRoutes[D3] || y4.routes[C3]);
            if (E3 && !x4) {
              let a4 = !!y4.routes[C3], b6 = y4.dynamicRoutes[D3];
              if (b6 && b6.fallback === false && !a4) throw new t.NoFallbackError();
            }
            let F3 = null;
            !E3 || G3.isDev || x4 || (F3 = (F3 = C3) === "/index" ? "/" : F3);
            let H4 = G3.isDev === true || !E3, I4 = E3 && !H4, J3 = a3.method || "GET", K4 = (0, j3.getTracer)(), L4 = K4.getActiveScopeSpan(), M3 = { params: v3, prerenderManifest: y4, renderOpts: { experimental: { cacheComponents: !!w4.experimental.cacheComponents, authInterrupts: !!w4.experimental.authInterrupts }, supportsDynamicResponse: H4, incrementalCache: (0, i.getRequestMeta)(a3, "incrementalCache"), cacheLifeProfiles: (d2 = w4.experimental) == null ? void 0 : d2.cacheLife, isRevalidate: I4, waitUntil: c3.waitUntil, onClose: /* @__PURE__ */ __name((a4) => {
              b5.on("close", a4);
            }, "onClose"), onAfterTaskError: void 0, onInstrumentationRequestError: /* @__PURE__ */ __name((b6, c4, d3) => G3.onRequestError(a3, b6, d3, z4), "onInstrumentationRequestError") }, sharedContext: { buildId: h2 } }, N3 = new l.NodeNextRequest(a3), O3 = new l.NodeNextResponse(b5), P2 = m2.NextRequestAdapter.fromNodeNextRequest(N3, (0, m2.signalFromNodeResponse)(b5));
            try {
              let d3 = /* @__PURE__ */ __name(async (c4) => G3.handle(P2, M3).finally(() => {
                if (!c4) return;
                c4.setAttributes({ "http.status_code": b5.statusCode, "next.rsc": false });
                let d4 = K4.getRootSpanAttributes();
                if (!d4) return;
                if (d4.get("next.span_type") !== n.BaseServerSpan.handleRequest) return void console.warn(`Unexpected root span type '${d4.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);
                let e3 = d4.get("next.route");
                if (e3) {
                  let a4 = `${J3} ${e3}`;
                  c4.setAttributes({ "next.route": e3, "http.route": e3, "next.span_name": a4 }), c4.updateName(a4);
                } else c4.updateName(`${J3} ${a3.url}`);
              }), "d3"), f3 = /* @__PURE__ */ __name(async (f4) => {
                var h3, j4;
                let k4 = /* @__PURE__ */ __name(async ({ previousCacheEntry: g3 }) => {
                  try {
                    if (!(0, i.getRequestMeta)(a3, "minimalMode") && A3 && B3 && !g3) return b5.statusCode = 404, b5.setHeader("x-nextjs-cache", "REVALIDATED"), b5.end("This page could not be found"), null;
                    let e3 = await d3(f4);
                    a3.fetchMetrics = M3.renderOpts.fetchMetrics;
                    let h4 = M3.renderOpts.pendingWaitUntil;
                    h4 && c3.waitUntil && (c3.waitUntil(h4), h4 = void 0);
                    let j5 = M3.renderOpts.collectedTags;
                    if (!E3) return await (0, p2.I)(N3, O3, e3, M3.renderOpts.pendingWaitUntil), null;
                    {
                      let a4 = await e3.blob(), b6 = (0, q3.toNodeOutgoingHttpHeaders)(e3.headers);
                      j5 && (b6[s.NEXT_CACHE_TAGS_HEADER] = j5), !b6["content-type"] && a4.type && (b6["content-type"] = a4.type);
                      let c4 = M3.renderOpts.collectedRevalidate !== void 0 && !(M3.renderOpts.collectedRevalidate >= s.INFINITE_CACHE) && M3.renderOpts.collectedRevalidate, d4 = M3.renderOpts.collectedExpire === void 0 || M3.renderOpts.collectedExpire >= s.INFINITE_CACHE ? void 0 : M3.renderOpts.collectedExpire;
                      return { value: { kind: u.CachedRouteKind.APP_ROUTE, status: e3.status, body: Buffer.from(await a4.arrayBuffer()), headers: b6 }, cacheControl: { revalidate: c4, expire: d4 } };
                    }
                  } catch (b6) {
                    throw g3?.isStale && await G3.onRequestError(a3, b6, { routerKind: "App Router", routePath: e2, routeType: "route", revalidateReason: (0, o.c)({ isRevalidate: I4, isOnDemandRevalidate: A3 }) }, z4), b6;
                  }
                }, "k4"), l2 = await G3.handleResponse({ req: a3, nextConfig: w4, cacheKey: F3, routeKind: g2.RouteKind.APP_ROUTE, isFallback: false, prerenderManifest: y4, isRoutePPREnabled: false, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, responseGenerator: k4, waitUntil: c3.waitUntil });
                if (!E3) return null;
                if ((l2 == null || (h3 = l2.value) == null ? void 0 : h3.kind) !== u.CachedRouteKind.APP_ROUTE) throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${l2 == null || (j4 = l2.value) == null ? void 0 : j4.kind}`), "__NEXT_ERROR_CODE", { value: "E701", enumerable: false, configurable: true });
                (0, i.getRequestMeta)(a3, "minimalMode") || b5.setHeader("x-nextjs-cache", A3 ? "REVALIDATED" : l2.isMiss ? "MISS" : l2.isStale ? "STALE" : "HIT"), x4 && b5.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
                let m3 = (0, q3.fromNodeOutgoingHttpHeaders)(l2.value.headers);
                return (0, i.getRequestMeta)(a3, "minimalMode") && E3 || m3.delete(s.NEXT_CACHE_TAGS_HEADER), !l2.cacheControl || b5.getHeader("Cache-Control") || m3.get("Cache-Control") || m3.set("Cache-Control", (0, r.getCacheControlHeader)(l2.cacheControl)), await (0, p2.I)(N3, O3, new Response(l2.value.body, { headers: m3, status: l2.value.status || 200 })), null;
              }, "f3");
              L4 ? await f3(L4) : await K4.withPropagatedContext(a3.headers, () => K4.trace(n.BaseServerSpan.handleRequest, { spanName: `${J3} ${a3.url}`, kind: j3.SpanKind.SERVER, attributes: { "http.method": J3, "http.target": a3.url } }, f3));
            } catch (b6) {
              if (b6 instanceof t.NoFallbackError || await G3.onRequestError(a3, b6, { routerKind: "App Router", routePath: D3, routeType: "route", revalidateReason: (0, o.c)({ isRevalidate: I4, isOnDemandRevalidate: A3 }) }), E3) throw b6;
              return await (0, p2.I)(N3, O3, new Response(null, { status: 500 })), null;
            }
          }
          __name(L3, "L3");
        });
