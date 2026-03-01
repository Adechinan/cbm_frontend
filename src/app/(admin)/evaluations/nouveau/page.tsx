/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import {
  getAleasClimatiques, getBatiments, getCartoAlea, getCriteresEtatBatiment,
  getCriteresEtatFonctionnel, getCriteresEtatTechnique, getPartiesOuvrage,
  getPonderationsAlea, getRecensements, getTypesBatiment, getZonesClimatiques,
} from '@/services/batimentService'
import { Metadata } from 'next'
import EvaluationForm from './components/EvaluationForm'

export const metadata: Metadata = {
  title: 'Nouvelle évaluation',
}

export default async function NouvelleEvaluationPage() {
  const [
    batiments, recensements, criteresFonctionnels, criteresTechniques, typesBatiment,
    criteresEtatBatiment, zonesClimatiques, aleasClimatiques, cartoAlea,
    partiesOuvrage, ponderationsAlea,
  ] = await Promise.all([
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
      <PageTitle title="Nouvelle évaluation" subTitle="Évaluation" />
      <EvaluationForm
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
