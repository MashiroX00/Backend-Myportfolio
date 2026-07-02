const ACCENT = "#FFE600"

interface Props {
  ownerName: string
  cvUrl: string
}

export default function CvRequestEmail({ ownerName, cvUrl }: Props) {
  return (
    <html>
      <body style={{ margin: 0, padding: 0, backgroundColor: "#f4f4f5", fontFamily: "Helvetica, Arial, sans-serif" }}>
        <table width="100%" cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#f4f4f5", padding: "32px 0" }}>
          <tr>
            <td align="center">
              <table width={480} cellPadding={0} cellSpacing={0} style={{ backgroundColor: "#0a0a0a", borderRadius: 12, overflow: "hidden" }}>
                <tr>
                  <td style={{ height: 4, backgroundColor: ACCENT }} />
                </tr>
                <tr>
                  <td style={{ padding: "32px 32px 24px" }}>
                    <p style={{ margin: 0, fontSize: 12, letterSpacing: 2, textTransform: "uppercase", color: ACCENT }}>
                      Portfolio
                    </p>
                    <h1 style={{ margin: "8px 0 16px", fontSize: 20, color: "#ffffff" }}>
                      Your requested CV/Resume
                    </h1>
                    <p style={{ margin: "0 0 24px", fontSize: 14, lineHeight: 1.6, color: "rgba(255,255,255,0.6)" }}>
                      Here is the CV/Resume you requested from {ownerName}.
                    </p>
                    <a
                      href={cvUrl}
                      style={{
                        display: "inline-block",
                        padding: "12px 24px",
                        borderRadius: 8,
                        backgroundColor: ACCENT,
                        color: "#000000",
                        fontSize: 14,
                        fontWeight: 600,
                        textDecoration: "none",
                      }}
                    >
                      Download CV/Resume
                    </a>
                    <p style={{ margin: "24px 0 0", fontSize: 12, color: "rgba(255,255,255,0.3)" }}>
                      If the button doesn&apos;t work, copy this link: {cvUrl}
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  )
}
