import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const skills = await prisma.skill.findMany({
      orderBy: [{ category: "asc" }, { position: "asc" }],
    })
    res.json(skills)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const { name, category, position } = req.body
  try {
    const skill = await prisma.skill.create({ data: { name, category, position } })
    res.status(201).json(skill)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/reorder", requireAuth, async (req, res) => {
  const items = req.body as { id: number; position: number }[]
  try {
    await prisma.$transaction(
      items.map(({ id, position }) =>
        prisma.skill.update({ where: { id }, data: { position } })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const { name, category, position } = req.body
  try {
    const skill = await prisma.skill.update({
      where: { id: Number(req.params.id) },
      data: { name, category, position },
    })
    res.json(skill)
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.skill.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
