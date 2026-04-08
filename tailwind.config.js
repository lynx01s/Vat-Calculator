/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        display: ["'Syne'", "sans-serif"],
        body: ["'DM Sans'", "sans-serif"],
        mono: ["'DM Mono'", "monospace"],
      },
      colors: {
        ink: "#0D0D0F",
        surface: "#F5F4F0",
        card: "#FFFFFF",
        accent: "#C8F135",
        muted: "#8A8A8E",
        border: "#E4E3DF",
        vat: "#FF6B35",
      },
    },
  },
  plugins: [],
};
