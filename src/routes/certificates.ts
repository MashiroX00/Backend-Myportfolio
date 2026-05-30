import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const items = await prisma.certificate.findMany({ orderBy: { position: "asc" } })
    res.json(items)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const { cert_name, cert_description, issuer, date_issued, url, position } = req.body
  try {
    const item = await prisma.certificate.create({
      data: { cert_name, cert_description, issuer, date_issued: new Date(date_issued), url, position },
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
        prisma.certificate.update({ where: { id }, data: { position } })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const { cert_name, cert_description, issuer, date_issued, url, position } = req.body
  try {
    const item = await prisma.certificate.update({
      where: { id: Number(req.params.id) },
      data: { cert_name, cert_description, issuer, date_issued: new Date(date_issued), url, position },
    })
    res.json(item)
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

router.delete("/:id", requireAuth, async (req, res) => {
  try {
    await prisma.certificate.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
