import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fintech: {
          primary: '#0F172A', // Deep navy / rich black
          background: '#F8FAFC', // Slate-50 off-white
          card: '#FFFFFF', // Pure white
          success: '#16A34A', // Accessible green
          danger: '#DC2626', // Accessible red
        }
      }
    },
  },
  plugins: [],
};
export default config;
