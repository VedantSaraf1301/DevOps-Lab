const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
  // Determine the backend URL based on environment
  const backendUrl = process.env.REACT_APP_API_URL || 'http://localhost:5000';
  
  app.use(
    '/api',
    createProxyMiddleware({
      target: backendUrl,
      changeOrigin: true,
      pathRewrite: {
        '^/api': '/api', // Keep /api prefix when forwarding to backend
      },
    })
  );
};
