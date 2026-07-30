// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: server Worker route-entry module
// Deployed source path: /home/asifnawaz/git/dermaup-hair-oil/app/api/orders/route.ts
// Project-relative source path: app/api/orders/route.ts
// Module ID: 74249
// Deployment location(s): dist/worker.js
// Captured factory SHA-256: c8717f186fda7ad810de491949a12534e6e8f696b8663295aaa82477f3cb88de
// The factory below is preserved as data and is not executed by the extractor.

((a2, b4, c2) => {
          c2.r(b4), c2.d(b4, { handler: /* @__PURE__ */ __name(() => N3, "handler"), patchFetch: /* @__PURE__ */ __name(() => M3, "patchFetch"), routeModule: /* @__PURE__ */ __name(() => I3, "routeModule"), serverHooks: /* @__PURE__ */ __name(() => L3, "serverHooks"), workAsyncStorage: /* @__PURE__ */ __name(() => J2, "workAsyncStorage"), workUnitAsyncStorage: /* @__PURE__ */ __name(() => K3, "workUnitAsyncStorage") });
          var d = {};
          c2.r(d), c2.d(d, { GET: /* @__PURE__ */ __name(() => H3, "GET"), POST: /* @__PURE__ */ __name(() => G3, "POST") });
          var e = c2(95736), f = c2(9117), g2 = c2(4044), h = c2(39326), i = c2(32324), j3 = c2(261), k3 = c2(54290), l = c2(85328), m2 = c2(38928), n = c2(46595), o = c2(3421), p2 = c2(17679), q3 = c2(41681), r = c2(63446), s = c2(86439), t = c2(51356), u = c2(10641), v2 = c2(48689), w3 = c2(85766), x3 = c2(91132), y3 = c2(36993), z3 = c2(17922), A2 = c2(2995), B2 = c2(61488), C2 = c2(98190), D2 = c2(24423);
          let E2 = A2.Ik({ customerName: A2.Yj().min(3).max(100), customerEmail: A2.Yj().email().optional().or(A2.eu("")), customerPhone: A2.Yj().min(11), city: A2.Yj().min(1), address: A2.Yj().min(10).max(500), paymentMethod: A2.Yj().min(1).max(50), language: A2.k5(["en", "ur"]).default("en"), couponCode: A2.Yj().optional(), items: A2.YO(A2.Ik({ productId: A2.Yj(), packageType: A2.Yj(), quantity: A2.ai().min(1).max(10) })).min(1) });
          async function F2(a3) {
            let [b5, c3] = await Promise.all([a3.select().from(y3.siteSettings).where((0, v2.eq)(y3.siteSettings.key, "checkout_config")).get(), a3.select().from(y3.siteSettings).where((0, v2.eq)(y3.siteSettings.key, "payment_methods")).get()]);
            return (0, B2.sO)((0, B2.nE)(b5?.value), (0, B2.nE)(c3?.value));
          }
          __name(F2, "F2");
          async function G3(a3) {
            try {
              let b5 = await a3.json(), c3 = (0, x3.qK)();
              if (!c3) return u.NextResponse.json({ success: false, error: "Service unavailable" }, { status: 503 });
              let d2 = (0, x3.Lf)(c3), e2 = E2.safeParse(b5);
              if (!e2.success) return u.NextResponse.json({ success: false, error: "Validation failed", details: (0, z3.Mt)(e2.error) }, { status: 400 });
              let f2 = e2.data;
              if (f2.paymentMethod === "cod") {
                let a4 = (0, D2.W)(new Date(Date.now() - 18e5));
                if (await d2.select({ id: x3.Ww.id }).from(x3.Ww).where((0, v2.Uo)((0, v2.eq)(x3.Ww.customerPhone, f2.customerPhone), (0, w3.ll)`${x3.Ww.createdAt} > ${a4}`)).get()) return u.NextResponse.json({ success: false, error: "Please wait before placing another order" }, { status: 429 });
              }
              let g3 = await F2(d2), h2 = g3.paymentMethods[f2.paymentMethod];
              if (!h2) return u.NextResponse.json({ success: false, error: "Invalid payment method" }, { status: 400 });
              let i2 = /* @__PURE__ */ new Map(), j4 = [];
              for (let a4 of f2.items) {
                let b6 = i2.get(a4.productId);
                if (!b6) {
                  let c5 = await d2.select().from(y3.products).where((0, v2.eq)(y3.products.id, a4.productId)).get();
                  if (!c5?.data) return u.NextResponse.json({ success: false, error: `Invalid product in cart: ${a4.productId}` }, { status: 400 });
                  let e4 = (0, B2.nE)(c5.data), f3 = e4 && typeof e4 == "object" ? e4 : {}, g4 = f3.packages && typeof f3.packages == "object" ? f3.packages : {};
                  b6 = { slug: c5.slug, name: c5.name, packagesByType: g4, isPreorder: !!f3.preorderEnabled }, i2.set(a4.productId, b6);
                }
                let c4 = b6.packagesByType[a4.packageType];
                if (!c4 || typeof c4 != "object") return u.NextResponse.json({ success: false, error: `Invalid package for product: ${b6.name}` }, { status: 400 });
                let e3 = typeof c4.price == "number" ? Math.round(c4.price) : null;
                if (e3 === null || e3 < 0) return u.NextResponse.json({ success: false, error: `Invalid package pricing for product: ${b6.name}` }, { status: 400 });
                j4.push({ productId: a4.productId, productSlug: b6.slug, productName: b6.isPreorder ? `[Pre-order] ${b6.name}` : b6.name, packageType: a4.packageType, quantity: a4.quantity, unitPrice: e3, subtotal: e3 * a4.quantity });
              }
              let k4 = j4.reduce((a4, b6) => a4 + b6.subtotal, 0), l2 = j4.reduce((a4, b6) => a4 + b6.quantity, 0), m3 = f2.paymentMethod === "cod", n2 = g3.codDeliveryFee, o2 = Math.max(0, Math.round(h2.deliveryFee || 0)), p3 = m3 ? k4 >= g3.freeShippingThreshold ? 0 : n2 : o2, q4 = m3 ? 0 : Math.round(k4 * (g3.prepaidDiscountPercent / 100)), r2 = f2.couponCode ? await (0, C2.m)(d2, f2.couponCode, k4) : null;
              if (r2 && !r2.success) return u.NextResponse.json({ success: false, error: r2.error }, { status: r2.status });
              let s2 = r2?.success ? r2.data : null, t2 = s2?.discount || 0, A3 = Math.max(0, k4 + p3 - t2 - q4), G4 = (0, x3.$C)("order"), H4 = (function() {
                let a4 = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789", b6 = "", c4 = new Uint8Array(8);
                crypto.getRandomValues(c4);
                for (let d3 = 0; d3 < 8; d3++) b6 += a4[c4[d3] % a4.length];
                return `DU-${b6.slice(0, 4)}-${b6.slice(4)}`;
              })(), I4 = f2.paymentMethod === "cod" ? "confirmed" : "pending";
              return await d2.transaction(async (a4) => {
                for (let b6 of (await a4.insert(x3.Ww).values({ id: G4, orderNumber: H4, customerName: f2.customerName, customerEmail: f2.customerEmail || "", customerPhone: f2.customerPhone, city: f2.city, address: f2.address, packageType: "multi", quantity: l2, subtotal: k4, deliveryFee: p3, total: A3, couponCode: s2?.code || null, couponDiscount: t2, paymentMethod: f2.paymentMethod, paymentStatus: "pending", orderStatus: I4, language: f2.language }), j4)) await a4.insert(y3.orderItems).values({ id: (0, x3.$C)("oi"), orderId: G4, productId: b6.productId, productSlug: b6.productSlug, productName: b6.productName, packageType: b6.packageType, quantity: b6.quantity, unitPrice: b6.unitPrice, subtotal: b6.unitPrice * b6.quantity });
                s2?.code && await a4.update(y3.coupons).set({ usedCount: (0, w3.ll)`used_count + 1` }).where((0, v2.eq)(y3.coupons.code, s2.code));
              }), u.NextResponse.json({ success: true, data: { orderId: H4, orderNumber: H4, total: A3, deliveryFee: p3, couponDiscount: t2, prepaidDiscount: q4, paymentMethod: f2.paymentMethod, status: I4 } });
            } catch (a4) {
              return console.error("Order creation error:", a4), u.NextResponse.json({ success: false, error: "Failed to create order" }, { status: 500 });
            }
          }
          __name(G3, "G3");
          async function H3() {
            return u.NextResponse.json({ success: false, error: "Method not allowed" }, { status: 405 });
          }
          __name(H3, "H3");
          let I3 = new e.AppRouteRouteModule({ definition: { kind: f.RouteKind.APP_ROUTE, page: "/api/orders/route", pathname: "/api/orders", filename: "route", bundlePath: "app/api/orders/route" }, distDir: ".next", relativeProjectDir: "", resolvedPagePath: "/home/asifnawaz/git/dermaup-hair-oil/app/api/orders/route.ts", nextConfigOutput: "standalone", userland: d }), { workAsyncStorage: J2, workUnitAsyncStorage: K3, serverHooks: L3 } = I3;
          function M3() {
            return (0, g2.patchFetch)({ workAsyncStorage: J2, workUnitAsyncStorage: K3 });
          }
          __name(M3, "M3");
          async function N3(a3, b5, c3) {
            var d2;
            let e2 = "/api/orders/route";
            e2 === "/index" && (e2 = "/");
            let g3 = await I3.prepare(a3, b5, { srcPage: e2, multiZoneDraftMode: false });
            if (!g3) return b5.statusCode = 400, b5.end("Bad Request"), c3.waitUntil == null || c3.waitUntil.call(c3, Promise.resolve()), null;
            let { buildId: u2, params: v3, nextConfig: w4, isDraftMode: x4, prerenderManifest: y4, routerServerContext: z4, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, resolvedPathname: C3 } = g3, D3 = (0, j3.normalizeAppPath)(e2), E3 = !!(y4.dynamicRoutes[D3] || y4.routes[C3]);
            if (E3 && !x4) {
              let a4 = !!y4.routes[C3], b6 = y4.dynamicRoutes[D3];
              if (b6 && b6.fallback === false && !a4) throw new s.NoFallbackError();
            }
            let F3 = null;
            !E3 || I3.isDev || x4 || (F3 = (F3 = C3) === "/index" ? "/" : F3);
            let G4 = I3.isDev === true || !E3, H4 = E3 && !G4, J3 = a3.method || "GET", K4 = (0, i.getTracer)(), L4 = K4.getActiveScopeSpan(), M4 = { params: v3, prerenderManifest: y4, renderOpts: { experimental: { cacheComponents: !!w4.experimental.cacheComponents, authInterrupts: !!w4.experimental.authInterrupts }, supportsDynamicResponse: G4, incrementalCache: (0, h.getRequestMeta)(a3, "incrementalCache"), cacheLifeProfiles: (d2 = w4.experimental) == null ? void 0 : d2.cacheLife, isRevalidate: H4, waitUntil: c3.waitUntil, onClose: /* @__PURE__ */ __name((a4) => {
              b5.on("close", a4);
            }, "onClose"), onAfterTaskError: void 0, onInstrumentationRequestError: /* @__PURE__ */ __name((b6, c4, d3) => I3.onRequestError(a3, b6, d3, z4), "onInstrumentationRequestError") }, sharedContext: { buildId: u2 } }, N4 = new k3.NodeNextRequest(a3), O3 = new k3.NodeNextResponse(b5), P2 = l.NextRequestAdapter.fromNodeNextRequest(N4, (0, l.signalFromNodeResponse)(b5));
            try {
              let d3 = /* @__PURE__ */ __name(async (c4) => I3.handle(P2, M4).finally(() => {
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
                    a3.fetchMetrics = M4.renderOpts.fetchMetrics;
                    let i3 = M4.renderOpts.pendingWaitUntil;
                    i3 && c3.waitUntil && (c3.waitUntil(i3), i3 = void 0);
                    let j5 = M4.renderOpts.collectedTags;
                    if (!E3) return await (0, o.I)(N4, O3, e3, M4.renderOpts.pendingWaitUntil), null;
                    {
                      let a4 = await e3.blob(), b6 = (0, p2.toNodeOutgoingHttpHeaders)(e3.headers);
                      j5 && (b6[r.NEXT_CACHE_TAGS_HEADER] = j5), !b6["content-type"] && a4.type && (b6["content-type"] = a4.type);
                      let c4 = M4.renderOpts.collectedRevalidate !== void 0 && !(M4.renderOpts.collectedRevalidate >= r.INFINITE_CACHE) && M4.renderOpts.collectedRevalidate, d4 = M4.renderOpts.collectedExpire === void 0 || M4.renderOpts.collectedExpire >= r.INFINITE_CACHE ? void 0 : M4.renderOpts.collectedExpire;
                      return { value: { kind: t.CachedRouteKind.APP_ROUTE, status: e3.status, body: Buffer.from(await a4.arrayBuffer()), headers: b6 }, cacheControl: { revalidate: c4, expire: d4 } };
                    }
                  } catch (b6) {
                    throw f2?.isStale && await I3.onRequestError(a3, b6, { routerKind: "App Router", routePath: e2, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: H4, isOnDemandRevalidate: A3 }) }, z4), b6;
                  }
                }, "k4"), l2 = await I3.handleResponse({ req: a3, nextConfig: w4, cacheKey: F3, routeKind: f.RouteKind.APP_ROUTE, isFallback: false, prerenderManifest: y4, isRoutePPREnabled: false, isOnDemandRevalidate: A3, revalidateOnlyGenerated: B3, responseGenerator: k4, waitUntil: c3.waitUntil });
                if (!E3) return null;
                if ((l2 == null || (i2 = l2.value) == null ? void 0 : i2.kind) !== t.CachedRouteKind.APP_ROUTE) throw Object.defineProperty(Error(`Invariant: app-route received invalid cache entry ${l2 == null || (j4 = l2.value) == null ? void 0 : j4.kind}`), "__NEXT_ERROR_CODE", { value: "E701", enumerable: false, configurable: true });
                (0, h.getRequestMeta)(a3, "minimalMode") || b5.setHeader("x-nextjs-cache", A3 ? "REVALIDATED" : l2.isMiss ? "MISS" : l2.isStale ? "STALE" : "HIT"), x4 && b5.setHeader("Cache-Control", "private, no-cache, no-store, max-age=0, must-revalidate");
                let m3 = (0, p2.fromNodeOutgoingHttpHeaders)(l2.value.headers);
                return (0, h.getRequestMeta)(a3, "minimalMode") && E3 || m3.delete(r.NEXT_CACHE_TAGS_HEADER), !l2.cacheControl || b5.getHeader("Cache-Control") || m3.get("Cache-Control") || m3.set("Cache-Control", (0, q3.getCacheControlHeader)(l2.cacheControl)), await (0, o.I)(N4, O3, new Response(l2.value.body, { headers: m3, status: l2.value.status || 200 })), null;
              }, "g4");
              L4 ? await g4(L4) : await K4.withPropagatedContext(a3.headers, () => K4.trace(m2.BaseServerSpan.handleRequest, { spanName: `${J3} ${a3.url}`, kind: i.SpanKind.SERVER, attributes: { "http.method": J3, "http.target": a3.url } }, g4));
            } catch (b6) {
              if (b6 instanceof s.NoFallbackError || await I3.onRequestError(a3, b6, { routerKind: "App Router", routePath: D3, routeType: "route", revalidateReason: (0, n.c)({ isRevalidate: H4, isOnDemandRevalidate: A3 }) }), E3) throw b6;
              return await (0, o.I)(N4, O3, new Response(null, { status: 500 })), null;
            }
          }
          __name(N3, "N3");
        });
