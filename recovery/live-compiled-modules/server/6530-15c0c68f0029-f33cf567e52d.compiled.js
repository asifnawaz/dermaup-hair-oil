// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: server Worker route-entry module
// Deployed source path: next-metadata-route-loader?filePath=%2Fhome%2Fasifnawaz%2Fgit%2Fdermaup-hair-oil%2Fapp%2Ficon.svg&isDynamicRouteExtension=0!?__next_metadata_route__
// Project-relative source path: unknown
// Module ID: 6530
// Deployment location(s): dist/worker.js
// Captured factory SHA-256: f33cf567e52d182fbf8bb883ecab02a3b09d7b86757b12248aba0ca909fedaed
// The factory below is preserved as data and is not executed by the extractor.

((a2, b4, c2) => {
          c2.r(b4), c2.d(b4, { handler: /* @__PURE__ */ __name(() => D2, "handler"), patchFetch: /* @__PURE__ */ __name(() => C2, "patchFetch"), routeModule: /* @__PURE__ */ __name(() => y3, "routeModule"), serverHooks: /* @__PURE__ */ __name(() => B2, "serverHooks"), workAsyncStorage: /* @__PURE__ */ __name(() => z3, "workAsyncStorage"), workUnitAsyncStorage: /* @__PURE__ */ __name(() => A2, "workUnitAsyncStorage") });
          var d = {};
          c2.r(d), c2.d(d, { GET: /* @__PURE__ */ __name(() => w3, "GET"), dynamic: /* @__PURE__ */ __name(() => x3, "dynamic") });
          var e = c2(95736), f = c2(9117), g2 = c2(4044), h = c2(39326), i = c2(32324), j3 = c2(261), k3 = c2(54290), l = c2(85328), m2 = c2(38928), n = c2(46595), o = c2(3421), p2 = c2(17679), q3 = c2(41681), r = c2(63446), s = c2(86439), t = c2(51356), u = c2(10641);
          let v2 = Buffer.from("PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCA2NCA2NCI+CiAgPGRlZnM+CiAgICA8bGluZWFyR3JhZGllbnQgaWQ9InVwZGVybWEtaWNvbi1maWxsIiB4MT0iMTQiIHgyPSI1MCIgeTE9IjgiIHkyPSI1NiIgZ3JhZGllbnRVbml0cz0idXNlclNwYWNlT25Vc2UiPgogICAgICA8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiNkOTc3MDYiLz4KICAgICAgPHN0b3Agb2Zmc2V0PSIxIiBzdG9wLWNvbG9yPSIjZjU5ZTBiIi8+CiAgICA8L2xpbmVhckdyYWRpZW50PgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHJ4PSIxNiIgZmlsbD0iI2ZmZmFmMCIvPgogIDxwYXRoCiAgICBmaWxsPSJ1cmwoI3VwZGVybWEtaWNvbi1maWxsKSIKICAgIGQ9Ik0zMiA4Yy04LjggMTEtMTQgMTktMTQgMjcuNEMxOCA0NiAyNC41IDUyIDMyIDUyczE0LTYgMTQtMTYuNkM0NiAyNyA0MC44IDE5IDMyIDhabTAgMzcuM2MtNC41IDAtOC0zLjYtOC05LjEgMC00LjYgMi41LTkuOCA4LTE3LjMgNS41IDcuNSA4IDEyLjcgOCAxNy4zIDAgNS41LTMuNSA5LjEtOCA5LjFaIgogIC8+CiAgPGNpcmNsZSBjeD0iMzkiIGN5PSIyNSIgcj0iNCIgZmlsbD0iI2ZkZTY4YSIvPgo8L3N2Zz4K", "base64");
          function w3() {
            return new u.NextResponse(v2, { headers: { "Content-Type": "image/svg+xml", "Cache-Control": "public, immutable, no-transform, max-age=31536000" } });
          }
          __name(w3, "w3");
          let x3 = "force-static", y3 = new e.AppRouteRouteModule({ definition: { kind: f.RouteKind.APP_ROUTE, page: "/icon.svg/route", pathname: "/icon.svg", filename: "icon", bundlePath: "app/icon.svg/route" }, distDir: ".next", relativeProjectDir: "", resolvedPagePath: "next-metadata-route-loader?filePath=%2Fhome%2Fasifnawaz%2Fgit%2Fdermaup-hair-oil%2Fapp%2Ficon.svg&isDynamicRouteExtension=0!?__next_metadata_route__", nextConfigOutput: "standalone", userland: d }), { workAsyncStorage: z3, workUnitAsyncStorage: A2, serverHooks: B2 } = y3;
          function C2() {
            return (0, g2.patchFetch)({ workAsyncStorage: z3, workUnitAsyncStorage: A2 });
          }
          __name(C2, "C2");
          async function D2(a3, b5, c3) {
            var d2;
            let e2 = "/icon.svg/route";
            e2 === "/index" && (e2 = "/");
            let g3 = await y3.prepare(a3, b5, { srcPage: e2, multiZoneDraftMode: false });
            if (!g3) return b5.statusCode = 400, b5.end("Bad Request"), c3.waitUntil == null || c3.waitUntil.call(c3, Promise.resolve()), null;
            let { buildId: u2, params: v3, nextConfig: w4, isDraftMode: x4, prerenderManifest: z4, routerServerContext: A3, isOnDemandRevalidate: B3, revalidateOnlyGenerated: C3, resolvedPathname: D3 } = g3, E2 = (0, j3.normalizeAppPath)(e2), F2 = !!(z4.dynamicRoutes[E2] || z4.routes[D3]);
            if (F2 && !x4) {
              let a4 = !!z4.routes[D3], b6 = z4.dynamicRoutes[E2];
              if (b6 && b6.fallback === false && !a4) throw new s.NoFallbackError();
            }
            let G3 = null;
            !F2 || y3.isDev || x4 || (G3 = (G3 = D3) === "/index" ? "/" : G3);
            let H3 = y3.isDev === true || !F2, I3 = F2 && !H3, J2 = a3.method || "GET", K3 = (0, i.getTracer)(), L3 = K3.getActiveScopeSpan(), M3 = { params: v3, prerenderManifest: z4, renderOpts: { experimental: { cacheComponents: !!w4.experimental.cacheComponents, authInterrupts: !!w4.experimental.authInterrupts }, supportsDynamicResponse: H3, incrementalCache: (0, h.getRequestMeta)(a3, "incrementalCache"), cacheLifeProfiles: (d2 = w4.experimental) == null ? void 0 : d2.cacheLife, isRevalidate: I3, waitUntil: c3.waitUntil, onClose: /* @__PURE__ */ __name((a4) => {
              b5.on("close", a4);
            }, "onClose"), onAfterTaskError: void 0, onInstrumentationRequestError: /* @__PURE__ */ __name((b6, c4, d3) => y3.onRequestError(a3, b6, d3, A3), "onInstrumentationRequestError") }, sharedContext: { buildId: u2 } }, N3 = new k3.NodeNextRequest(a3), O3 = new k3.NodeNextResponse(b5), P2 = l.NextRequestAdapter.fromNodeNextRequest(N3, (0, l.signalFromNodeResponse)(b5));
            try {
              let d3 = /* @__PURE__ */ __name(async (c4) => y3.handle(P2, M3).finally(() => {
                if (!c4) return;
                c4.setAttributes({ "http.status_code": b5.statusCode, "next.rsc": false });
                let d4 = K3.getRootSpanAttributes();
                if (!d4) return;
                if (d4.get("next.span_type") !== m2.BaseServerSpan.handleRequest) return void console.warn(`Unexpected root span type '${d4.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);
                let e3 = d4.get("next.route");
                if (e3) {
                  let a4 = `${J2} ${e3}`;
                  c4.setAttributes({ "next.route": e3, "http.route": e3, "next.span_name": a4 }), c4.updateName(a4);
                } else c4.updateName(`${J2} ${a3.url}`);
              }), "d3"), g4 = /* @__PURE__ */ __name(async (g5) => {
                var i2, j4;
                let k4 = /* @__PURE__ */ __name(async ({ previousCacheEntry: f2 }) => {
                  try {
                    if (!(0, h.getRequestMeta)(a3, "minimalMode") && B3 && C3 && !f2) return b5.statusCode = 404, b5.setHeader("x-nextjs-cache", "REVALIDATED"), b5.end("This page could not be found"), null;
                    let e3 = await d3(g5);
                    a3.fetchMetrics = M3.renderOpts.fetchMetrics;
                    let i3 = M3.renderOpts.pendingWaitUntil;
                    i3 && c3.waitUntil && (c3.waitUntil(i3), i3 = void 0);
                    let j5 = M3.renderOpts.collectedTags;
                    if (!F2) return await (0, o.I)(N3, O3, e3, M3.renderOpts.pendingWaitUntil), null;
                    {
                      let a4 = await e3.blob(), b6 = (0, p2.toNodeOutgoingHttpHeaders)(e3.headers);
                      j5 && (b6[r.NEXT_CACHE_TAGS_HEADER] = j5), !b6["content-type"] && a4.type && (b6["content-type"] = a4.type);
                      let c4 = M3.renderOpts.collectedRevalidate !== void 0 && !(M3.renderOpts.collectedRevalidate >= r.INFINITE_CACHE) && M3.renderOpts.collectedRevalidate, d4 = M3.renderOpts.collectedExpire === void 0 || M3.renderOpts.collectedExpire >= r.INFINITE_CACHE ? void 0 : M3.renderOpts.collectedExpire;
                      return { value: { kind: t.CachedRouteKind.APP_ROUTE, status: e3.status, body: Buffer.from(await a4.arrayBuffer()), headers: b6 }, cacheControl: { revalidate: c4, expire: d4 } };
                    }
                  } catch (b6) {
                    throw f2?.isStale && await y3.onRequestError(a3, b6, { routerKind: "App Router", routePath: e2, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I3, isOnDemandRevalidate: B3 }) }, A3), b6;
                  }
                }, "k4"), l2 = await y3.handleResponse({ req: a3, nextConfig: w4, cacheKey: G3, routeKind: f.RouteKind.APP_ROUTE, isFallback: false, prerenderManifest: z4, isRoutePPREnabled: false, isOnDemandRevalidate: B3, revalidateOnlyGenerated: C3, responseGenerator: k4, waitUntil: c3.waitUntil });
                if (!F2) return null;
                if ((l2 == null || (i2 = l2.value) == null ? void 0 : i2.kind) !== t.CachedRouteKind.APP_ROUTE) throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${l2 == null || (j4 = l2.value) == null ? void 0 : j4.kind}`), "__NEXT_ERROR_CODE", { value: "E701", enumerable: false, configurable: true });
                (0, h.getRequestMeta)(a3, "minimalMode") || b5.setHeader("x-nextjs-cache", B3 ? "REVALIDATED" : l2.isMiss ? "MISS" : l2.isStale ? "STALE" : "HIT"), x4 && b5.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
                let m3 = (0, p2.fromNodeOutgoingHttpHeaders)(l2.value.headers);
                return (0, h.getRequestMeta)(a3, "minimalMode") && F2 || m3.delete(r.NEXT_CACHE_TAGS_HEADER), !l2.cacheControl || b5.getHeader("Cache-Control") || m3.get("Cache-Control") || m3.set("Cache-Control", (0, q3.getCacheControlHeader)(l2.cacheControl)), await (0, o.I)(N3, O3, new Response(l2.value.body, { headers: m3, status: l2.value.status || 200 })), null;
              }, "g4");
              L3 ? await g4(L3) : await K3.withPropagatedContext(a3.headers, () => K3.trace(m2.BaseServerSpan.handleRequest, { spanName: `${J2} ${a3.url}`, kind: i.SpanKind.SERVER, attributes: { "http.method": J2, "http.target": a3.url } }, g4));
            } catch (b6) {
              if (b6 instanceof s.NoFallbackError || await y3.onRequestError(a3, b6, { routerKind: "App Router", routePath: E2, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I3, isOnDemandRevalidate: B3 }) }), F2) throw b6;
              return await (0, o.I)(N3, O3, new Response(null, { status: 500 })), null;
            }
          }
          __name(D2, "D2");
        });
