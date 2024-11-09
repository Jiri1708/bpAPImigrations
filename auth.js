// auth.js
const jwt = require('jsonwebtoken');
const { logger } = require('./logger');

// Secret key for JWT signing (in production this would be properly secured)
const JWT_SECRET = 'your-secret-key';

// Valid scopes from API spec
const VALID_SCOPES = [
  'openid',
  'profile',
  'email',
  'products.read',
  'products.create',
  'products.delete',
  'products.update',
  'categories.read',
  'categories.create',
  'orders.read',
  'orders.create',
  'orders.update',
  'payments.create',
  'clients.read',
  'clients.create',
  'deliveries.schedule'
];

// Mock user store
const users = new Map();

// Mock token store
const tokens = new Map();

const generateToken = (userId, scopes) => {
  const token = jwt.sign(
    {
      sub: userId,
      scopes: scopes,
    },
    JWT_SECRET,
    { expiresIn: '1h' }
  );
  return token;
};

const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.error('Token verification failed', { error });
    return null;
  }
};

const authMiddleware = (requiredScopes = []) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      logger.warn('Missing or invalid authorization header');
      return res.status(401).json({ error: 'Authorization required' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if token has required scopes
    const hasRequiredScopes = requiredScopes.every(scope => 
      decoded.scopes.includes(scope)
    );

    if (!hasRequiredScopes) {
      logger.warn('Insufficient scopes', {
        required: requiredScopes,
        provided: decoded.scopes
      });
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Add user info to request
    req.user = decoded;
    next();
  };
};

// Auth endpoints
const authRouter = require('express').Router();

authRouter.post('/oauth2/token', (req, res) => {
  const { grant_type, code, client_id, client_secret } = req.body;

  // Mock token generation
  const token = generateToken('user123', VALID_SCOPES);
  
  res.json({
    access_token: token,
    token_type: 'Bearer',
    expires_in: 3600,
    scope: VALID_SCOPES.join(' ')
  });
});

authRouter.get('/oauth2/authorize', (req, res) => {
  const { client_id, redirect_uri, scope, state } = req.query;
  
  // Mock authorization - in real app would show login/consent page
  const code = 'mock_auth_code';
  const redirectUrl = `${redirect_uri}?code=${code}&state=${state}`;
  
  res.redirect(redirectUrl);
});

module.exports = {
  authMiddleware,
  authRouter
};
