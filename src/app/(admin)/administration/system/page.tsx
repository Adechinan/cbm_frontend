/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Starter page' }

const StarterPage = () => {
  return (
    <PageTitle title='Système' subTitle="Administration" />
  )
}

export default StarterPage