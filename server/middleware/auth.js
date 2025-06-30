const jwt = require("jsonwebtoken");
const User = require("../models/userModel");  // adjust the path if needed

const auth = async (req, res, next) => {
  try {
    const rawToken = req.header("Authorization");
    // console.log("Raw token generated: ", rawToken);

    if (!rawToken) return res.status(400).json({ msg: "Invalid Authentication" });

    // Remove Bearer prefix if present
    const token = rawToken.startsWith("Bearer ")
      ? rawToken.slice(7, rawToken.length).trim()
      : rawToken;
      // console.log("Token generated: ", token);


    // console.log("Secret used for VERIFYING: ", process.env.TOKEN_SECRET);


    jwt.verify(token, process.env.TOKEN_SECRET, async (err, decoded) => {
      if (err) return res.status(400).json({ msg: "Authorization not valid." });

      // Fetch user details from DB
      const user = await User.findById(decoded.id).select("id name");
      if (!user) return res.status(400).json({ msg: "User not found." });

      req.user = {
        id: user._id,
        name: user.name,
      };

      next();
    });

  } catch (err) {
    return res.status(500).json({ msg: err.message });
  }
};

module.exports = auth;
