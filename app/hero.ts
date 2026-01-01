// hero.ts
import { heroui } from "@heroui/react";
export default heroui({
  defaultTheme: "light",
  themes: {
    light: {
      extend: "light", // <- inherit default values from dark theme
      colors: {
        background: "#ffffff",
        foreground: "#0D001A",
        primary: {
          100: "#FEF7CF",
          200: "#FDECA0",
          300: "#FBDD70",
          400: "#F7CE4D",
          500: "#F2B714",
          600: "#D0970E",
          700: "#AE790A",
          800: "#8C5D06",
          900: "#744903",
          DEFAULT: "#F2B714",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "#6C63FF",
        },
        success: {
          DEFAULT: "#A6ED55",
        },
        warning: {
          DEFAULT: "#FFCD28",
        },
        danger: {
          DEFAULT: "#FF6866",
        },
        focus: "#D0970E",
      },
    },
    dark: {
      extend: "dark", // <- inherit default values from dark theme
      colors: {
        background: "#0D001A",
        foreground: "#ffffff",
        primary: {
          50: "#3B096C",
          100: "#520F83",
          200: "#7318A2",
          300: "#9823C2",
          400: "#c031e2",
          500: "#DD62ED",
          600: "#F182F6",
          700: "#FCADF9",
          800: "#FDD5F9",
          900: "#FEECFE",
          DEFAULT: "#DD62ED",
          foreground: "#ffffff",
        },
        focus: "#F182F6",
      },
      layout: {
        disabledOpacity: "0.3",
        radius: {
          small: "4px",
          medium: "6px",
          large: "8px",
        },
        borderWidth: {
          small: "1px",
          medium: "2px",
          large: "3px",
        },
      },
    },
  },
});
