// server/middleware/verifyJWT.js
function verifyAdmin(req, res, next) {
  if (req.decoded.role !== "admin") {
    return res.status(403).json({ message: "Admin access denied" });
  }
  next();
}

function verifyModerator(req, res, next) {
  if (req.decoded.role !== "moderator") {
    return res.status(403).json({ message: "Moderator access denied" });
  }
  next();
}

module.exports = { verifyAdmin, verifyModerator };
