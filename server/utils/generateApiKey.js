const jwt = require('jsonwebtoken');

// Get JWT secret from environment or fallback
const getJwtSecret = () => process.env.JWT_SECRET;

/**
 * Generate a JWT token for a user
 * @param {object} payload - The payload to encode (e.g., { email, isAdmin, userId })
 * @param {string|number} expiresIn - Expiry time (e.g., '7d', '1h')
 * @returns {string} JWT token
 */
const generateJwtToken = (payload, expiresIn = '7d') => {
  return jwt.sign(payload, getJwtSecret(), { expiresIn });
};

/**
 * Verify a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object|null} Decoded payload if valid, or null if invalid
 */
const verifyJwtToken = (token) => {
  try {
    return jwt.verify(token, getJwtSecret());
  } catch (err) {
    return null;
  }
};

const generateApiKey = () => {
   return jwt.sign({
      email: 'testadmin@centrala.com',
      isAdmin: true,
      userId: 'admin'
   }, getJwtSecret(), { expiresIn: '7d' });
};

module.exports = {
  generateJwtToken,
  verifyJwtToken,
  getJwtSecret,
  generateApiKey
}; 