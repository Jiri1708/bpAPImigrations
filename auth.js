// auth.js
const authMiddleware = (requiredScopes) => {
  return (req, res, next) => {
    const authHeader = req.headers.authorization;

    // Log auth attempt
    logger.debug("Checking authorization", {
      requiredScopes,
      hasAuthHeader: !!authHeader,
    });

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Missing or invalid authorization header");
      return res.status(401).json({ error: "Missing authorization token" });
    }

    const token = authHeader.split(" ")[1];

    // In real app, validate JWT token here
    // For mock, just check if token exists and has required scope
    try {
      // Mock token validation
      const mockValidation = {
        isValid: true,
        scopes: [
          "openid",
          "profile",
          "products.read",
          "products.create",
          "orders.create",
        ],
      };

      const hasRequiredScopes = requiredScopes.every((scope) =>
        mockValidation.scopes.includes(scope)
      );

      if (!hasRequiredScopes) {
        logger.warn("Insufficient scopes", {
          required: requiredScopes,
          provided: mockValidation.scopes,
        });
        return res.status(403).json({ error: "Insufficient permissions" });
      }

      // Add user info to request
      req.user = {
        sub: "123",
        scopes: mockValidation.scopes,
      };

      logger.debug("Authorization successful", {
        user: req.user.sub,
        scopes: req.user.scopes,
      });

      next();
    } catch (error) {
      logger.error("Auth validation failed", { error });
      res.status(401).json({ error: "Invalid token" });
    }
  };
};

module.exports = { authMiddleware };
