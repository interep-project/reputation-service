module.exports = {
  purge: [
    "./src/pages/**/*.{js,ts,jsx,tsx}",
    "./src/components/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: false, // or 'media' or 'class'
  theme: {
    extend: {
      colors: {
        "twitter-blue": "#1d9bf0",
      },
    },
  },
  variants: {
    extend: {
      backgroundColor: ["disabled"],
      borderWidth: ["hover", "focus"],
      cursor: ["disabled"],
    },
  },
  plugins: [],
};
