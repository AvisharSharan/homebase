/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Pure dark backgrounds
        ink: {
          950: "#080808",
          900: "#0f0f0f",
          850: "#141414",
          800: "#1a1a1a",
          700: "#242424",
          600: "#363636",
        },
        // Off-white / cream foregrounds
        bone: {
          500: "#f0eeeb",
          400: "#c8c6c3",
          300: "#979593",
        },
        // Muted grays
        stone: {
          600: "#606060",
          500: "#787878",
          400: "#989898",
          300: "#c0c0c0",
          200: "#e0e0e0",
        },
        // Semantic: danger red
        red: {
          600: "#c0392b",
          500: "#e05252",
          400: "#f47878",
        },
        // Semantic: success/positive green
        green: {
          600: "#27ae60",
          500: "#3dba72",
          400: "#5dd68c",
        },
        // Legacy clay alias (for danger buttons)
        clay: {
          600: "#c0392b",
          500: "#e05252",
        },
      },
      boxShadow: {
        panel: "0 24px 80px rgba(0, 0, 0, 0.65)",
        card: "0 2px 8px rgba(0, 0, 0, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.04)",
        "card-hover": "0 6px 24px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.09)",
        "inner-bright": "inset 0 1px 0 rgba(255, 255, 255, 0.08)",
      },
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "Segoe UI", "sans-serif"],
        mono: ["JetBrains Mono", "SFMono-Regular", "Consolas", "monospace"],
      },
      animation: {
        "fade-in": "fadeIn 0.18s ease-out",
        "slide-in": "slideIn 0.22s cubic-bezier(0.16, 1, 0.3, 1)",
        "slide-up": "slideUp 0.2s cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideIn: {
          "0%": { transform: "translateX(12px)", opacity: "0" },
          "100%": { transform: "translateX(0)", opacity: "1" },
        },
        slideUp: {
          "0%": { transform: "translateY(8px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
