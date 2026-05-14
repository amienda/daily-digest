/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        serif: [
          'Charter',
          'Lora',
          'Georgia',
          'ui-serif',
          'serif',
        ],
        sans: [
          'ui-sans-serif',
          'system-ui',
          '-apple-system',
          'BlinkMacSystemFont',
          'Segoe UI',
          'Helvetica',
          'Arial',
          'sans-serif',
        ],
      },
      maxWidth: {
        prose: '65ch',
      },
    },
  },
  // Safelist category pill classes so JIT can't strip them.
  safelist: [
    'bg-amber-100', 'text-amber-800', 'dark:bg-amber-900/40', 'dark:text-amber-200',
    'bg-blue-100', 'text-blue-800', 'dark:bg-blue-900/40', 'dark:text-blue-200',
    'bg-purple-100', 'text-purple-800', 'dark:bg-purple-900/40', 'dark:text-purple-200',
    'bg-pink-100', 'text-pink-800', 'dark:bg-pink-900/40', 'dark:text-pink-200',
    'bg-rose-100', 'text-rose-800', 'dark:bg-rose-900/40', 'dark:text-rose-200',
    'bg-green-100', 'text-green-800', 'dark:bg-green-900/40', 'dark:text-green-200',
    'bg-slate-100', 'text-slate-800', 'dark:bg-slate-800/60', 'dark:text-slate-200',
    'bg-gray-100', 'text-gray-800', 'dark:bg-gray-800/60', 'dark:text-gray-200',
  ],
  plugins: [],
};
