/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import {
  getAleasClimatiques,
  getBatiments,
  getCartoAlea,
  getCriteresEtatBatiment,
  getCriteresEtatFonctionnel,
  getCriteresEtatTechnique,
  getEvaluations,
  getPartiesOuvrage,
  getPonderationsAlea,
  getRecensements,
  getTypesBatiment,
  getZonesClimatiques,
} from '@/services/batimentService'
import EvaluationList from './components/EvaluationList'

export const metadata: Metadata = {
  title: 'Évaluations',
}

export default async function EvaluationsPage() {
  const [
    evaluations,
    batiments,
    recensements,
    criteresFonctionnels,
    criteresTechniques,
    typesBatiment,
    criteresEtatBatiment,
    zonesClimatiques,
    aleasClimatiques,
    cartoAlea,
    partiesOuvrage,
    ponderationsAlea,
  ] = await Promise.all([
    getEvaluations(),
    getBatiments(),
    getRecensements(),
    getCriteresEtatFonctionnel(),
    getCriteresEtatTechnique(),
    getTypesBatiment(),
    getCriteresEtatBatiment(),
    getZonesClimatiques(),
    getAleasClimatiques(),
    getCartoAlea(),
    getPartiesOuvrage(),
    getPonderationsAlea(),
  ])

  evaluations.forEach((e) => {
    e.batiment = batiments.find((b) => b.id === e.batimentId)
  })

  console.log('EvaluationsPage data:', {
    evaluations,
    // batiments,
    // recensements,
    // criteresFonctionnels,
    // criteresTechniques,
    // typesBatiment,
    // criteresEtatBatiment,
    // zonesClimatiques,
    // aleasClimatiques,
    // cartoAlea,
    // partiesOuvrage,
    // ponderationsAlea,
  })

  return (
    <>
      <PageTitle title="Liste des évaluations" subTitle="Évaluation" />
      <EvaluationList
        evaluationsInit={evaluations}
        batiments={batiments}
        recensements={recensements}
        criteresFonctionnels={criteresFonctionnels}
        criteresTechniques={criteresTechniques}
        typesBatiment={typesBatiment}
        criteresEtatBatiment={criteresEtatBatiment}
        zonesClimatiques={zonesClimatiques}
        aleasClimatiques={aleasClimatiques}
        cartoAlea={cartoAlea}
        partiesOuvrage={partiesOuvrage}
        ponderationsAlea={ponderationsAlea}
      />
    </>
  )
}
