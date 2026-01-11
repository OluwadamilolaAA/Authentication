import type { Config } from "tailwindcss";
import animatePlugin from "tailwindcss-animate"; 

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {},
  },
  plugins: [animatePlugin], 
};

export default config;


