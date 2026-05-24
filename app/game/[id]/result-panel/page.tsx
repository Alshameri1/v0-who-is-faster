import { Metadata } from 'next'
import { ResultPanelClient } from './result-panel-client'

interface Props {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  return {
    title: `لوحة النتائج - ${id}`,
    description: 'شاشة عرض نتائج التحدي في الوقت الفعلي',
  }
}

export default async function ResultPanelPage({ params }: Props) {
  const { id } = await params
  return <ResultPanelClient gameId={id} />
}
