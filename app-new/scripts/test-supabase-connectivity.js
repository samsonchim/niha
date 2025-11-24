/*
Diagnostic script to test Supabase connectivity from this environment.
Usage: node scripts/test-supabase-connectivity.js
*/
const dns = require('dns');
const https = require('https');

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL || 'https://xfvhnprissrhjjuokvpl.supabase.co';
const projectRef = SUPABASE_URL.replace(/^https:\/\//,'').split('.')[0];
const authHealth = `${SUPABASE_URL.replace(/\/$/, '')}/auth/v1/health`;

console.log('Supabase URL:', SUPABASE_URL);
console.log('Derived project ref:', projectRef);
console.log('Auth health endpoint:', authHealth);

function dnsResolve(host) {
  return new Promise((resolve) => {
    dns.resolveAny(host, (err, records) => {
      if (err) {
        console.error('DNS resolve error:', err.code || err.message);
        return resolve(null);
      }
      console.log('DNS records:', records);
      resolve(records);
    });
  });
}

function httpsGet(url) {
  return new Promise((resolve) => {
    const req = https.get(url, (res) => {
      console.log('HTTPS status:', res.statusCode);
      console.log('Headers:', res.headers);
      res.on('data', ()=>{});
      res.on('end', () => resolve());
    });
    req.on('error', (err) => {
      console.error('HTTPS request error:', err.code, err.message);
      resolve();
    });
    req.setTimeout(8000, () => {
      console.error('HTTPS request timeout');
      req.destroy();
      resolve();
    });
  });
}

(async () => {
  const host = SUPABASE_URL.replace(/^https:\/\//,'').split('/')[0];
  console.log('\n--- DNS Resolution ---');
  await dnsResolve(host);

  console.log('\n--- HTTPS Health Check ---');
  await httpsGet(authHealth);

  console.log('\nDone.');
})();
