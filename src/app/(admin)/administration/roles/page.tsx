/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { Metadata } from 'next'
import { getPrivileges, getRoles, getUserGroups } from '@/services/administrationService'
import RolesAdminManager from './components/RolesAdminManager'

export const metadata: Metadata = { title: 'Administration - Rôles' }

export default async function RolesAdministrationPage() {
  const [privileges, roles, groups] = await Promise.all([getPrivileges(), getRoles(), getUserGroups()])

  return (
    <>
      <PageTitle title="Rôles et privilèges" subTitle="Administration" />
      <RolesAdminManager privilegesInit={privileges} rolesInit={roles} groupsInit={groups} />
    </>
  )
}
