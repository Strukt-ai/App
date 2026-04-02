import type { Metadata } from 'next'
import { GoogleOAuthProvider } from '@react-oauth/google'
import './globals.css'
import './App.css'
import { OtelClientInit } from '@/components/otel/OtelClientInit'

export const metadata: Metadata = {
  title: 'Strukt.AI - AI-Powered Floor Planning',
  description: 'Create stunning 3D floor plans with AI assistance',
}

const CLIENT_ID = "56909186950-20kpuogci6mlge54871pks80e06941cr.apps.googleusercontent.com"

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
          <OtelClientInit />
          {children}
        </GoogleOAuthProvider>
      </body>
    </html>
  )
}
