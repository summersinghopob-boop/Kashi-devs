export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: { ink: '#0A0A0F', cyan: '#00F0FF', amber: '#FFB703' },
      fontFamily: { display: ['"Chakra Petch"', 'sans-serif'], body: ['"DM Sans"', 'sans-serif'] },
      boxShadow: {
        cyan: '0 0 28px rgba(0,240,255,.35)',
        amber: '0 0 28px rgba(255,183,3,.35)'
      }
    }
  },
  plugins: []
}
