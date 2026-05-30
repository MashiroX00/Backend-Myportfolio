import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const items = await prisma.education.findMany({ orderBy: { position: "asc" } })
    res.json(items)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const { school, degree, major, start_year, end_year, position } = req.body
  try {
    const item = await prisma.education.create({
      data: { school, degree, major, start_year, end_year: end_year ?? null, position },
    })
    res.status(201).json(item)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/reorder", requireAuth, async (req, res) => {
  const items = req.body as { id: number; position: number }[]
  try {
    await prisma.$transaction(
      items.map(({ id, position }) =>
        prisma.education.update({ where: { id }, data: { position } })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const { school, degree, major, start_year, end_year, position } = req.body
  try {
    const item = await prisma.education.update({
      where: { id: Number(req.params.id) },
      data: { school, degree, major, start_year, end_year: end_year ?? null, position },
    })
    res.json(item)
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.education.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
