import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-dm-sans)', 'system-ui', 'sans-serif'],
        display: ['var(--font-playfair)', 'Georgia', 'serif'],
      },
      colors: {
        green: {
          forest: '#2D5016',
          'forest-dark': '#1e3710',
          'forest-light': '#3d6b1f',
        },
        gold: {
          DEFAULT: '#C9922A',
          light: '#d9a84a',
          dark: '#a8771e',
        },
        cream: '#FAF9F6',
        ink: '#1A1A1A',
      },
    },
  },
  plugins: [],
}
export default config
