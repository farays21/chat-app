import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        'wa-green': '#25D366',
        'wa-green-dark': '#128C7E',
        'wa-bg': '#ECE5DD',
        'wa-bubble-sent': '#DCF8C6',
        'wa-bubble-received': '#FFFFFF',
      },
    },
  },
  plugins: [],
};
export default config;
