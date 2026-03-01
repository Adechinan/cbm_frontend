/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import {
  getBatiments, getCriteresEtatFonctionnel, getCriteresEtatTechnique,
} from '@/services/batimentService'
import RecensementForm from './components/RecensementForm'

export const metadata: Metadata = {
  title: 'Nouveau recensement — Bâtiments',
}

export default async function NouveauRecensementPage() {
  const [batiments, criteresFonctionnels, criteresTechniques] = await Promise.all([
    getBatiments(),
    getCriteresEtatFonctionnel(),
    getCriteresEtatTechnique(),
  ])

  return (
    <>
      <PageTitle title="Nouveau recensement" subTitle="Bâtiments / Recensements" />
      <RecensementForm
        batiments={batiments}
        criteresFonctionnels={criteresFonctionnels}
        criteresTechniques={criteresTechniques}
      />
    </>
  )
}
