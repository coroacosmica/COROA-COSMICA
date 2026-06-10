import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        olive: {
          50: "#f4f5f2",
          100: "#e8eae3",
          200: "#d1d5c7",
          300: "#b3baa4",
          400: "#949d82",
          500: "#7a8468",
          600: "#6d735a",
          700: "#565d46",
          800: "#474d3b",
          900: "#3c4034",
          950: "#2C2C2C",
        },
        accent: {
          green: "#5AAF3F",
          teal: "#2A9D8F",
          blue: "#3AABDC",
          orange: "#F4A225",
        },
        brand: {
          800: "#6d735a",
          900: "#6d735a",
          950: "#565d46",
        },
        cork: {
          50: "#faf6f0",
          100: "#f3ebe0",
          500: "#b8845a",
          700: "#8d5a3d",
        },
        forest: {
          900: "#2C2C2C",
        },
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        arabic: ["var(--font-arabic)", "system-ui", "sans-serif"],
      },
      maxWidth: {
        shop: "1400px",
      },
    },
  },
  plugins: [],
};

export default config;
