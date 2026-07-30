// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: server Worker route-entry module
// Deployed source path: /home/asifnawaz/git/dermaup-hair-oil/app/api/admin/users/route.ts
// Project-relative source path: app/api/admin/users/route.ts
// Module ID: 82850
// Deployment location(s): dist/worker.js
// Captured factory SHA-256: e7eec582904839bfa4ffefff52a0672bd432ad54a7690e49c65d8c5f69e42c62
// The factory below is preserved as data and is not executed by the extractor.

((a2, b4, c2) => {
          "use strict";
          c2.r(b4), c2.d(b4, { handler: /* @__PURE__ */ __name(() => I3, "handler"), patchFetch: /* @__PURE__ */ __name(() => H3, "patchFetch"), routeModule: /* @__PURE__ */ __name(() => D2, "routeModule"), serverHooks: /* @__PURE__ */ __name(() => G3, "serverHooks"), workAsyncStorage: /* @__PURE__ */ __name(() => E2, "workAsyncStorage"), workUnitAsyncStorage: /* @__PURE__ */ __name(() => F2, "workUnitAsyncStorage") });
          var d = {};
          c2.r(d), c2.d(d, { GET: /* @__PURE__ */ __name(() => B2, "GET"), POST: /* @__PURE__ */ __name(() => C2, "POST") });
          var e = c2(95736), f = c2(9117), g2 = c2(4044), h = c2(39326), i = c2(32324), j3 = c2(261), k3 = c2(54290), l = c2(85328), m2 = c2(38928), n = c2(46595), o = c2(3421), p2 = c2(17679), q3 = c2(41681), r = c2(63446), s = c2(86439), t = c2(51356), u = c2(10641), v2 = c2(2995), w3 = c2(35559), x3 = c2(48689), y3 = c2(91132), z3 = c2(66147);
          let A2 = v2.Ik({ email: v2.Yj().email(), password: v2.Yj().min(6), name: v2.Yj().min(2), role: v2.k5(["admin", "super_admin"]).default("admin") });
          async function B2(a3) {
            try {
              let b5 = await (0, z3.K5)(a3);
              if (!(0, z3.oC)(b5)) return u.NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
              if (!(0, z3.Kv)(b5)) return u.NextResponse.json({ success: false, error: "Super admin access required" }, { status: 403 });
              let c3 = (0, y3.qK)();
              if (!c3) return u.NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
              let d2 = (0, y3.Lf)(c3), e2 = await d2.select({ id: y3.qM.id, email: y3.qM.email, name: y3.qM.name, role: y3.qM.role, lastLogin: y3.qM.lastLogin, createdAt: y3.qM.createdAt }).from(y3.qM).all();
              return u.NextResponse.json({ success: true, data: e2 });
            } catch (a4) {
              return console.error("List admins error:", a4), u.NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 });
            }
          }
          __name(B2, "B2");
          async function C2(a3) {
            try {
              let b5 = await (0, z3.K5)(a3);
              if (!(0, z3.oC)(b5)) return u.NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
              if (!(0, z3.Kv)(b5)) return u.NextResponse.json({ success: false, error: "Super admin access required" }, { status: 403 });
              let c3 = await a3.json(), { email: d2, password: e2, name: f2, role: g3 } = A2.parse(c3), h2 = (0, y3.qK)();
              if (!h2) return u.NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
              let i2 = (0, y3.Lf)(h2);
              if (await i2.select().from(y3.qM).where((0, x3.eq)(y3.qM.email, d2)).get()) return u.NextResponse.json({ success: false, error: "Email already exists" }, { status: 400 });
              let j4 = await (0, z3.Er)(e2), k4 = (0, y3.$C)("admin");
              return await i2.insert(y3.qM).values({ id: k4, email: d2, passwordHash: j4, name: f2, role: g3 }), u.NextResponse.json({ success: true, data: { id: k4, email: d2, name: f2, role: g3 } });
            } catch (a4) {
              return a4 instanceof w3.G ? u.NextResponse.json({ success: false, error: "Invalid input", details: a4.errors }, { status: 400 }) : (console.error("Create admin error:", a4), u.NextResponse.json({ success: false, error: "Internal server error" }, { status: 500 }));
            }
          }
          __name(C2, "C2");
          let D2 = new e.AppRouteRouteModule({ definition: { kind: f.RouteKind.APP_ROUTE, page: "/api/admin/users/route", pathname: "/api/admin/users", filename: "route", bundlePath: "app/api/admin/users/route" }, distDir: ".next", relativeProjectDir: "", resolvedPagePath: "/home/asifnawaz/git/dermaup-hair-oil/app/api/admin/users/route.ts", nextConfigOutput: "standalone", userland: d }), { workAsyncStorage: E2, workUnitAsyncStorage: F2, serverHooks: G3 } = D2;
          function H3() {
            return (0, g2.patchFetch)({ workAsyncStorage: E2, workUnitAsyncStorage: F2 });
          }
          __name(H3, "H3");
          async function I3(a3, b5, c3) {
            var d2;
            let e2 = "/api/admin/users/route";
            e2 === "/index" && (e2 = "/");
            let g3 = await D2.prepare(a3, b5, { srcPage: e2, multiZoneDraftMode: false });
            if (!g3) return b5.statusCode = 400, b5.end("Bad Request"), c3.waitUntil == null || c3.waitUntil.call(c3, Promise.resolve()), null;
            let { buildId: u2, params: v3, nextConfig: w4, isDraftMode: x4, prerenderManifest: y4, routerServerContext: z4, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, resolvedPathname: C3 } = g3, E3 = (0, j3.normalizeAppPath)(e2), F3 = !!(y4.dynamicRoutes[E3] || y4.routes[C3]);
            if (F3 && !x4) {
              let a4 = !!y4.routes[C3], b6 = y4.dynamicRoutes[E3];
              if (b6 && b6.fallback === false && !a4) throw new s.NoFallbackError();
            }
            let G4 = null;
            !F3 || D2.isDev || x4 || (G4 = (G4 = C3) === "/index" ? "/" : G4);
            let H4 = D2.isDev === true || !F3, I4 = F3 && !H4, J2 = a3.method || "GET", K3 = (0, i.getTracer)(), L3 = K3.getActiveScopeSpan(), M3 = { params: v3, prerenderManifest: y4, renderOpts: { experimental: { cacheComponents: !!w4.experimental.cacheComponents, authInterrupts: !!w4.experimental.authInterrupts }, supportsDynamicResponse: H4, incrementalCache: (0, h.getRequestMeta)(a3, "incrementalCache"), cacheLifeProfiles: (d2 = w4.experimental) == null ? void 0 : d2.cacheLife, isRevalidate: I4, waitUntil: c3.waitUntil, onClose: /* @__PURE__ */ __name((a4) => {
              b5.on("close", a4);
            }, "onClose"), onAfterTaskError: void 0, onInstrumentationRequestError: /* @__PURE__ */ __name((b6, c4, d3) => D2.onRequestError(a3, b6, d3, z4), "onInstrumentationRequestError") }, sharedContext: { buildId: u2 } }, N3 = new k3.NodeNextRequest(a3), O3 = new k3.NodeNextResponse(b5), P2 = l.NextRequestAdapter.fromNodeNextRequest(N3, (0, l.signalFromNodeResponse)(b5));
            try {
              let d3 = /* @__PURE__ */ __name(async (c4) => D2.handle(P2, M3).finally(() => {
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
                    if (!(0, h.getRequestMeta)(a3, "minimalMode") && A3 && B3 && !f2) return b5.statusCode = 404, b5.setHeader("x-nextjs-cache", "REVALIDATED"), b5.end("This page could not be found"), null;
                    let e3 = await d3(g5);
                    a3.fetchMetrics = M3.renderOpts.fetchMetrics;
                    let i3 = M3.renderOpts.pendingWaitUntil;
                    i3 && c3.waitUntil && (c3.waitUntil(i3), i3 = void 0);
                    let j5 = M3.renderOpts.collectedTags;
                    if (!F3) return await (0, o.I)(N3, O3, e3, M3.renderOpts.pendingWaitUntil), null;
                    {
                      let a4 = await e3.blob(), b6 = (0, p2.toNodeOutgoingHttpHeaders)(e3.headers);
                      j5 && (b6[r.NEXT_CACHE_TAGS_HEADER] = j5), !b6["content-type"] && a4.type && (b6["content-type"] = a4.type);
                      let c4 = M3.renderOpts.collectedRevalidate !== void 0 && !(M3.renderOpts.collectedRevalidate >= r.INFINITE_CACHE) && M3.renderOpts.collectedRevalidate, d4 = M3.renderOpts.collectedExpire === void 0 || M3.renderOpts.collectedExpire >= r.INFINITE_CACHE ? void 0 : M3.renderOpts.collectedExpire;
                      return { value: { kind: t.CachedRouteKind.APP_ROUTE, status: e3.status, body: Buffer.from(await a4.arrayBuffer()), headers: b6 }, cacheControl: { revalidate: c4, expire: d4 } };
                    }
                  } catch (b6) {
                    throw f2?.isStale && await D2.onRequestError(a3, b6, { routerKind: "App Router", routePath: e2, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I4, isOnDemandRevalidate: A3 }) }, z4), b6;
                  }
                }, "k4"), l2 = await D2.handleResponse({ req: a3, nextConfig: w4, cacheKey: G4, routeKind: f.RouteKind.APP_ROUTE, isFallback: false, prerenderManifest: y4, isRoutePPREnabled: false, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, responseGenerator: k4, waitUntil: c3.waitUntil });
                if (!F3) return null;
                if ((l2 == null || (i2 = l2.value) == null ? void 0 : i2.kind) !== t.CachedRouteKind.APP_ROUTE) throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${l2 == null || (j4 = l2.value) == null ? void 0 : j4.kind}`), "__NEXT_ERROR_CODE", { value: "E701", enumerable: false, configurable: true });
                (0, h.getRequestMeta)(a3, "minimalMode") || b5.setHeader("x-nextjs-cache", A3 ? "REVALIDATED" : l2.isMiss ? "MISS" : l2.isStale ? "STALE" : "HIT"), x4 && b5.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
                let m3 = (0, p2.fromNodeOutgoingHttpHeaders)(l2.value.headers);
                return (0, h.getRequestMeta)(a3, "minimalMode") && F3 || m3.delete(r.NEXT_CACHE_TAGS_HEADER), !l2.cacheControl || b5.getHeader("Cache-Control") || m3.get("Cache-Control") || m3.set("Cache-Control", (0, q3.getCacheControlHeader)(l2.cacheControl)), await (0, o.I)(N3, O3, new Response(l2.value.body, { headers: m3, status: l2.value.status || 200 })), null;
              }, "g4");
              L3 ? await g4(L3) : await K3.withPropagatedContext(a3.headers, () => K3.trace(m2.BaseServerSpan.handleRequest, { spanName: `${J2} ${a3.url}`, kind: i.SpanKind.SERVER, attributes: { "http.method": J2, "http.target": a3.url } }, g4));
            } catch (b6) {
              if (b6 instanceof s.NoFallbackError || await D2.onRequestError(a3, b6, { routerKind: "App Router", routePath: E3, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I4, isOnDemandRevalidate: A3 }) }), F3) throw b6;
              return await (0, o.I)(N3, O3, new Response(null, { status: 500 })), null;
            }
          }
          __name(I3, "I3");
        });
