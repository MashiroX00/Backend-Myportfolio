import { Router } from "express"
import { getGitHubActivity } from "../lib/github"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const data = await getGitHubActivity()
    res.json(data)
  } catch {
    res.status(503).json({ error: "GitHub Activity unavailable" })
  }
})

export default router
