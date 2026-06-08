const https = require('https');

https.get('https://formsubmit.co/ajax/sushant2510@yahoo.com', (res) => {
  console.log('Status Code:', res.statusCode);
}).on('error', (e) => {
  console.error(e);
});
