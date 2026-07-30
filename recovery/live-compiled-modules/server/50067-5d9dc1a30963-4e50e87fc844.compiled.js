// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: server Worker route-entry module
// Deployed source path: /home/asifnawaz/git/dermaup-hair-oil/app/api/admin/orders/[id]/route.ts
// Project-relative source path: app/api/admin/orders/[id]/route.ts
// Module ID: 50067
// Deployment location(s): dist/worker.js
// Captured factory SHA-256: 4e50e87fc84465bfba75fc61ab17e310c664725fcaca2d4adab659d95e2e8b51
// The factory below is preserved as data and is not executed by the extractor.

((a2, b4, c2) => {
          "use strict";
          c2.r(b4), c2.d(b4, { handler: /* @__PURE__ */ __name(() => K3, "handler"), patchFetch: /* @__PURE__ */ __name(() => J2, "patchFetch"), routeModule: /* @__PURE__ */ __name(() => F2, "routeModule"), serverHooks: /* @__PURE__ */ __name(() => I3, "serverHooks"), workAsyncStorage: /* @__PURE__ */ __name(() => G3, "workAsyncStorage"), workUnitAsyncStorage: /* @__PURE__ */ __name(() => H3, "workUnitAsyncStorage") });
          var d = {};
          c2.r(d), c2.d(d, { GET: /* @__PURE__ */ __name(() => C2, "GET"), PATCH: /* @__PURE__ */ __name(() => E2, "PATCH") });
          var e = c2(95736), f = c2(9117), g2 = c2(4044), h = c2(39326), i = c2(32324), j3 = c2(261), k3 = c2(54290), l = c2(85328), m2 = c2(38928), n = c2(46595), o = c2(3421), p2 = c2(17679), q3 = c2(41681), r = c2(63446), s = c2(86439), t = c2(51356), u = c2(10641), v2 = c2(2995), w3 = c2(35559), x3 = c2(48689), y3 = c2(71559), z3 = c2(91132), A2 = c2(36993), B2 = c2(66147);
          async function C2(a3, { params: b5 }) {
            let c3 = await (0, B2.K5)(a3);
            if (!(0, B2.oC)(c3)) return u.NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
            try {
              let { id: a4 } = await b5, c4 = (0, z3.qK)();
              if (!c4) return u.NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
              let d2 = (0, z3.Lf)(c4), e2 = await d2.select().from(z3.Ww).where((0, x3.eq)(z3.Ww.id, a4)).get();
              if (!e2) return u.NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
              let f2 = await d2.select().from(z3.Y4).where((0, x3.eq)(z3.Y4.orderId, a4)).orderBy((0, y3.i)(z3.Y4.createdAt)).all(), g3 = [];
              return e2.packageType === "multi" && (g3 = await d2.select().from(A2.orderItems).where((0, x3.eq)(A2.orderItems.orderId, a4)).all()), u.NextResponse.json({ success: true, data: { order: e2, activity: f2, items: g3 } });
            } catch (a4) {
              return console.error("Get order error:", a4), u.NextResponse.json({ success: false, error: "Failed to fetch order" }, { status: 500 });
            }
          }
          __name(C2, "C2");
          let D2 = v2.Ik({ orderStatus: v2.k5(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(), paymentStatus: v2.k5(["pending", "verified", "failed"]).optional(), courierName: v2.Yj().optional(), trackingNumber: v2.Yj().optional(), trackingUrl: v2.Yj().optional(), note: v2.Yj().optional() });
          async function E2(a3, { params: b5 }) {
            let c3 = await (0, B2.K5)(a3);
            if (!(0, B2.oC)(c3)) return u.NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
            try {
              let { id: d2 } = await b5, e2 = await a3.json(), f2 = D2.parse(e2), g3 = (0, z3.qK)();
              if (!g3) return u.NextResponse.json({ success: false, error: "Database not available" }, { status: 500 });
              let h2 = (0, z3.Lf)(g3), i2 = await h2.select().from(z3.Ww).where((0, x3.eq)(z3.Ww.id, d2)).get();
              if (!i2) return u.NextResponse.json({ success: false, error: "Order not found" }, { status: 404 });
              let j4 = { updatedAt: (/* @__PURE__ */ new Date()).toISOString() };
              f2.orderStatus && (j4.orderStatus = f2.orderStatus, f2.orderStatus === "shipped" ? j4.shippedAt = (/* @__PURE__ */ new Date()).toISOString() : f2.orderStatus === "delivered" && (j4.deliveredAt = (/* @__PURE__ */ new Date()).toISOString())), f2.paymentStatus && (j4.paymentStatus = f2.paymentStatus), f2.courierName && (j4.courierName = f2.courierName), f2.trackingNumber && (j4.trackingNumber = f2.trackingNumber), f2.trackingUrl && (j4.trackingUrl = f2.trackingUrl), await h2.update(z3.Ww).set(j4).where((0, x3.eq)(z3.Ww.id, d2));
              let k4 = z3.LM.NOTE_ADDED, l2 = {};
              f2.orderStatus ? (k4 = f2.orderStatus, l2 = { previousStatus: i2.orderStatus, newStatus: f2.orderStatus }) : f2.paymentStatus === "verified" ? (k4 = z3.LM.PAYMENT_VERIFIED, l2 = { previousStatus: i2.paymentStatus }) : f2.paymentStatus === "failed" && (k4 = z3.LM.PAYMENT_FAILED, l2 = { previousStatus: i2.paymentStatus }), f2.note && (l2.note = f2.note), await h2.insert(z3.Y4).values({ id: (0, z3.$C)("act"), orderId: d2, action: k4, details: JSON.stringify(l2), performedBy: c3.id });
              let m3 = await h2.select().from(z3.Ww).where((0, x3.eq)(z3.Ww.id, d2)).get();
              return u.NextResponse.json({ success: true, data: { order: m3 } });
            } catch (a4) {
              return a4 instanceof w3.G ? u.NextResponse.json({ success: false, error: "Invalid input", details: a4.errors }, { status: 400 }) : (console.error("Update order error:", a4), u.NextResponse.json({ success: false, error: "Failed to update order" }, { status: 500 }));
            }
          }
          __name(E2, "E2");
          let F2 = new e.AppRouteRouteModule({ definition: { kind: f.RouteKind.APP_ROUTE, page: "/api/admin/orders/[id]/route", pathname: "/api/admin/orders/[id]", filename: "route", bundlePath: "app/api/admin/orders/[id]/route" }, distDir: ".next", relativeProjectDir: "", resolvedPagePath: "/home/asifnawaz/git/dermaup-hair-oil/app/api/admin/orders/[id]/route.ts", nextConfigOutput: "standalone", userland: d }), { workAsyncStorage: G3, workUnitAsyncStorage: H3, serverHooks: I3 } = F2;
          function J2() {
            return (0, g2.patchFetch)({ workAsyncStorage: G3, workUnitAsyncStorage: H3 });
          }
          __name(J2, "J2");
          async function K3(a3, b5, c3) {
            var d2;
            let e2 = "/api/admin/orders/[id]/route";
            e2 === "/index" && (e2 = "/");
            let g3 = await F2.prepare(a3, b5, { srcPage: e2, multiZoneDraftMode: false });
            if (!g3) return b5.statusCode = 400, b5.end("Bad Request"), c3.waitUntil == null || c3.waitUntil.call(c3, Promise.resolve()), null;
            let { buildId: u2, params: v3, nextConfig: w4, isDraftMode: x4, prerenderManifest: y4, routerServerContext: z4, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, resolvedPathname: C3 } = g3, D3 = (0, j3.normalizeAppPath)(e2), E3 = !!(y4.dynamicRoutes[D3] || y4.routes[C3]);
            if (E3 && !x4) {
              let a4 = !!y4.routes[C3], b6 = y4.dynamicRoutes[D3];
              if (b6 && b6.fallback === false && !a4) throw new s.NoFallbackError();
            }
            let G4 = null;
            !E3 || F2.isDev || x4 || (G4 = (G4 = C3) === "/index" ? "/" : G4);
            let H4 = F2.isDev === true || !E3, I4 = E3 && !H4, J3 = a3.method || "GET", K4 = (0, i.getTracer)(), L3 = K4.getActiveScopeSpan(), M3 = { params: v3, prerenderManifest: y4, renderOpts: { experimental: { cacheComponents: !!w4.experimental.cacheComponents, authInterrupts: !!w4.experimental.authInterrupts }, supportsDynamicResponse: H4, incrementalCache: (0, h.getRequestMeta)(a3, "incrementalCache"), cacheLifeProfiles: (d2 = w4.experimental) == null ? void 0 : d2.cacheLife, isRevalidate: I4, waitUntil: c3.waitUntil, onClose: /* @__PURE__ */ __name((a4) => {
              b5.on("close", a4);
            }, "onClose"), onAfterTaskError: void 0, onInstrumentationRequestError: /* @__PURE__ */ __name((b6, c4, d3) => F2.onRequestError(a3, b6, d3, z4), "onInstrumentationRequestError") }, sharedContext: { buildId: u2 } }, N3 = new k3.NodeNextRequest(a3), O3 = new k3.NodeNextResponse(b5), P2 = l.NextRequestAdapter.fromNodeNextRequest(N3, (0, l.signalFromNodeResponse)(b5));
            try {
              let d3 = /* @__PURE__ */ __name(async (c4) => F2.handle(P2, M3).finally(() => {
                if (!c4) return;
                c4.setAttributes({ "http.status_code": b5.statusCode, "next.rsc": false });
                let d4 = K4.getRootSpanAttributes();
                if (!d4) return;
                if (d4.get("next.span_type") !== m2.BaseServerSpan.handleRequest) return void console.warn(`Unexpected root span type '${d4.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);
                let e3 = d4.get("next.route");
                if (e3) {
                  let a4 = `${J3} ${e3}`;
                  c4.setAttributes({ "next.route": e3, "http.route": e3, "next.span_name": a4 }), c4.updateName(a4);
                } else c4.updateName(`${J3} ${a3.url}`);
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
                    if (!E3) return await (0, o.I)(N3, O3, e3, M3.renderOpts.pendingWaitUntil), null;
                    {
                      let a4 = await e3.blob(), b6 = (0, p2.toNodeOutgoingHttpHeaders)(e3.headers);
                      j5 && (b6[r.NEXT_CACHE_TAGS_HEADER] = j5), !b6["content-type"] && a4.type && (b6["content-type"] = a4.type);
                      let c4 = M3.renderOpts.collectedRevalidate !== void 0 && !(M3.renderOpts.collectedRevalidate >= r.INFINITE_CACHE) && M3.renderOpts.collectedRevalidate, d4 = M3.renderOpts.collectedExpire === void 0 || M3.renderOpts.collectedExpire >= r.INFINITE_CACHE ? void 0 : M3.renderOpts.collectedExpire;
                      return { value: { kind: t.CachedRouteKind.APP_ROUTE, status: e3.status, body: Buffer.from(await a4.arrayBuffer()), headers: b6 }, cacheControl: { revalidate: c4, expire: d4 } };
                    }
                  } catch (b6) {
                    throw f2?.isStale && await F2.onRequestError(a3, b6, { routerKind: "App Router", routePath: e2, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I4, isOnDemandRevalidate: A3 }) }, z4), b6;
                  }
                }, "k4"), l2 = await F2.handleResponse({ req: a3, nextConfig: w4, cacheKey: G4, routeKind: f.RouteKind.APP_ROUTE, isFallback: false, prerenderManifest: y4, isRoutePPREnabled: false, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, responseGenerator: k4, waitUntil: c3.waitUntil });
                if (!E3) return null;
                if ((l2 == null || (i2 = l2.value) == null ? void 0 : i2.kind) !== t.CachedRouteKind.APP_ROUTE) throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${l2 == null || (j4 = l2.value) == null ? void 0 : j4.kind}`), "__NEXT_ERROR_CODE", { value: "E701", enumerable: false, configurable: true });
                (0, h.getRequestMeta)(a3, "minimalMode") || b5.setHeader("x-nextjs-cache", A3 ? "REVALIDATED" : l2.isMiss ? "MISS" : l2.isStale ? "STALE" : "HIT"), x4 && b5.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
                let m3 = (0, p2.fromNodeOutgoingHttpHeaders)(l2.value.headers);
                return (0, h.getRequestMeta)(a3, "minimalMode") && E3 || m3.delete(r.NEXT_CACHE_TAGS_HEADER), !l2.cacheControl || b5.getHeader("Cache-Control") || m3.get("Cache-Control") || m3.set("Cache-Control", (0, q3.getCacheControlHeader)(l2.cacheControl)), await (0, o.I)(N3, O3, new Response(l2.value.body, { headers: m3, status: l2.value.status || 200 })), null;
              }, "g4");
              L3 ? await g4(L3) : await K4.withPropagatedContext(a3.headers, () => K4.trace(m2.BaseServerSpan.handleRequest, { spanName: `${J3} ${a3.url}`, kind: i.SpanKind.SERVER, attributes: { "http.method": J3, "http.target": a3.url } }, g4));
            } catch (b6) {
              if (b6 instanceof s.NoFallbackError || await F2.onRequestError(a3, b6, { routerKind: "App Router", routePath: D3, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I4, isOnDemandRevalidate: A3 }) }), E3) throw b6;
              return await (0, o.I)(N3, O3, new Response(null, { status: 500 })), null;
            }
          }
          __name(K3, "K3");
        });
