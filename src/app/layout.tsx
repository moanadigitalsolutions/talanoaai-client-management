import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Sidebar from '@/components/layout/Sidebar'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'TalanoaAI - Client Management',
  description: 'Professional client management system',
  manifest: '/manifest.json',
  themeColor: '#0ea5e9',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'TalanoaAI',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/icon-192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
      </head>
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="flex h-screen bg-neutral-100">
          <Sidebar />
          <main className="flex-1 overflow-auto bg-neutral-50">
            {children}
          </main>
        </div>
      </body>
    </html>
  )
}
