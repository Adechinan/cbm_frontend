/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getBatiments } from '@/services/batimentService'
import { Metadata } from 'next'
import ConstructionManager from './components/ConstructionManager'

export const metadata: Metadata = { title: 'Requêtes — Construction & Matériaux' }

export default async function ConstructionPage() {
  const batiments = await getBatiments()

  return (
    <>
      <PageTitle title="Requêtes" subTitle="Construction & Matériaux" />
      <ConstructionManager batiments={batiments} />
    </>
  )
}
