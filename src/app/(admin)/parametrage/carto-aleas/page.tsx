/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getAleasClimatiques, getCartoAlea, getZonesClimatiques } from '@/services/batimentService'
import { Metadata } from 'next'
import CartoAleasManager from './components/CartoAleasManager'

export const metadata: Metadata = {
  title: 'Cartographie des Aléas Climatiques — Paramétrage',
}

export default async function CartoAleasPage() {
  const [zones, aleas, carto] = await Promise.all([
    getZonesClimatiques(),
    getAleasClimatiques(),
    getCartoAlea(),
  ])

  return (
    <>
      <PageTitle title="Cartographie des aléas climatiques" subTitle="Paramétrage" />
      <CartoAleasManager zonesInit={zones} aleasInit={aleas} cartoInit={carto} />
    </>
  )
}
