import '@/styles/globals.css'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Reel Maker AI',
  description: 'Generate short-form video reels with AI',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <div className="container py-6">{children}</div>
        <div id="portal-root" />
      </body>
    </html>
  )
}
