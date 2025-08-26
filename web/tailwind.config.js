const { createGlobPatternsForDependencies } = require('@nx/react/tailwind');
const { join } = require('path');

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{ts,tsx,html}',
    './components/**/*.{ts,tsx,html}',
    // add more if you use src or pages folders
    ...createGlobPatternsForDependencies(__dirname),
  ],
  theme: {
    extend: {
      colors: {
        'tensor-black': '#111314',
        'tensor-white': '#FFFFEB',
      },
    },
  },
  plugins: [require('daisyui')],
};
