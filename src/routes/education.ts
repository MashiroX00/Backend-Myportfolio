import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isNonEmptyString, isInt, isReorderPayload } from "../lib/validate"

const router = Router()

interface EducationInput {
  school: string
  degree: string
  major: string
  start_year: number
  end_year: number | null
  position: number
}

function parseEducation(body: unknown): EducationInput | null {
  const { school, degree, major, start_year, end_year, position } = (body ?? {}) as Record<string, unknown>
  if (
    !isNonEmptyString(school, 200) ||
    !isNonEmptyString(degree, 200) ||
    !isNonEmptyString(major, 200) ||
    !isInt(start_year, 1900, 3000) ||
    (end_year != null && !isInt(end_year, 1900, 3000)) ||
    !isInt(position)
  ) {
    return null
  }
  return {
    school,
    degree,
    major,
    start_year,
    end_year: (end_year as number | undefined) ?? null,
    position,
  }
}

router.get("/", async (_req, res) => {
  try {
    const items = await prisma.education.findMany({ orderBy: { position: "asc" } })
    res.json(items)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const data = parseEducation(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const item = await prisma.education.create({ data })
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
        prisma.education.update({ where: { id }, data: { position } })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const data = parseEducation(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const item = await prisma.education.update({
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
    await prisma.education.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
