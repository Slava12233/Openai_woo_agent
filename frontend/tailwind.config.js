/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // בסיס
        'bg-primary': '#ffffff',      // לבן
        'bg-secondary': '#e5e5e5',    // אפור בהיר
        'text-primary': '#000000',    // שחור
        'text-secondary': '#222222',  // אפור כהה

        // הדגשות
        'accent-primary': '#000000',  // שחור
        'accent-secondary': '#444444', // אפור כהה
        'accent-warning': '#f59e0b',  // כתום
        'accent-danger': '#ef4444',   // אדום

        // צבעים קיימים לתאימות לאחור
        primary: '#000000',
        secondary: '#444444',
        accent: '#000000',
        background: '#ffffff',
        foreground: '#000000',
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#000000',
      },
      fontFamily: {
        sans: ['Heebo', 'Inter', 'sans-serif'],
        heading: ['Poppins', 'Heebo', 'sans-serif'],
      },
      boxShadow: {
        card: '0 4px 6px -1px rgba(0, 0, 0, 0.15), 0 2px 4px -1px rgba(0, 0, 0, 0.1)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.15), 0 4px 6px -2px rgba(0, 0, 0, 0.1)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.15)',
        'glass-hover': '0 8px 32px 0 rgba(0, 0, 0, 0.25)',
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow': 'glow 2s ease-in-out infinite alternate',
        'typing': 'typing 3.5s steps(40, end), blink-caret .75s step-end infinite',
        'wave': 'wave 2s linear infinite',
        'bounce-slow': 'bounce 3s infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        glow: {
          '0%': { boxShadow: '0 0 5px rgba(0, 0, 0, 0.5)' },
          '100%': { boxShadow: '0 0 20px rgba(0, 0, 0, 0.8)' },
        },
        typing: {
          'from': { width: '0' },
          'to': { width: '100%' },
        },
        'blink-caret': {
          'from, to': { borderColor: 'transparent' },
          '50%': { borderColor: 'currentColor' },
        },
        wave: {
          '0%': { transform: 'translateX(-100%)' },
          '50%': { transform: 'translateX(0)' },
          '100%': { transform: 'translateX(100%)' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      borderRadius: {
        'xl': '12px',
        '2xl': '16px',
      },
      fontSize: {
        'xs': ['0.75rem', { lineHeight: '1rem' }],
        'sm': ['0.875rem', { lineHeight: '1.25rem' }],
        'base': ['1rem', { lineHeight: '1.5rem' }],
        'lg': ['1.125rem', { lineHeight: '1.75rem' }],
        'xl': ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-blue': 'linear-gradient(135deg, #000000, #444444)',
        'gradient-green': 'linear-gradient(135deg, #000000, #444444)',
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    require('daisyui'),
  ],
  daisyui: {
    themes: [
      {
        aiagent: {
          "primary": "#000000",
          "secondary": "#444444",
          "accent": "#000000",
          "neutral": "#e5e5e5",
          "base-100": "#ffffff",
          "info": "#000000",
          "success": "#10b981",
          "warning": "#f59e0b",
          "error": "#ef4444",
          "base-content": "#000000",
        },
      },
      "corporate",
      "business",
      "dark",
    ],
    darkTheme: "aiagent",
    base: true,
    styled: true,
    utils: true,
    rtl: true,
    prefix: "daisy-",
  },
}
