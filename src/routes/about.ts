import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"

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
  const { name, titles, bio, photo_url } = req.body as {
    name: string; titles: string[]; bio: string; photo_url: string
  }
  try {
    const about = await prisma.about.upsert({
      where: { id: 1 },
      create: { id: 1, name, titles, bio, photo_url },
      update: { name, titles, bio, photo_url },
    })
    res.json(about)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

export default router
