import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isNonEmptyString, isInt, isReorderPayload } from "../lib/validate"

const router = Router()

interface SkillInput {
  name: string
  category: string
  position: number
}

function parseSkill(body: unknown): SkillInput | null {
  const { name, category, position } = (body ?? {}) as Record<string, unknown>
  if (!isNonEmptyString(name, 100) || !isNonEmptyString(category, 100) || !isInt(position)) {
    return null
  }
  return { name, category, position }
}

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
  const data = parseSkill(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const skill = await prisma.skill.create({ data })
    res.status(201).json(skill)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/reorder", requireAuth, async (req, res) => {
  const items = req.body
  if (!isReorderPayload(items)) return res.status(400).json({ error: "Invalid input" })
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
  const data = parseSkill(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const skill = await prisma.skill.update({
      where: { id: Number(req.params.id) },
      data,
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
