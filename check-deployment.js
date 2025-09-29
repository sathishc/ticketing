const http = require('http');

console.log('🔍 Checking ticketing service deployment...');

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/v1/health',
  method: 'GET',
  timeout: 5000
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    if (res.statusCode === 200) {
      console.log('✅ Service is healthy!');
      console.log('📊 Health check response:', JSON.parse(data));
      console.log('🌐 Service available at: http://localhost:3000');
      console.log('📚 API Documentation: http://localhost:3000/api/v1/health');
    } else {
      console.log('❌ Service health check failed');
      console.log('Status:', res.statusCode);
      console.log('Response:', data);
    }
  });
});

req.on('error', (err) => {
  console.log('❌ Service is not running or not accessible');
  console.log('Error:', err.message);
  console.log('💡 Try running: npm run dev');
});

req.on('timeout', () => {
  console.log('⏰ Health check timed out');
  req.destroy();
});

req.end();
