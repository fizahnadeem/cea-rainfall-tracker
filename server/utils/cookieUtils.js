// server/utils/cookieUtils.js
// Utility functions for setting and clearing API key cookies
const cookie = require('cookie');

// Set API key cookie (httpOnly, secure in production, sameSite)
function setApiKeyCookie(res, apiKey) {
  const serialized = cookie.serialize('apiKey', apiKey, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 1 week
  });
  res.setHeader('Set-Cookie', serialized);
}

// Clear API key cookie
function clearApiKeyCookie(res) {
  const serialized = cookie.serialize('apiKey', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 0
  });
  res.setHeader('Set-Cookie', serialized);
}

module.exports = {
  setApiKeyCookie,
  clearApiKeyCookie
}; 