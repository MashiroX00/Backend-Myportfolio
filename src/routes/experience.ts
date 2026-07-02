import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isNonEmptyString, isOptionalString, isInt, isReorderPayload } from "../lib/validate"

const router = Router()

interface ExperienceInput {
  company: string
  role: string
  start_date: string
  end_date: string | null
  description: string | null
  position: number
}

function parseExperience(body: unknown): ExperienceInput | null {
  const { company, role, start_date, end_date, description, position } = (body ?? {}) as Record<string, unknown>
  if (
    !isNonEmptyString(company, 200) ||
    !isNonEmptyString(role, 200) ||
    !isNonEmptyString(start_date, 50) ||
    !isOptionalString(end_date, 50) ||
    !isOptionalString(description, 5000) ||
    !isInt(position)
  ) {
    return null
  }
  return {
    company,
    role,
    start_date,
    end_date: end_date ?? null,
    description: description ?? null,
    position,
  }
}

router.get("/", async (_req, res) => {
  try {
    const items = await prisma.experience.findMany({ orderBy: { position: "asc" } })
    res.json(items)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const data = parseExperience(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const item = await prisma.experience.create({ data })
    res.status(201).json(item)
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
        prisma.experience.update({ where: { id }, data: { position } })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const data = parseExperience(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const item = await prisma.experience.update({
      where: { id: Number(req.params.id) },
      data,
    })
    res.json(item)
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.experience.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
