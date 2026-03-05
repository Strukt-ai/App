"use client"

import dynamic from 'next/dynamic'

// dynamically load the heavy editor; no server-side rendering
const App = dynamic(() => import('../components/App'), { ssr: false })

export default function EditorPage() {
  // The App component reads the template from useSearchParams(),
  // so we don't need to pass it as a prop
  return <App />
}
