const express = require("express");
const { z, validate } = require("../lib/validation");
const { signup, login } = require("../controllers/authController");

const router = express.Router();

const authSchema = z.object({
  body: z.object({
    email: z.string().trim().email("Enter a valid email"),
    password: z.string().trim().min(8, "Password must be at least 8 characters").max(72),
  }),
  params: z.object({}).passthrough(),
  query: z.object({}).passthrough(),
});

router.post("/signup", validate(authSchema), signup);
router.post("/login", validate(authSchema), login);

module.exports = router;

