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
        "pond-blue": "#A2D2FF",
        "sky-blue": "#BDE0FE",
        "moss-green": "#606C38",
        "deep-forest": "#283618",
        "wax-red": "#BC6C25",
        "satchel-tan": "#D4A373",
        "parchment": "#FCF9F2",
        "slate-dark": "#2D3748",
        "off-white": "#FAFAFA",
        "guardian-slate": "#4A5568",
      },
      fontFamily: {
        playfair: ["Playfair Display", "serif"],
        lato: ["Lato", "sans-serif"],
        lora: ["Lora", "serif"],
      },
    },
  },
  plugins: [],
};

export default config;
