import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "AestheticForge — Image rubric calibration for SFT/DPO",
  description: "Calibrate an image-aesthetic rubric, score images, compare pairs, export training data.",
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="zh-Hans">
      <body className="font-sans antialiased">{children}</body>
    </html>
  )
}
