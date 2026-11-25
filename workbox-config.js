module.exports = {
  globDirectory: 'dist/',
  globPatterns: ['**/*.{js,css,html,png,ico,json,ttf,woff,woff2,svg}'],
  swDest: 'dist/sw.js',
  ignoreURLParametersMatching: [/^utm_/, /^fbclid$/],
  skipWaiting: true,
  clientsClaim: true,
};
