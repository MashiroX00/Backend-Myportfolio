import "dotenv/config"
import express from "express"
import cors from "cors"

import authRouter from "./routes/auth"
import aboutRouter from "./routes/about"
import projectsRouter from "./routes/projects"
import experienceRouter from "./routes/experience"
import skillsRouter from "./routes/skills"
import educationRouter from "./routes/education"
import certificatesRouter from "./routes/certificates"
import contactRouter from "./routes/contact"

const app = express()
const PORT = process.env.PORT ?? 4000

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000").split(",")

app.use(cors({ origin: allowedOrigins }))
app.use(express.json())

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use("/auth", authRouter)
app.use("/about", aboutRouter)
app.use("/projects", projectsRouter)
app.use("/experience", experienceRouter)
app.use("/skills", skillsRouter)
app.use("/education", educationRouter)
app.use("/certificates", certificatesRouter)
app.use("/contact", contactRouter)

app.listen(PORT, () => {
  console.log(`Content API running on http://localhost:${PORT}`)
})
