module.exports = {
  content: ['./index.html', './main.js'],
  theme: {
    extend: {
      colors: {
        background: '#050b16',
        surface: '#0f172a',
      },
      boxShadow: {
        glow: '0 20px 60px rgba(14, 60, 255, 0.18)',
      },
    },
  },
  plugins: [require('daisyui')],
  daisyui: {
    themes: ['dark'],
  },
};
