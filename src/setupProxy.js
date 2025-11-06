// Proxy configuration for development
// This allows the React app to proxy API requests to the backend during development

const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  app.use(
    '/api',
    createProxyMiddleware({
      target: 'http://localhost:5000',
      changeOrigin: true,
      secure: false,
      logLevel: 'debug',
      onError: (err, req, res) => {
        console.error('Proxy error:', err.message);
        res.status(500).json({
          success: false,
          message: 'Unable to connect to backend server. Make sure the backend is running on port 5000.'
        });
      },
      onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying request:', req.method, req.url, 'to', proxyReq.path);
      }
    })
  );
};

