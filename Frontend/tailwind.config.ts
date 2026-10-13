import type { Config } from "tailwindcss";
import { ACCENT_DEEP_RGB, ACCENT_HEX, ACCENT_RGB } from "./lib/theme/colors";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        body: ["var(--font-body)"],
        heading: ["var(--font-heading)"],
      },
      colors: {
        ink: "#101714",
        panel: "#19221d",
        surface: "#202b24",
        mist: "#f1f5f2",
        accent: ACCENT_HEX,
        line: "#2a3930",
      },
      boxShadow: {
        glow: `0 14px 44px rgba(${ACCENT_RGB}, 0.09)`,
      },
      backgroundImage: {
        dots: `radial-gradient(circle at center, rgba(${ACCENT_RGB}, 0.28) 0, rgba(${ACCENT_RGB}, 0.28) 1px, transparent 1px)`,
      },
    },
  },
  plugins: [],
};

export default config;
