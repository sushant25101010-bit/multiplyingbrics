const https = require('https');

https.get('https://unpkg.com/india-pincode-regex/', (resp) => {
  let data = '';
  resp.on('data', (chunk) => { data += chunk; });
  resp.on('end', () => {
    console.log(data.substring(0, 500));
  });
});
