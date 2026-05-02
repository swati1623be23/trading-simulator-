const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/User");
const Wallet = require("../models/Wallet");
const { emailSchema, passwordSchema } = require("../lib/validation");

function signToken(userId) {
  return jwt.sign({}, process.env.JWT_SECRET, {
    subject: String(userId),
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
  });
}

async function signup(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const cleanEmail = emailSchema.parse(email).toLowerCase();
    const cleanPassword = passwordSchema.parse(password);

    const existing = await User.findOne({ email: cleanEmail });
    if (existing) return next(Object.assign(new Error("Email already in use"), { status: 409 }));

    const passwordHash = await bcrypt.hash(cleanPassword, 12);
    const user = await User.create({ email: cleanEmail, passwordHash });
    await Wallet.create({ userId: user._id, cash: 10_000 });

    const token = signToken(user._id);
    res.status(201).json({ ok: true, token, user: { id: String(user._id), email: user.email } });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.validated.body;
    const cleanEmail = emailSchema.parse(email).toLowerCase();
    const cleanPassword = passwordSchema.parse(password);

    const user = await User.findOne({ email: cleanEmail });
    if (!user) return next(Object.assign(new Error("Invalid credentials"), { status: 401 }));

    const ok = await bcrypt.compare(cleanPassword, user.passwordHash);
    if (!ok) return next(Object.assign(new Error("Invalid credentials"), { status: 401 }));

    const token = signToken(user._id);
    res.json({ ok: true, token, user: { id: String(user._id), email: user.email } });
  } catch (err) {
    next(err);
  }
}

module.exports = { signup, login };

