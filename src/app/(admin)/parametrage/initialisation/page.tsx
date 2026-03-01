/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import InitialisationManager from './components/InitialisationManager'

export const metadata: Metadata = {
  title: 'Initialisation des données',
}

export default function InitialisationPage() {
  return (
    <>
      <PageTitle
        title="Initialisation des données"
        subTitle="Paramétrage"
      />
      <InitialisationManager />
    </>
  )
}
