/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { getAdminUsers, getRoles, getUserGroups } from '@/services/administrationService'
import UsersManager from './components/UsersManager'

export const metadata: Metadata = { title: 'Administration - Utilisateurs' }

export default async function UsersAdministrationPage() {
  const [users, roles, groups] = await Promise.all([getAdminUsers(), getRoles(), getUserGroups()])

  return (
    <>
      <PageTitle title="Utilisateurs" subTitle="Administration" />
      <UsersManager usersInit={users} roles={roles} groups={groups} />
    </>
  )
}
