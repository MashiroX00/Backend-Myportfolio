import "dotenv/config"
import express from "express"
import cors from "cors"
import helmet from "helmet"

import authRouter from "./routes/auth"
import aboutRouter from "./routes/about"
import projectsRouter from "./routes/projects"
import experienceRouter from "./routes/experience"
import skillsRouter from "./routes/skills"
import educationRouter from "./routes/education"
import certificatesRouter from "./routes/certificates"
import contactRouter from "./routes/contact"
import githubActivityRouter from "./routes/github-activity"
import cvRequestRouter from "./routes/cv-request"
import messagesRouter from "./routes/messages"

// Fail closed: without these, auth would compare against undefined and JWTs
// would be signed with an undefined secret.
const REQUIRED_ENV = ["DATABASE_URL", "OWNER_USERNAME", "OWNER_PASSWORD_HASH", "JWT_SECRET"]
const missingEnv = REQUIRED_ENV.filter((key) => !process.env[key])
if (missingEnv.length > 0) {
  console.error(`Missing required environment variables: ${missingEnv.join(", ")}`)
  process.exit(1)
}

const app = express()
const PORT = process.env.PORT ?? 4000

// Behind a reverse proxy (Cloudflare Tunnel, etc.) req.ip is the proxy's
// address unless trust proxy is set to the number of hops in front of us.
// Leave unset (0) when clients connect directly, or X-Forwarded-For spoofing
// would bypass per-IP rate limits.
const trustProxyHops = Number(process.env.TRUST_PROXY_HOPS ?? 0)
if (trustProxyHops > 0) app.set("trust proxy", trustProxyHops)

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:3000").split(",")

app.use(helmet())
app.use(cors({ origin: allowedOrigins }))
app.use(express.json({ limit: "50kb" }))

app.get("/health", (_req, res) => res.json({ status: "ok" }))

app.use("/auth", authRouter)
app.use("/about", aboutRouter)
app.use("/projects", projectsRouter)
app.use("/experience", experienceRouter)
app.use("/skills", skillsRouter)
app.use("/education", educationRouter)
app.use("/certificates", certificatesRouter)
app.use("/contact", contactRouter)
app.use("/github-activity", githubActivityRouter)
app.use("/cv-request", cvRequestRouter)
app.use("/messages", messagesRouter)

app.listen(PORT, () => {
  console.log(`Content API running on http://localhost:${PORT}`)
})
