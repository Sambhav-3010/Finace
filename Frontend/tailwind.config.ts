import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: "#090d0d",
        panel: "#101716",
        mist: "#eef2ef",
        accent: "#7ef0cf",
        emerald: "#1b6d5b",
        line: "rgba(255,255,255,0.09)",
      },
      boxShadow: {
        glow: "0 20px 80px rgba(44, 196, 154, 0.18)",
      },
      backgroundImage: {
        dots:
          "radial-gradient(circle at center, rgba(126, 240, 207, 0.28) 0, rgba(126, 240, 207, 0.28) 1px, transparent 1px)",
      },
    },
  },
  plugins: [],
};

export default config;
