export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        dark: {
          900: "#090909",
          800: "#111111",
          700: "#171717",
          600: "#252525",
        },
        gold: {
          DEFAULT: "#D6B23E",
          light: "#E8CA68",
          dark: "#A88927",
        },
        silver: {
          DEFAULT: "#BFC0C2",
          light: "#E5E5E5",
          dark: "#858585",
        },
      },
    },
  },
  plugins: [],
};