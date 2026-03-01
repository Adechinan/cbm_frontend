/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getBatiments } from '@/services/batimentService'
import { Metadata } from 'next'
import RequetesManager from './components/RequetesManager'

export const metadata: Metadata = { title: 'Requêtes — Statistiques' }

export default async function RequestPage() {
  const batiments = await getBatiments()

  return (
    <>
      <PageTitle title="Requêtes" subTitle="Statistiques" />
      <RequetesManager batiments={batiments} />
    </>
  )
}
