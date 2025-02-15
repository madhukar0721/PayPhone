const express = require("express");
const z = require("zod");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

require("dotenv").config();
const JWT_SECRET = process.env.JWT_SECRET;

const { User } = require("../db");
const { authMiddleware, adminMiddleware } = require("../middleware");

const router = express.Router();

// SignUp Schema to validate schema for signup data
const signUpSchema = z.object({
  email: z.string(),
  password: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  isAdmin: z.boolean().optional(),
});

//signup router where user will first onboard our platform
router.post("/signup", async (req, res) => {
  try {
    const body = req.body;

    const { success } = signUpSchema.safeParse(req.body);
    const isAdmin = false;

    if (!success) {
      return res.status(400).json({
        error: "Wrong SignUp Schema",
      });
    }

    const existingUser = await User.findOne({
      email: body.email,
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already taken",
      });
    }

    const hashedPassword = await bcrypt.hash(body.password, 10);

    const newUser = await User.create({
      email: body.email,
      password: hashedPassword,
      firstName: body.firstName,
      lastName: body.lastName,
      isAdmin: body.isAdmin || isAdmin,
    });

    const newUserId = newUser._id;

    const token = jwt.sign(
      {
        newUserId,
        isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "1m" } // setting expiry for jwt token
    );

    newUser.token = token;
    await newUser.save();

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
  email: z.string(),
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
      email: body.email,
    });

    if (!user) {
      return res.status(401).json({
        error: "Wrong Credentials || Check Email or password and try again",
      });
    }

    const comparePassword = await bcrypt.compare(body.password, user.password);

    console.log(comparePassword);

    if (!comparePassword) {
      return res.status(401).json({
        error: "Wrong Credentials || Check Email or password and try again",
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
        isAdmin: user.isAdmin,
      },
      JWT_SECRET,
      { expiresIn: "1h" }
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
// Bulk Endpoint to reterive all Users Data
router.get("/bulk", adminMiddleware, async (req, res) => {
  try {
    const filter = req.query.filter || "";
    console.log(filter);

    const users = await User.find({
      $or: [
        {
          firstName: {
            $regex: filter,
          },
        },
        {
          lastName: {
            $regex: filter,
          },
        },
      ],
    });

    if (!users) {
      return res.status(204).json({
        message: "No Users Found",
      });
    }

    console.log(users);

    return res.status(200).json({
      message: "Users found",
      data: users.map((user) => ({
        isAdmin: user.isAdmin,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        _id: user._id,
      })),
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

// Logout Endpoint
router.post("/logout", authMiddleware, async (req, res) => {
  try {
    const user = await User.findOne({
      _id: req.userId,
    }).maxTimeMS(5000);

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    user.token = "";
    await user.save();
    return res.status(200).json({
      message: "User Logout Successfully",
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});



const forgotPasswordSchema = z.object({
  email: {
    type: String,
    required: true,
  },
});

// Forgot Password Endpoint
router.post("/forgotPassword", async (req, res) => {
  try {
    const { success } = forgotPasswordSchema.safeParse(req.body);

    if (!success) {
      return res.status(400).json({
        error: "Wrong Forgot password Schema",
      });
    }

    // Function to send email to user email for OTP

    return res.status(200).json({
      messgae: "OTP sent to your email",
    });
  } catch (error) {
    console.error("Internal Server Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
    });
  }
});

module.exports = router;
