// root page now acts as a lightweight "templates" landing screen.  the
// heavy editor component is moved to /editor so that the user is not
// dropped straight into the project on first load.

import { TemplateGrid } from './components/TemplateGrid'

export default function Home() {
  return <TemplateGrid />
}
