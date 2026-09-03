import type { Config } from "tailwindcss"
import tailwindcssAnimate from "tailwindcss-animate"

export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        main: "#0B0F19",
        card: {
          DEFAULT: "#161F30",
          foreground: "#FFFFFF",
        },
        border: {
          DEFAULT: "#232F48",
          card: "#232F48",
        },
        brand: {
          lime: "#C6FF00",
          cyan: "#00E5FF",
          danger: "#FF3B5C",
        },
        background: "#0B0F19",
        foreground: "#FFFFFF",
        primary: {
          DEFAULT: "#C6FF00",
          foreground: "#0B0F19",
        },
        secondary: {
          DEFAULT: "#161F30",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF3B5C",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#161F30",
          foreground: "#94A3B8",
        },
        accent: {
          DEFAULT: "#00E5FF",
          foreground: "#0B0F19",
        },
        popover: {
          DEFAULT: "#161F30",
          foreground: "#FFFFFF",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.5rem",
        sm: "0.375rem",
      },
    },
  },
  plugins: [tailwindcssAnimate],
} satisfies Config

