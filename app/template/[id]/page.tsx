import { TemplateDetailPage } from './TemplateDetailPage'

export const dynamic = 'force-dynamic'

interface TemplatePageProps {
  params: Promise<{
    id: string
  }>
}

export default async function TemplatePage({ params }: TemplatePageProps) {
  const { id } = await params
  
  return <TemplateDetailPage templateId={id} />
}
