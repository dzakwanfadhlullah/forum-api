import AuthenticationTokenManager from '../../../Applications/security/AuthenticationTokenManager.js';
import AuthenticationError from '../../../Commons/exceptions/AuthenticationError.js';

const authentication = (container) => async (req, res, next) => {
  try {
    const authorization = req.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      throw new AuthenticationError('Missing authentication');
    }
    const token = authorization.slice(7);
    const tokenManager = container.getInstance(AuthenticationTokenManager.name);
    req.auth = await tokenManager.verifyAccessToken(token);
    next();
  } catch (error) {
    next(error);
  }
};

export default authentication;
