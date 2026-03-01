/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getBatiments, getSectionsFiche } from '@/services/batimentService'
import { Metadata } from 'next'
import BatimentManager from '../parametrage/batiment/components/BatimentManager'

export const metadata: Metadata = {
  title: 'Bâtiments',
}

export default async function BatimentsPage() {
  const [batiments, sections] = await Promise.all([getBatiments(), getSectionsFiche()])

  return (
    <>
      <PageTitle title="Bâtiments" subTitle="Gestion" />
      <BatimentManager batimentsInit={batiments} sections={sections} />
    </>
  )
}
