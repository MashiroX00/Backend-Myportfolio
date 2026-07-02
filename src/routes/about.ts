import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isNonEmptyString, isOptionalString, isStringArray, isOptionalHttpUrl } from "../lib/validate"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const about = await prisma.about.findFirst()
    res.json(about ?? null)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/", requireAuth, async (req, res) => {
  const { name, titles, bio, photo_url, cv_url } = (req.body ?? {}) as {
    name: string; titles: string[]; bio: string; photo_url: string; cv_url: string | null
  }
  if (
    !isNonEmptyString(name, 200) ||
    !isStringArray(titles, 20, 100) ||
    !isOptionalString(bio, 10000) ||
    !isOptionalHttpUrl(photo_url) ||
    !isOptionalHttpUrl(cv_url)
  ) {
    return res.status(400).json({ error: "Invalid input" })
  }
  try {
    const about = await prisma.about.upsert({
      where: { id: 1 },
      create: { id: 1, name, titles, bio, photo_url, cv_url },
      update: { name, titles, bio, photo_url, cv_url },
    })
    res.json(about)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

export default router
