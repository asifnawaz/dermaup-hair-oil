// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: server Worker route-entry module
// Deployed source path: /home/asifnawaz/git/dermaup-hair-oil/app/api/admin/dashboard/stats/route.ts
// Project-relative source path: app/api/admin/dashboard/stats/route.ts
// Module ID: 96242
// Deployment location(s): dist/worker.js
// Captured factory SHA-256: 94a46bac3f15f0e440438600f1967323f639a3cd1ff1372ff8d16292ba8dfa98
// The factory below is preserved as data and is not executed by the extractor.

((a2, b4, c2) => {
          "use strict";
          c2.r(b4), c2.d(b4, { handler: /* @__PURE__ */ __name(() => G3, "handler"), patchFetch: /* @__PURE__ */ __name(() => F2, "patchFetch"), routeModule: /* @__PURE__ */ __name(() => B2, "routeModule"), serverHooks: /* @__PURE__ */ __name(() => E2, "serverHooks"), workAsyncStorage: /* @__PURE__ */ __name(() => C2, "workAsyncStorage"), workUnitAsyncStorage: /* @__PURE__ */ __name(() => D2, "workUnitAsyncStorage") });
          var d = {};
          c2.r(d), c2.d(d, { GET: /* @__PURE__ */ __name(() => A2, "GET") });
          var e = c2(95736), f = c2(9117), g2 = c2(4044), h = c2(39326), i = c2(32324), j3 = c2(261), k3 = c2(54290), l = c2(85328), m2 = c2(38928), n = c2(46595), o = c2(3421), p2 = c2(17679), q3 = c2(41681), r = c2(63446), s = c2(86439), t = c2(51356), u = c2(10641), v2 = c2(85766), w3 = c2(48689), x3 = c2(91132), y3 = c2(24423), z3 = c2(66147);
          async function A2(a3) {
            let b5 = await (0, z3.K5)(a3);
            if (!(0, z3.oC)(b5)) return u.NextResponse.json({ success: false, error: "Not authenticated" }, { status: 401 });
            try {
              let b6, { searchParams: c3 } = new URL(a3.url), d2 = c3.get("period") || "7d", e2 = /* @__PURE__ */ new Date();
              switch (d2) {
                case "1d":
                  b6 = new Date(e2.getTime() - 864e5);
                  break;
                case "7d":
                default:
                  b6 = new Date(e2.getTime() - 6048e5);
                  break;
                case "30d":
                  b6 = new Date(e2.getTime() - 2592e6);
                  break;
                case "all":
                  b6 = /* @__PURE__ */ new Date(0);
              }
              let f2 = (0, x3.qK)();
              if (!f2) return u.NextResponse.json({ success: true, data: { totalOrders: 0, totalRevenue: 0, pendingPayments: 0, pendingShipments: 0, averageOrderValue: 0, ordersByStatus: { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 }, ordersByPayment: { cod: 0, easypaisa: 0, bank: 0 }, ordersByPackage: { single: 0, double: 0, triple: 0 }, revenueByPayment: { cod: 0, easypaisa: 0, bank: 0 }, topCities: [], recentOrders: [] } });
              let g3 = (0, x3.Lf)(f2), h2 = (0, y3.W)(b6), i2 = await g3.select({ count: (0, v2.ll)`count(*)` }).from(x3.Ww).where((0, w3.RO)(x3.Ww.createdAt, h2)).get(), j4 = i2?.count || 0, k4 = await g3.select({ total: (0, v2.ll)`sum(${x3.Ww.total})` }).from(x3.Ww).where((0, w3.Uo)((0, w3.RO)(x3.Ww.createdAt, h2), (0, v2.ll)`${x3.Ww.orderStatus} != 'cancelled'`)).get(), l2 = k4?.total || 0, m3 = await g3.select({ count: (0, v2.ll)`count(*)` }).from(x3.Ww).where((0, w3.Uo)((0, v2.ll)`${x3.Ww.paymentStatus} = 'pending'`, (0, v2.ll)`${x3.Ww.paymentMethod} != 'cod'`)).get(), n2 = m3?.count || 0, o2 = await g3.select({ count: (0, v2.ll)`count(*)` }).from(x3.Ww).where((0, w3.Uo)((0, v2.ll)`${x3.Ww.orderStatus} IN ('pending', 'confirmed')`, (0, v2.ll)`${x3.Ww.orderStatus} != 'cancelled'`)).get(), p3 = o2?.count || 0, q4 = await g3.select({ status: x3.Ww.orderStatus, count: (0, v2.ll)`count(*)` }).from(x3.Ww).where((0, w3.RO)(x3.Ww.createdAt, h2)).groupBy(x3.Ww.orderStatus).all(), r2 = { pending: 0, confirmed: 0, shipped: 0, delivered: 0, cancelled: 0 };
              q4.forEach((a4) => {
                a4.status && a4.status in r2 && (r2[a4.status] = a4.count);
              });
              let s2 = await g3.select({ method: x3.Ww.paymentMethod, count: (0, v2.ll)`count(*)`, revenue: (0, v2.ll)`sum(${x3.Ww.total})` }).from(x3.Ww).where((0, w3.Uo)((0, w3.RO)(x3.Ww.createdAt, h2), (0, v2.ll)`${x3.Ww.orderStatus} != 'cancelled'`)).groupBy(x3.Ww.paymentMethod).all(), t2 = { cod: 0, easypaisa: 0, bank: 0 }, z4 = { cod: 0, easypaisa: 0, bank: 0 };
              s2.forEach((a4) => {
                a4.method && a4.method in t2 && (t2[a4.method] = a4.count, z4[a4.method] = a4.revenue || 0);
              });
              let A3 = await g3.select({ packageType: x3.Ww.packageType, count: (0, v2.ll)`count(*)` }).from(x3.Ww).where((0, w3.Uo)((0, w3.RO)(x3.Ww.createdAt, h2), (0, v2.ll)`${x3.Ww.orderStatus} != 'cancelled'`)).groupBy(x3.Ww.packageType).all(), B3 = { single: 0, double: 0, triple: 0 };
              A3.forEach((a4) => {
                a4.packageType && a4.packageType in B3 && (B3[a4.packageType] = a4.count);
              });
              let C3 = (await g3.select({ city: x3.Ww.city, count: (0, v2.ll)`count(*)` }).from(x3.Ww).where((0, w3.Uo)((0, w3.RO)(x3.Ww.createdAt, h2), (0, v2.ll)`${x3.Ww.orderStatus} != 'cancelled'`)).groupBy(x3.Ww.city).orderBy((0, v2.ll)`count(*) DESC`).limit(10).all()).map((a4) => ({ city: a4.city, orders: a4.count, percentage: j4 > 0 ? Math.round(a4.count / j4 * 100) : 0 })), D3 = await g3.select({ id: x3.Ww.id, orderNumber: x3.Ww.orderNumber, customerName: x3.Ww.customerName, total: x3.Ww.total, orderStatus: x3.Ww.orderStatus, paymentStatus: x3.Ww.paymentStatus, paymentMethod: x3.Ww.paymentMethod, createdAt: x3.Ww.createdAt }).from(x3.Ww).orderBy((0, v2.ll)`${x3.Ww.createdAt} DESC`).limit(10).all(), E3 = j4 > 0 ? Math.round(l2 / j4) : 0;
              return u.NextResponse.json({ success: true, data: { totalOrders: j4, totalRevenue: l2, pendingPayments: n2, pendingShipments: p3, averageOrderValue: E3, ordersByStatus: r2, ordersByPayment: t2, ordersByPackage: B3, revenueByPayment: z4, topCities: C3, recentOrders: D3 } });
            } catch (a4) {
              return console.error("Dashboard stats error:", a4), u.NextResponse.json({ success: false, error: "Failed to fetch dashboard stats" }, { status: 500 });
            }
          }
          __name(A2, "A2");
          let B2 = new e.AppRouteRouteModule({ definition: { kind: f.RouteKind.APP_ROUTE, page: "/api/admin/dashboard/stats/route", pathname: "/api/admin/dashboard/stats", filename: "route", bundlePath: "app/api/admin/dashboard/stats/route" }, distDir: ".next", relativeProjectDir: "", resolvedPagePath: "/home/asifnawaz/git/dermaup-hair-oil/app/api/admin/dashboard/stats/route.ts", nextConfigOutput: "standalone", userland: d }), { workAsyncStorage: C2, workUnitAsyncStorage: D2, serverHooks: E2 } = B2;
          function F2() {
            return (0, g2.patchFetch)({ workAsyncStorage: C2, workUnitAsyncStorage: D2 });
          }
          __name(F2, "F2");
          async function G3(a3, b5, c3) {
            var d2;
            let e2 = "/api/admin/dashboard/stats/route";
            e2 === "/index" && (e2 = "/");
            let g3 = await B2.prepare(a3, b5, { srcPage: e2, multiZoneDraftMode: false });
            if (!g3) return b5.statusCode = 400, b5.end("Bad Request"), c3.waitUntil == null || c3.waitUntil.call(c3, Promise.resolve()), null;
            let { buildId: u2, params: v3, nextConfig: w4, isDraftMode: x4, prerenderManifest: y4, routerServerContext: z4, isOnDemandRevalidate: A3, revalidateOnlyGenerated: C3, resolvedPathname: D3 } = g3, E3 = (0, j3.normalizeAppPath)(e2), F3 = !!(y4.dynamicRoutes[E3] || y4.routes[D3]);
            if (F3 && !x4) {
              let a4 = !!y4.routes[D3], b6 = y4.dynamicRoutes[E3];
              if (b6 && b6.fallback === false && !a4) throw new s.NoFallbackError();
            }
            let G4 = null;
            !F3 || B2.isDev || x4 || (G4 = (G4 = D3) === "/index" ? "/" : G4);
            let H3 = B2.isDev === true || !F3, I3 = F3 && !H3, J2 = a3.method || "GET", K3 = (0, i.getTracer)(), L3 = K3.getActiveScopeSpan(), M3 = { params: v3, prerenderManifest: y4, renderOpts: { experimental: { cacheComponents: !!w4.experimental.cacheComponents, authInterrupts: !!w4.experimental.authInterrupts }, supportsDynamicResponse: H3, incrementalCache: (0, h.getRequestMeta)(a3, "incrementalCache"), cacheLifeProfiles: (d2 = w4.experimental) == null ? void 0 : d2.cacheLife, isRevalidate: I3, waitUntil: c3.waitUntil, onClose: /* @__PURE__ */ __name((a4) => {
              b5.on("close", a4);
            }, "onClose"), onAfterTaskError: void 0, onInstrumentationRequestError: /* @__PURE__ */ __name((b6, c4, d3) => B2.onRequestError(a3, b6, d3, z4), "onInstrumentationRequestError") }, sharedContext: { buildId: u2 } }, N3 = new k3.NodeNextRequest(a3), O3 = new k3.NodeNextResponse(b5), P2 = l.NextRequestAdapter.fromNodeNextRequest(N3, (0, l.signalFromNodeResponse)(b5));
            try {
              let d3 = /* @__PURE__ */ __name(async (c4) => B2.handle(P2, M3).finally(() => {
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
                    if (!(0, h.getRequestMeta)(a3, "minimalMode") && A3 && C3 && !f2) return b5.statusCode = 404, b5.setHeader("x-nextjs-cache", "REVALIDATED"), b5.end("This page could not be found"), null;
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
                    throw f2?.isStale && await B2.onRequestError(a3, b6, { routerKind: "App Router", routePath: e2, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I3, isOnDemandRevalidate: A3 }) }, z4), b6;
                  }
                }, "k4"), l2 = await B2.handleResponse({ req: a3, nextConfig: w4, cacheKey: G4, routeKind: f.RouteKind.APP_ROUTE, isFallback: false, prerenderManifest: y4, isRoutePPREnabled: false, isOnDemandRevalidate: A3, revalidateOnlyGenerated: C3, responseGenerator: k4, waitUntil: c3.waitUntil });
                if (!F3) return null;
                if ((l2 == null || (i2 = l2.value) == null ? void 0 : i2.kind) !== t.CachedRouteKind.APP_ROUTE) throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${l2 == null || (j4 = l2.value) == null ? void 0 : j4.kind}`), "__NEXT_ERROR_CODE", { value: "E701", enumerable: false, configurable: true });
                (0, h.getRequestMeta)(a3, "minimalMode") || b5.setHeader("x-nextjs-cache", A3 ? "REVALIDATED" : l2.isMiss ? "MISS" : l2.isStale ? "STALE" : "HIT"), x4 && b5.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
                let m3 = (0, p2.fromNodeOutgoingHttpHeaders)(l2.value.headers);
                return (0, h.getRequestMeta)(a3, "minimalMode") && F3 || m3.delete(r.NEXT_CACHE_TAGS_HEADER), !l2.cacheControl || b5.getHeader("Cache-Control") || m3.get("Cache-Control") || m3.set("Cache-Control", (0, q3.getCacheControlHeader)(l2.cacheControl)), await (0, o.I)(N3, O3, new Response(l2.value.body, { headers: m3, status: l2.value.status || 200 })), null;
              }, "g4");
              L3 ? await g4(L3) : await K3.withPropagatedContext(a3.headers, () => K3.trace(m2.BaseServerSpan.handleRequest, { spanName: `${J2} ${a3.url}`, kind: i.SpanKind.SERVER, attributes: { "http.method": J2, "http.target": a3.url } }, g4));
            } catch (b6) {
              if (b6 instanceof s.NoFallbackError || await B2.onRequestError(a3, b6, { routerKind: "App Router", routePath: E3, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: I3, isOnDemandRevalidate: A3 }) }), F3) throw b6;
              return await (0, o.I)(N3, O3, new Response(null, { status: 500 })), null;
            }
          }
          __name(G3, "G3");
        });
