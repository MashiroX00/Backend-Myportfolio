import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isNonEmptyString, isHttpUrl } from "../lib/validate"

const router = Router()

function parseContact(body: unknown): { platform: string; url: string } | null {
  const { platform, url } = (body ?? {}) as { platform?: unknown; url?: unknown }
  if (!isNonEmptyString(platform, 50) || !isHttpUrl(url)) return null
  return { platform: platform.trim(), url }
}

router.get("/", async (_req, res) => {
  try {
    const links = await prisma.contact.findMany({ orderBy: { id: "asc" } })
    res.json(links)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const data = parseContact(req.body)
  if (!data) {
    return res.status(400).json({ error: "platform (max 50 chars) and a valid http(s) url are required" })
  }
  try {
    const link = await prisma.contact.create({ data })
    res.status(201).json(link)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const data = parseContact(req.body)
  if (!data) {
    return res.status(400).json({ error: "platform (max 50 chars) and a valid http(s) url are required" })
  }
  try {
    const link = await prisma.contact.update({
      where: { id: Number(req.params.id) },
      data,
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
