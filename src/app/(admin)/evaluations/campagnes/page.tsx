/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import {
  getAleasClimatiques,
  getBatiments,
  getCampagnes,
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
import CampagneManager from './components/CampagneManager'

export const metadata: Metadata = {
  title: 'Campagnes d\'évaluation',
}

export default async function CampagnesPage() {
  const [
    campagnes,
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
    getCampagnes(),
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

  return (
    <>
      <PageTitle title="Campagnes d'évaluation" subTitle="Évaluation" />
      <CampagneManager
        campagnesInit={campagnes}
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
