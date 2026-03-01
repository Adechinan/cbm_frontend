/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getBatiments, getCriteresEtatFonctionnel, getCriteresEtatTechnique, getRecensements } from '@/services/batimentService'
import { Metadata } from 'next'
import RecensementList from './components/RecensementList'

export const metadata: Metadata = {
  title: 'Recensements — Bâtiments',
}

export default async function RecensementsPage() {
  const [recensements, batiments, criteresFonctionnels, criteresTechniques] = await Promise.all([
    getRecensements(),
    getBatiments(),
    getCriteresEtatFonctionnel(),
    getCriteresEtatTechnique(),
  ])

  return (
    <>
      <PageTitle title="Liste des recensements" subTitle="Bâtiments" />
      <RecensementList
        recensementsInit={recensements}
        batiments={batiments}
        criteresFonctionnels={criteresFonctionnels}
        criteresTechniques={criteresTechniques}
      />
    </>
  )
}
