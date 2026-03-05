"use client"

import { useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically load the heavy editor; no server-side rendering
const App = dynamic(() => import('./components/App'), { ssr: false })

export default function HomePage() {
  return <App />
}

