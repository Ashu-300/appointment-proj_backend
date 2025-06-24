const { getCustomer } = require('../jwtMapping/CustomerMapping');

async function restrictToLoggedInCustomerOnly(req, res, next) {
  // Allow unauthenticated access to login/signup routes
  const publicPaths = ['/login', '/login/submit', '/signup', '/signup/submit'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const user = await getCustomer(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Error verifying token:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
}

module.exports = {
  restrictToLoggedInCustomerOnly,
};
