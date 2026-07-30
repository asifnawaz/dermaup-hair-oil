// COMPILED DEPLOYMENT EVIDENCE
// This is a captured Webpack/Worker module factory, not original TypeScript or TSX source.
// Variable names, formatting, module boundaries, comments, and types may have been changed or removed by compilation.
// Evidence kind: client Webpack module
// Deployed source path: /home/asifnawaz/git/dermaup-hair-oil/components/shared/back-to-top.tsx
// Project-relative source path: components/shared/back-to-top.tsx
// Module ID: 40531
// Deployment location(s): static/chunks/app/(site)/layout-24cc3d80d0a803a8.js
// Captured factory SHA-256: 4af797aec7365c05eb7cc53e62c5a42b3bb8c70d8744a9667c3eac8a0de5c0f9
// The factory below is preserved as data and is not executed by the extractor.

((e,t,r)=>{"use strict";r.d(t,{BackToTop:()=>c});var n=r(95155),a=r(12115),s=r(20063),i=r(20562),o=r(25016);function c(){let e=(0,s.usePathname)().startsWith("/products/"),[t,r]=(0,a.useState)(!1);return(0,a.useEffect)(()=>{let e=()=>{r(window.scrollY>600)};return window.addEventListener("scroll",e,{passive:!0}),()=>window.removeEventListener("scroll",e)},[]),(0,n.jsx)("button",{onClick:()=>{window.scrollTo({top:0,behavior:"smooth"})},className:(0,o.cn)("fixed bottom-24 right-6 z-40 h-11 w-11 bg-white/90 backdrop-blur-sm border border-gray-200 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:bg-gray-50 hover:shadow-xl",e&&"hidden sm:flex",t?"opacity-100 translate-y-0":"opacity-0 translate-y-4 pointer-events-none"),"aria-label":"Back to top",children:(0,n.jsx)(i.A,{className:"h-4 w-4 text-gray-600"})})}});
