// POST /api/login  { username, password }  -> sets the session cookie checked by middleware.js
// Credentials live in Vercel environment variables (LOGIN_USER, LOGIN_PASS, AUTH_TOKEN), never in this repo.
const crypto = require('crypto');

const same = (a, b) => {
  const x = Buffer.from(String(a)), y = Buffer.from(String(b));
  return x.length === y.length && crypto.timingSafeEqual(x, y);
};

module.exports = (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method !== 'POST') { res.statusCode = 405; return res.end('{"ok":false}'); }

  let body = req.body || {};
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch { body = {}; } }
  const { LOGIN_USER, LOGIN_PASS, AUTH_TOKEN } = process.env;

  if (!LOGIN_USER || !LOGIN_PASS || !AUTH_TOKEN || !same(body.username, LOGIN_USER) || !same(body.password, LOGIN_PASS)) {
    res.statusCode = 401;
    return res.end('{"ok":false}');
  }
  res.setHeader('Set-Cookie', `jip_auth=${AUTH_TOKEN}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800`);
  res.end('{"ok":true}');
};
