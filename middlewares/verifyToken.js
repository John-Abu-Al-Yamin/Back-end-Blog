const jwt = require("jsonwebtoken");

// verifyToken
function verifyToken(req, res, next) {
  const authToken = req.headers.authorization;

  if (authToken) {
    const token = authToken.split(" ")[1];
    try {
      const decodepayload = jwt.verify(token, process.env.JWT_SECRWT);
      req.user = decodepayload;
      next();
    } catch (error) {
      return res.status(401).json({ message: "Invalid Token, access denied " });
    }
  } else {
    return res
      .status(401)
      .json({ message: "no token provided, access denied " });
  }
}

// verify token & Admin
function verifyTokenAdmin(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "not allowed, Only admin " });
    }
  });
}

// verify token & Only User Himself
function verifyTokenOnlyUser(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id) {
      next();
    } else {
      return res.status(403).json({ message: "not allowed, Only User Himself" });
    }
  });
}

// verify token & Admin & User Himself
function verifyTokenAndAuthorization(req, res, next) {
  verifyToken(req, res, () => {
    if (req.user.id === req.params.id || req.user.isAdmin) {
      next();
    } else {
      return res.status(403).json({ message: "not allowed, Only User Himself or Admin" });
    }
  });
}

module.exports = {
  verifyToken,
  verifyTokenAdmin,
  verifyTokenOnlyUser,
  verifyTokenAndAuthorization
};
