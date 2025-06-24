const { getSalon } = require('../jwtMapping/SalonMapping');

async function restrictToLoggedInSalonOnly(req, res, next) {
  // Public routes that don't need authentication
  const publicPaths = ['/login', '/login/submit', '/signup', '/signup/submit'];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers['authorization'];

  // Check if token exists and is properly formatted
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];
    // const token = authHeader;

 
  try {
    const user = await getSalon(token);
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized: Invalid token' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Salon token verification error:', error.message);
    return res.status(401).json({ error: 'Unauthorized: Token verification failed' });
  }
}
 
module.exports = {
  restrictToLoggedInSalonOnly,
};
