const express = require('express');
const next = require('next');
const { createProxyMiddleware } = require('http-proxy-middleware');

const port = parseInt(process.env.PORT, 10) || 3000;
const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = express();

  // 设置代理
  server.use('/api/uniswap',
    createProxyMiddleware({
      target: 'https://api.thegraph.com/subgraphs/name/uniswap/uniswap-v3',
      changeOrigin: true,
      pathRewrite: { '^/api/uniswap': '' },
      logLevel: 'debug'
    })
  );

  // 处理所有其他请求
  server.all('*', (req, res) => {
    return handle(req, res);
  });

  server.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://localhost:${port}`);
  });
});
