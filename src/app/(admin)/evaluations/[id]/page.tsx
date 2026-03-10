/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { notFound } from 'next/navigation'
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import {
  getAleasClimatiques, getBatiments, getCartoAlea, getCriteresEtatBatiment,
  getCriteresEtatFonctionnel, getCriteresEtatTechnique, getEvaluation,
  getPartiesOuvrage, getPonderationsAlea, getRecensements, getTypesBatiment,
  getZonesClimatiques,
} from '@/services/batimentService'
import EvaluationForm from '../nouveau/components/EvaluationForm'

export const metadata: Metadata = {
  title: 'Détail de l\'évaluation',
}

export default async function EvaluationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let evaluation
  try {
    evaluation = await getEvaluation(id)
  } catch {
    notFound()
  }

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
      <PageTitle title="Détail de l'évaluation" subTitle="Évaluations" />
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
        initialData={evaluation}
        editId={evaluation.id}
      />
    </>
  )
}
