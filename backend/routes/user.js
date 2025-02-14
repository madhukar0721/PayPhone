const express = require("express");
const z = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;
const { User } = require("../db");
const { authMiddleware } = require("../middleware");

const router = express.Router();

// SignUp Schema to validate schema for signup data
const signUpSchema = z.object({
  username: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
});

//signup router where user will first onboard our platform
router.post("/signup", async (req, res) => {
  try {
    const body = req.body;
    console.log(body);

    const { success } = signUpSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        error: "Wrong SignUp Schema",
      });
    }

    const existingUser = await User.findOne({
      username: body.username,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Username already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await User.create({
      username: body.username,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
    });

    const newUserId = newUser._id;

    const token = jwt.sign(
      {
        newUserId,
      },
      JWT_SECRET,
      { expiresIn: "1m" } // setting expiry for jwt token
    );

    return res.status(200).json({
      message: "User Created Succesfully",
      token: token,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// SignUp Schema to validate schema for signin data
const signInSchema = z.object({
  username: z.string(),
  password: z.string(),
});

//signin router where user will signin
router.post("/signin", async (req, res) => {
  try {
    const body = req.body;

    const { success } = signInSchema.safeParse(body);

    if (!success) {
      return res.status(400).json({
        error: "Wrong SignIn Schema",
      });
    }

    const user = await User.findOne({
      username: body.username,
    });

    if (!user) {
      return res.status(401).json({
        error: "Wrong Credentials || Check Username or password and try again",
      });
    }

    const comparePassword = await bcrypt.compare(body.password, user.password);

    console.log(comparePassword);

    if (!comparePassword) {
      return res.status(401).json({
        error: "Wrong Credentials || Check Username or password and try again",
      });
    }

    const lastToken = user.token || "";

    try {
      const decoded = jwt.verify(lastToken, JWT_SECRET);
      if (decoded.userId) {
        return res.status(403).json({
          error:
            "Multiple logins are not allowed. You are already logged in on another device.",
        });
      }
    } catch (error) {
      // proceed furthur
    }

    const newToken = jwt.sign(
      {
        userId: user._id,
      },
      JWT_SECRET,
      { expiresIn: "1m" }
    );

    user.token = newToken;
    await user.save();

    return res.status(200).json({
      message: "Login Successfull",
      token: newToken,
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Schema to validate schema to Update User data
const updateBodySchema = z.strictObject({
  firstName: z.string().optional(),
  lastName: z.string().optional(),
});

//updateUserCredentials router where user can update their details
router.put("/updateUserCredentials", authMiddleware, async (req, res) => {
  try {
    const { success } = updateBodySchema.safeParse(req.body);
    console.log(req.body);

    if (!success) {
      return res.status(400).json({
        error: "Wrong User Credentials Schema",
      });
    }

    await User.updateOne({ _id: req.userId }, req.body);

    return res.status(200).json({
      message: "User Updated Successfully",
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
