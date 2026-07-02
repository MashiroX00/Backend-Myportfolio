import { Router } from "express"
import prisma from "../db"
import { requireAuth } from "../middleware/auth"
import { isNonEmptyString, isOptionalString, isOptionalHttpUrl, isInt, isReorderPayload } from "../lib/validate"

const router = Router()

interface CertificateInput {
  cert_name: string
  cert_description: string | null
  issuer: string
  date_issued: Date
  url: string | null
  position: number
}

function parseCertificate(body: unknown): CertificateInput | null {
  const { cert_name, cert_description, issuer, date_issued, url, position } = (body ?? {}) as Record<string, unknown>
  if (
    !isNonEmptyString(cert_name, 200) ||
    !isOptionalString(cert_description, 5000) ||
    !isNonEmptyString(issuer, 200) ||
    typeof date_issued !== "string" ||
    Number.isNaN(new Date(date_issued).getTime()) ||
    !isOptionalHttpUrl(url) ||
    !isInt(position)
  ) {
    return null
  }
  return {
    cert_name,
    cert_description: cert_description ?? null,
    issuer,
    date_issued: new Date(date_issued),
    url: url || null,
    position,
  }
}

router.get("/", async (_req, res) => {
  try {
    const items = await prisma.certificate.findMany({ orderBy: { position: "asc" } })
    res.json(items)
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.post("/", requireAuth, async (req, res) => {
  const data = parseCertificate(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const item = await prisma.certificate.create({ data })
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
        prisma.certificate.update({ where: { id }, data: { position } })
      )
    )
    res.json({ success: true })
  } catch {
    res.status(500).json({ error: "Database error" })
  }
})

router.put("/:id", requireAuth, async (req, res) => {
  const data = parseCertificate(req.body)
  if (!data) return res.status(400).json({ error: "Invalid input" })
  try {
    const item = await prisma.certificate.update({
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
    await prisma.certificate.delete({ where: { id: Number(req.params.id) } })
    res.status(204).send()
  } catch {
    res.status(404).json({ error: "Not found" })
  }
})

export default router
