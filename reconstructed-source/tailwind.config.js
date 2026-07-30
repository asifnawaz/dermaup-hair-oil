/** @type {import("tailwindcss").Config} */
const config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        cream: "#FAFAFA",
        emerald: "#1F2937",
        "emerald-light": "#374151",
        gold: "#B48446",
        "gold-light": "#D4A373",
        text: "#1F2937",
        "text-muted": "#6B7280",
        dark: "#000000",
        "dark-green": "#111111",
      },
      fontFamily: {
        sans: ["var(--font-body)", "var(--font-latin-fallback)"],
        serif: ["var(--font-display)", "var(--font-display-fallback)"],
      },
    },
  },
  plugins: [],
};

export default config;
