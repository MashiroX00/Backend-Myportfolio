import { Router } from "express"
import si from "systeminformation"
import os from "os"

const router = Router()

router.get("/", async (_req, res) => {
  try {
    const [cpu, mem, disks, osInfo] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.osInfo(),
    ])

    const primaryDisk = disks.find((d) => d.mount === "/" || d.mount === "C:") ?? disks[0]

    res.json({
      active: true,
      uptime_seconds: os.uptime(),
      os_name: `${osInfo.distro} ${osInfo.release}`.trim(),
      cpu_usage: Math.round(cpu.currentLoad),
      ram_total_gb: parseFloat((mem.total / 1024 ** 3).toFixed(1)),
      ram_used_gb: parseFloat(((mem.total - mem.available) / 1024 ** 3).toFixed(1)),
      disk_total_gb: primaryDisk ? parseFloat((primaryDisk.size / 1024 ** 3).toFixed(1)) : 0,
      disk_used_gb: primaryDisk ? parseFloat((primaryDisk.used / 1024 ** 3).toFixed(1)) : 0,
    })
  } catch {
    res.status(500).json({ error: "Failed to read system metrics" })
  }
})

export default router
