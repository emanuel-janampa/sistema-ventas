const http = require('http');
const data = JSON.stringify({ status: 'CANCELED' });
const options = {
  hostname: 'localhost',
  port: 8090,
  path: '/api/orders/1',
  method: 'PUT',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    Authorization: 'Bearer eyJhbGciOiJIUzI1NiJ9.eyJzdWIiOiJhZG1pbiIsInJvbGUiOiJBRE1JTiIsImlhdCI6MTc4Mjc4MjM0NiwiZXhwIjoxNzgyNzg1OTQ2fQ.VN-ezSndQieivbL_yDJ5srx-5vPHniiiCYjVqxOEISI',
  },
};
const req = http.request(options, (res) => {
  console.log('STATUS', res.statusCode);
  console.log('HEADERS', JSON.stringify(res.headers));
  let body = '';
  res.on('data', (chunk) => body += chunk);
  res.on('end', () => console.log('BODY', body));
});
req.on('error', (err) => console.error('ERROR', err));
req.write(data);
req.end();
