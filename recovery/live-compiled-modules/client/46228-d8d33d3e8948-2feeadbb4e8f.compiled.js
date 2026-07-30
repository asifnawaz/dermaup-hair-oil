// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: client Webpack module
// Deployed source path: /home/asifnawaz/git/dermaup-hair-oil/components/catalog/product-grid.tsx
// Project-relative source path: components/catalog/product-grid.tsx
// Module ID: 46228
// Deployment location(s): static/chunks/app/(site)/products/page-20997dfaa524401f.js
// Captured factory SHA-256: 2feeadbb4e8f02c7ab655a8cf1a5919adb6bc4623e2909e5425c5c1439057390
// The factory below is preserved as data and is not executed by the extractor.

((e,t,r)=>{"use strict";r.d(t,{ProductGrid:()=>c});var n=r(95155),i=r(12115),a=r(25016),o=r(37123),s=r(88630);function c(e){let{products:t,lang:r="en"}=e,c="ur"===r;return((0,i.useEffect)(()=>{if(0===t.length)return;let e=Array.from(new Set(t.map(e=>e.category||"uncategorized"))).join(",");o.zS.productListViewed(e,t.map(e=>({id:e.id,name:e.name})))},[t]),0===t.length)?(0,n.jsx)("div",{className:"text-center py-16",children:(0,n.jsx)("p",{className:(0,a.cn)("text-muted-foreground text-lg",c&&"font-urdu"),children:c?"فی الحال کوئی مصنوعات دستیاب نہیں":"No products available yet"})}):(0,n.jsx)("div",{className:"grid grid-cols-2 gap-x-3 gap-y-5 md:grid-cols-3 lg:grid-cols-4 md:gap-5",children:t.map((e,t)=>(0,n.jsx)(s.A,{id:e.id,slug:e.slug,name:e.name,nameUr:e.nameUr,shortDescription:e.shortDescription,shortDescriptionUr:e.shortDescriptionUr,imageUrl:e.imageUrl,badge:e.badge,badgeUr:e.badgeUr,category:e.category,parsedData:e.parsedData,lang:r,source:"products_grid",priority:0===t},e.id))})}});
