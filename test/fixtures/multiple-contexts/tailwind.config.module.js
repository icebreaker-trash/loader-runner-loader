const path = require('node:path')
console.log('tailwind.config.module')
/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [path.resolve(__dirname, './src/module/**/*.{js,wxml}')],
  theme: {
    extend: {}
  },
  plugins: [],
  corePlugins: {
    preflight: false
  }
}
