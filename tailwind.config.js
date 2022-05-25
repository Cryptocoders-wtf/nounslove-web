module.exports = {
  content: [
    './public/**/*.html',
    './src/**/*.{js,jsx,ts,tsx,vue}',
  ],
  theme: {
    extend: {
      colors: {
        'nouns-grey': "#d5d7e1",
        'nouns-beige': '#e1d7d5',
      },
      fontFamily: {
        'londrina': ['Londrina Solid'],
        'pt-root': ['PT Root UI', 'sans-serif'],
        'yusei': ['Yusei Magic', 'sans-serif']
      },
    },
  },
  plugins: [],
}
