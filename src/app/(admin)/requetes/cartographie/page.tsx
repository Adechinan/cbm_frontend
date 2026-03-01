/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getBatiments, getZonesClimatiques } from '@/services/batimentService'
import { Metadata } from 'next'
import CartographieManager from './components/CartographieManager'

export const metadata: Metadata = { title: 'Requêtes — Cartographie des Bâtiments' }

export default async function CartographiePage() {
  const [batiments, zonesClimatiques] = await Promise.all([
    getBatiments(),
    getZonesClimatiques(),
  ])

  return (
    <>
      <PageTitle title="Requêtes" subTitle="Cartographie des Bâtiments" />
      <CartographieManager batiments={batiments} zonesClimatiques={zonesClimatiques} />
    </>
  )
}
