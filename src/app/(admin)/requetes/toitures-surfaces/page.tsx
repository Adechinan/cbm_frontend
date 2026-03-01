/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getBatiments } from '@/services/batimentService'
import { Metadata } from 'next'
import ToituresSurfacesManager from './components/ToituresSurfacesManager'

export const metadata: Metadata = { title: 'Requêtes — Toitures & Surfaces' }

export default async function ToituresSurfacesPage() {
  const batiments = await getBatiments()

  return (
    <>
      <PageTitle title="Requêtes" subTitle="Toitures & Surfaces" />
      <ToituresSurfacesManager batiments={batiments} />
    </>
  )
}
