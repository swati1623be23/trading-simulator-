const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const [scheme, token] = header.split(" ");
  if (scheme !== "Bearer" || !token) {
    return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.sub };
    return next();
  } catch {
    return next(Object.assign(new Error("Unauthorized"), { status: 401 }));
  }
}

module.exports = { requireAuth };

