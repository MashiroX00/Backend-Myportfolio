import { Router } from "express"
import jwt from "jsonwebtoken"

const router = Router()

router.post("/login", (req, res) => {
  const { username, password } = req.body as { username: string; password: string }
  if (
    username !== process.env.OWNER_USERNAME ||
    password !== process.env.OWNER_PASSWORD
  ) {
    res.status(401).json({ error: "Invalid credentials" })
    return
  }
  const token = jwt.sign({ sub: "owner" }, process.env.JWT_SECRET!, { expiresIn: "7d" })
  res.json({ token })
})

export default router
