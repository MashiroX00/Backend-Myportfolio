import nodemailer from "nodemailer"
import { render } from "@react-email/render"
import CvRequestEmail from "../emails/CvRequestEmail"

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_APP_PASSWORD,
  },
})

export async function sendCvEmail(to: string, ownerName: string, cvUrl: string): Promise<void> {
  const html = await render(<CvRequestEmail ownerName={ownerName} cvUrl={cvUrl} />)

  await transporter.sendMail({
    from: process.env.GMAIL_USER,
    to,
    subject: "Your requested CV/Resume",
    text: `Hi,\n\nHere is the CV/Resume you requested from ${ownerName}:\n${cvUrl}\n\nThanks!`,
    html,
  })
}
