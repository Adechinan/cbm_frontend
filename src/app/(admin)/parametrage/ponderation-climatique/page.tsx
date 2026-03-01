/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import {
  getAleasClimatiques,
  getCriteresEvalPonderation,
  getPartiesOuvrage,
  getPonderationsAlea,
} from '@/services/batimentService'
import { Metadata } from 'next'
import PonderationManager from './components/PonderationManager'

export const metadata: Metadata = {
  title: 'Pondération Climatique — Paramétrage',
}

export default async function PonderationClimatiquePage() {
  const [parties, aleas, ponderation, criteres] = await Promise.all([
    getPartiesOuvrage(),
    getAleasClimatiques(),
    getPonderationsAlea(),
    getCriteresEvalPonderation(),
  ])

  return (
    <>
      <PageTitle title="Pondération climatique" subTitle="Paramétrage" />
      <PonderationManager
        partiesInit={parties}
        aleasInit={aleas}
        ponderInit={ponderation}
        criteresInit={criteres}
      />
    </>
  )
}
