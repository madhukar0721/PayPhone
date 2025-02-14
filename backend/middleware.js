require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(403).json({ error: "Please provide a valid token" });
    }
    const userToken = authHeader.split(" ")[1];

    try {
      const decoded = jwt.verify(userToken, JWT_SECRET);
      if (decoded.userId) {
        req.userId = decoded.userId;
        next();
      }
    } catch (e) {
      return res.status(401).json({
        error: "Token Expired",
      });
    }
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
};

module.exports = {
  authMiddleware,
};
