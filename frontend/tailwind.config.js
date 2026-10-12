/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#0E1420",
        surface: "#161D2B",
        surfaceRaised: "#1D2637",
        line: "#2A3344",
        lineSoft: "#E3E1DA",
        paper: "#F7F7F5",
        accent: "#E8552D",
        accentSoft: "#F6C9B4",
        status: {
          available: "#35B37E",
          reserved: "#F0B93D",
          inuse: "#E8552D",
          offline: "#5B6472",
        },
      },
      fontFamily: {
        display: ["\"Space Grotesk\"", "sans-serif"],
        body: ["\"IBM Plex Sans\"", "sans-serif"],
        mono: ["\"IBM Plex Mono\"", "monospace"],
      },
      borderRadius: {
        sm: "3px",
        DEFAULT: "4px",
      },
    },
  },
  plugins: [],
};
