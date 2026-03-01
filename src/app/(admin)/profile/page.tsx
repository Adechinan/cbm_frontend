/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { Metadata } from 'next'
import PageTitle from '@/components/PageTitle'
import ProfileManager from './components/ProfileManager'

export const metadata: Metadata = {
  title: 'Mon profil',
}

export default function ProfilePage() {
  return (
    <>
      <PageTitle title="Mon profil" subTitle="Administration" />
      <ProfileManager />
    </>
  )
}

