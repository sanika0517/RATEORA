
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

const SALT_ROUNDS = 12;

// GENERATE JWT TOKEN
function generateToken(user) {
  return jwt.sign(
    {
      id: user.id,
      role: user.role,
      tokenVersion: user.tokenVersion,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: process.env.JWT_EXPIRES_IN || "1d",
    }
  );
}

// REMOVE PASSWORD HASH FROM RESPONSE
function safeUser(user) {
  const { passwordHash, tokenVersion, ...userData } = user;
  return userData;
}

// REGISTER NORMAL USER
export const register = async (req, res, next) => {
  try {
    const { name, email, address, password } = req.body;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        address,
        passwordHash,
        role: "NORMAL_USER",
      },
    });

    const token = generateToken(user);

    res.status(201).json({
      success: true,
      message: "Registration successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// LOGIN ALL ROLES
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: safeUser(user),
    });
  } catch (error) {
    next(error);
  }
};

// GET CURRENT USER
export const getMe = async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user,
  });
};

// CHANGE PASSWORD
export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const validPassword = await bcrypt.compare(
      currentPassword,
      user.passwordHash
    );

    if (!validPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({
        success: false,
        message: "New password must be different",
      });
    }

    const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        tokenVersion: {
          increment: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Password updated successfully. Please log in again.",
    });
  } catch (error) {
    next(error);
  }
};

// LOGOUT - INVALIDATE ALL EXISTING TOKENS
export const logout = async (req, res, next) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });

    res.status(200).json({
      success: true,
      message: "Logout successful. All existing sessions have been invalidated.",
    });
  } catch (error) {
    next(error);
  }
};
