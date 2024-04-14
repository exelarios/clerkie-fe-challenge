import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    colors: {
      "text-color": "#1A1A1A",
      "border-default": "#DDDEE3",
      "subtle": "#62646C",
      "light-subtle": "#A3A6B1",
      "brand": "#1C5FFF",
      "light-brand": "#C1D4FF",
      "dark": "#C9CAD2",
      "disabled": "#EFF0F2",
      "hover": "#A3A6B1",
      "text-disabled": "#C9CAD2",
      "critical": "#EB5757",
      "light-critical": "#EB575760",
      "white": "#FFFFFF"
    },
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
    },
  },
  plugins: [],
};
export default config;
