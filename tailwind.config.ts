import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F3F0E9",
        surface: "#FFFDF8",
        ink: "#1D2920",
        muted: "#646D5E",
        line: "#E3DDD0",
        primary: "#2E5E46",
        "primary-ink": "#FFFFFF",
        hero: "#1F3A2C",
        "hero-ink": "#F6F1E6",
        "hero-muted": "rgba(246,241,230,.75)",
        "hero-track": "rgba(246,241,230,.18)",
        "accent-gold": "#D9C48F",
        track: "#E7E2D6",
        "tag-bg": "#DFE8DF",
        "tag-ink": "#24493A",
      },
      fontFamily: {
        sans: ["var(--font-dm-sans)", "system-ui", "sans-serif"],
        serif: ["var(--font-instrument)", "serif"],
      },
      fontSize: {
        h1: ["36px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        hero: ["40px", { lineHeight: "1", letterSpacing: "-0.03em" }],
        kpi: ["26px", { lineHeight: "1" }],
      },
      borderRadius: {
        card: "14px",
        sm2: "10px",
        pill: "30px",
      },
    },
  },
  plugins: [],
};
export default config;
