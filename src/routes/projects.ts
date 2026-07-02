import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isNonEmptyString, isOptionalString, isStringArray, isOptionalHttpUrl, isInt, isReorderPayload } from "../lib/validate"

const router = Router()

interface ProjectInput {
  title: string
  description: string | null
  tech_stack: string[]
  url: string | null
  image_url: string | null
  position: number
}

function parseProject(body: unknown): ProjectInput | null {
  const { title, description, tech_stack, url, image_url, position } = (body ?? {}) as Record<string, unknown>
  if (
    !isNonEmptyString(title, 200) ||
    !isOptionalString(description, 5000) ||
    !isStringArray(tech_stack, 50, 100) ||
    !isOptionalHttpUrl(url) ||
    !isOptionalHttpUrl(image_url) ||
    !isInt(position)
  ) {
    return null
  }
  return {
    title,
    description: description ?? null,
    tech_stack,
    url: url || null,
    image_url: image_url || null,
    position,
  }
}

router.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { position: "asc" } })
    res.json(projects)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const data = parseProject(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const project = await prisma.project.create({ data })
    res.status(201).json(project)
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
        prisma.project.update({ where: { id }, data: { position } })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const data = parseProject(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data,
    })
    res.json(project)
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.project.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
