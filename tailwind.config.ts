import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0B0B12",
        cream: "#FAF5EA",
        sunset: "#FF5E3A",
        flame: "#FF1F6D",
        royal: "#3B1FFF",
        electric: "#00E0FF",
        sun: "#FFD23F",
        lime: "#9DFF00",
      },
      fontFamily: {
        display: ["var(--font-display)", "system-ui", "sans-serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        "cosette-mesh":
          "radial-gradient(at 20% 20%, #FF1F6D 0%, transparent 50%), radial-gradient(at 80% 0%, #3B1FFF 0%, transparent 50%), radial-gradient(at 50% 100%, #FFD23F 0%, transparent 50%)",
      },
      boxShadow: {
        pop: "8px 8px 0 0 #0B0B12",
        glow: "0 0 60px rgba(255, 31, 109, 0.45)",
      },
      animation: {
        marquee: "marquee 30s linear infinite",
        float: "float 6s ease-in-out infinite",
      },
      keyframes: {
        marquee: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        float: { "0%, 100%": { transform: "translateY(0)" }, "50%": { transform: "translateY(-12px)" } },
      },
    },
  },
  plugins: [],
};

export default config;
