import type { Config } from "tailwindcss";

export default {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: '#0a1a0f',
          50: '#f0f7f3',
          100: '#d9ebe0',
          200: '#b3d7c1',
          300: '#8cc3a2',
          400: '#66af83',
          500: '#2d7a4a',
          600: '#1a4d2e',
          700: '#14331f',
          800: '#0f2617',
          900: '#0a1a0f',
        },
        accent: {
          green: '#1a4d2e',
          'green-light': '#2d7a4a',
          orange: '#FF6436',
        },
        dark: {
          DEFAULT: '#0a1a0f',
          secondary: '#0f2617',
          tertiary: '#14331f',
          card: '#1a3326',
          hover: '#1f3d2e',
        },
        border: {
          DEFAULT: '#2d5a3f',
        }
      },
      fontFamily: {
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      backgroundImage: {
        'gradient-dark-green': 'linear-gradient(135deg, #0a1a0f 0%, #0f2617 50%, #1a4d2e 100%)',
      },
      animation: {
        fadeIn: 'fadeIn 0.3s ease-in',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0', transform: 'translateY(10px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
