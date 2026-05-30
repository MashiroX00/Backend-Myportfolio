import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const links = await prisma.contact.findMany({ orderBy: { id: "asc" } })
    res.json(links)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const { platform, url } = req.body as { platform: string; url: string }
  try {
    const link = await prisma.contact.create({ data: { platform, url } })
    res.status(201).json(link)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const { platform, url } = req.body as { platform: string; url: string }
  try {
    const link = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data: { platform, url },
    })
    res.json(link)
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.contact.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
