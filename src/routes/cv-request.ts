import { Router } from "express"
import prisma from "../db"
import { sendCvEmail } from "../lib/mailer"
import { isRateLimited } from "../lib/rateLimit"

const router = Router()

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000
const RATE_LIMIT_MAX = 3

// Global daily cap so the endpoint can't be used to burn the Gmail quota or
// harass third-party inboxes even from many distinct IPs.
const DAILY_MAX_EMAILS = 20
let sentToday = 0
let sentDay = new Date().toDateString()

function underDailyCap(): boolean {
  const today = new Date().toDateString()
  if (today !== sentDay) {
    sentDay = today
    sentToday = 0
  }
  return sentToday < DAILY_MAX_EMAILS
}

router.post("/", async (req, res) => {
  const { email } = (req.body ?? {}) as { email?: unknown }

  if (typeof email !== "string" || email.length > 254 || !EMAIL_RE.test(email)) {
    return res.status(400).json({ error: "Invalid email address" })
  }

  if (
    isRateLimited("cv-request", req.ip ?? "unknown", RATE_LIMIT_WINDOW_MS, RATE_LIMIT_MAX) ||
    !underDailyCap()
  ) {
    return res.status(429).json({ error: "Too many requests, try again later" })
  }

  try {
    const about = await prisma.about.findFirst()
    if (!about?.cv_url) {
      return res.status(400).json({ error: "CV not available" })
    }

    await sendCvEmail(email, about.name, about.cv_url)
    sentToday++
    res.json({ sent: true })
  } catch {
    res.status(500).json({ error: "Failed to send email" })
  }
})

export default router
