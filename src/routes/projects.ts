import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const projects = await prisma.project.findMany({ orderBy: { position: "asc" } })
    res.json(projects)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const { title, description, tech_stack, url, image_url, position } = req.body
  try {
    const project = await prisma.project.create({
      data: { title, description, tech_stack, url, image_url, position },
    })
    res.status(201).json(project)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/reorder", requireAuth, async (req, res) => {
  const items = req.body as { id: number; position: number }[]
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
  const { title, description, tech_stack, url, image_url, position } = req.body
  try {
    const project = await prisma.project.update({
      where: { id: Number(req.params.id) },
      data: { title, description, tech_stack, url, image_url, position },
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
