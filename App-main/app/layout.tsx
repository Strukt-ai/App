import type { Metadata } from 'next'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './globals.css'
import './App.css'

export const metadata: Metadata = {
  title: 'Strukt.AI - AI-Powered Floor Planning',
  description: 'Create stunning 3D floor plans with AI assistance',
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
}

const CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body>
        <GoogleOAuthProvider clientId={CLIENT_ID}>
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
