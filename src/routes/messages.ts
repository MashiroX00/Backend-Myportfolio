import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isRateLimited } from "../lib/rateLimit"
import { isNonEmptyString } from "../lib/validate"

const router = Router()

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 3

router.post("/", async (req, res) => {
  const { name, message } = (req.body ?? {}) as { name?: unknown; message?: unknown }

  if (!isNonEmptyString(name, 100) || !isNonEmptyString(message, 2000)) {
    return res.status(400).json({ error: "Name (max 100 chars) and message (max 2000 chars) are required" })
  }

  if (isRateLimited("messages", req.ip ?? "unknown", RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX)) {
    return res.status(429).json({ error: "Too many requests, try again later" })
  }

  try {
    const created = await prisma.message.create({ data: { name: name.trim(), message: message.trim() } })
    res.status(201).json(created)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.get("/", requireAuth, async (_req, res) => {
  try {
    const messages = await prisma.message.findMany({ orderBy: { created_at: "desc" } })
    res.json(messages)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id/read", requireAuth, async (req, res) => {
  try {
    const message = await prisma.message.update({
      where: { id: Number(req.params.id) },
      data: { read: true },
    })
    res.json(message)
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
