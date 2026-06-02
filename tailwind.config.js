/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        iocl: {
          blue: {
            DEFAULT: '#0054A6',
            hover: '#004080',
            light: '#EBF3FC',
          },
          orange: {
            DEFAULT: '#FF6600',
            hover: '#E05500',
            light: '#FFF0E6',
          },
        },
      },
    },
  },
  plugins: [],
};

module.exports = config;
