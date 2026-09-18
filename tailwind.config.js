/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0a0a0a",
        muted: "#626262",
        bone: "#f4f4f4",
        porcelain: "#ffffff",
        line: "#dedede",
        accent: "#d0002a",
        palm: "#173f35",
        clay: "#b00025"
      },
      fontFamily: {
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        body: ["Manrope", "Inter", "system-ui", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        soft: "0 20px 70px rgba(10, 10, 10, 0.08)"
      }
    },
  },
  plugins: [],
};
