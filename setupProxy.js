const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/subgraphs/name/uniswap/uniswap-v3',
    createProxyMiddleware({
      target: 'https://api.thegraph.com',
      changeOrigin: true,
    })
  );
};
