import { Router } from "express"
import jwt from "jsonwebtoken"
import bcrypt from "bcryptjs"
import { isRateLimited } from "../lib/rateLimit"

const router = Router()

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 5

router.post("/login", async (req, res) => {
  if (isRateLimited("login", req.ip ?? "unknown", RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX)) {
    return res.status(429).json({ error: "Too many attempts, try again later" })
  }

  const { username, password } = (req.body ?? {}) as { username?: unknown; password?: unknown }
  const passwordOk =
    typeof password === "string" &&
    password.length <= 200 &&
    (await bcrypt.compare(password, process.env.OWNER_PASSWORD_HASH!))

  if (username !== process.env.OWNER_USERNAME || !passwordOk) {
    return res.status(401).json({ error: "Invalid credentials" })
  }

  const token = jwt.sign({ sub: "owner" }, process.env.JWT_SECRET!, { expiresIn: "1d" })
  res.json({ token })
})

export default router
