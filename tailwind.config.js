/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#14110f",
        muted: "#6f6861",
        bone: "#f7f3ed",
        porcelain: "#fbfaf7",
        line: "#e7ded2",
        palm: "#173f35",
        clay: "#a65f3c"
      },
      fontFamily: {
        display: ["Sora", "Inter", "system-ui", "sans-serif"],
        body: ["Manrope", "Inter", "system-ui", "sans-serif"],
        mono: ["Space Mono", "ui-monospace", "monospace"]
      },
      boxShadow: {
        soft: "0 20px 70px rgba(20, 17, 15, 0.08)"
      }
    },
  },
  plugins: [],
};
