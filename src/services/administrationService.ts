/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { getToken } from './authService'
import { adminUsersData, privilegesData, rolesData, userGroupsData } from '@/assets/data/administration'
import { AdminUserType, PrivilegeType, RoleType, UserGroupType } from '@/types/administration'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  let token: string
  if (typeof window !== 'undefined') {
    token = getToken()
  } else {
    try {
      const { getServerSession } = await import('next-auth')
      const { options: authOptions } = await import('@/app/api/auth/[...nextauth]/options')
      const session = await getServerSession(authOptions)
      token = (session as { apiToken?: string } | null)?.apiToken ?? ''
    } catch {
      token = ''
    }
  }

  let res: Response
  try {
    res = await fetch(`${API_BASE}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      ...options,
    })
  } catch {
    throw new Error(`Service indisponible — impossible de joindre ${path}`)
  }

  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

function randomTempPassword(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789'
  let out = 'Tmp-'
  for (let i = 0; i < 10; i += 1) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

// Privileges
export async function getPrivileges(): Promise<PrivilegeType[]> {
  if (API_BASE) return apiFetch<PrivilegeType[]>('/api/admin/privileges')
  return privilegesData
}

export async function createPrivilege(data: Omit<PrivilegeType, 'id'>): Promise<PrivilegeType> {
  if (API_BASE) return apiFetch<PrivilegeType>('/api/admin/privileges', { method: 'POST', body: JSON.stringify(data) })
  const created: PrivilegeType = { ...data, id: `priv-${Date.now()}` }
  privilegesData.push(created)
  return created
}

export async function updatePrivilege(id: string, data: Partial<PrivilegeType>): Promise<PrivilegeType> {
  if (API_BASE) return apiFetch<PrivilegeType>(`/api/admin/privileges/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = privilegesData.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Privilège ${id} introuvable`)
  privilegesData[idx] = { ...privilegesData[idx], ...data }
  return privilegesData[idx]
}

export async function deletePrivilege(id: string): Promise<void> {
  if (API_BASE) {
    await apiFetch(`/api/admin/privileges/${id}`, { method: 'DELETE' })
    return
  }
  const idx = privilegesData.findIndex((p) => p.id === id)
  if (idx !== -1) privilegesData.splice(idx, 1)
  for (const role of rolesData) {
    role.privilegeIds = role.privilegeIds.filter((privId) => privId !== id)
  }
}

// Roles
export async function getRoles(): Promise<RoleType[]> {
  if (API_BASE) return apiFetch<RoleType[]>('/api/admin/roles')
  return rolesData
}

export async function createRole(data: Omit<RoleType, 'id'>): Promise<RoleType> {
  if (API_BASE) return apiFetch<RoleType>('/api/admin/roles', { method: 'POST', body: JSON.stringify(data) })
  const created: RoleType = { ...data, id: `role-${Date.now()}` }
  rolesData.push(created)
  return created
}

export async function updateRole(id: string, data: Partial<RoleType>): Promise<RoleType> {
  if (API_BASE) return apiFetch<RoleType>(`/api/admin/roles/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = rolesData.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error(`Rôle ${id} introuvable`)
  rolesData[idx] = { ...rolesData[idx], ...data }
  return rolesData[idx]
}

export async function deleteRole(id: string): Promise<void> {
  if (API_BASE) {
    await apiFetch(`/api/admin/roles/${id}`, { method: 'DELETE' })
    return
  }
  const idx = rolesData.findIndex((r) => r.id === id)
  if (idx !== -1) rolesData.splice(idx, 1)
  for (const user of adminUsersData) {
    user.roleIds = user.roleIds.filter((roleId) => roleId !== id)
  }
  for (const group of userGroupsData) {
    group.roleIds = group.roleIds.filter((roleId) => roleId !== id)
  }
}

// Groups
export async function getUserGroups(): Promise<UserGroupType[]> {
  if (API_BASE) return apiFetch<UserGroupType[]>('/api/admin/groups')
  return userGroupsData
}

export async function createUserGroup(data: Omit<UserGroupType, 'id'>): Promise<UserGroupType> {
  if (API_BASE) return apiFetch<UserGroupType>('/api/admin/groups', { method: 'POST', body: JSON.stringify(data) })
  const created: UserGroupType = { ...data, id: `grp-${Date.now()}` }
  userGroupsData.push(created)
  return created
}

export async function updateUserGroup(id: string, data: Partial<UserGroupType>): Promise<UserGroupType> {
  if (API_BASE) return apiFetch<UserGroupType>(`/api/admin/groups/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = userGroupsData.findIndex((g) => g.id === id)
  if (idx === -1) throw new Error(`Groupe ${id} introuvable`)
  userGroupsData[idx] = { ...userGroupsData[idx], ...data }
  return userGroupsData[idx]
}

export async function deleteUserGroup(id: string): Promise<void> {
  if (API_BASE) {
    await apiFetch(`/api/admin/groups/${id}`, { method: 'DELETE' })
    return
  }
  const idx = userGroupsData.findIndex((g) => g.id === id)
  if (idx !== -1) userGroupsData.splice(idx, 1)
  for (const user of adminUsersData) {
    if (user.groupId === id) user.groupId = undefined
  }
}

// Users
export async function getAdminUsers(): Promise<AdminUserType[]> {
  if (API_BASE) return apiFetch<AdminUserType[]>('/api/admin/users')
  return adminUsersData
}

export async function createAdminUser(data: Omit<AdminUserType, 'id' | 'createdAt'>): Promise<AdminUserType> {
  if (API_BASE) return apiFetch<AdminUserType>('/api/admin/users', { method: 'POST', body: JSON.stringify(data) })
  const created: AdminUserType = { ...data, id: `usr-${Date.now()}`, createdAt: new Date().toISOString() }
  adminUsersData.push(created)
  return created
}

export async function updateAdminUser(id: string, data: Partial<AdminUserType>): Promise<AdminUserType> {
  if (API_BASE) return apiFetch<AdminUserType>(`/api/admin/users/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = adminUsersData.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error(`Utilisateur ${id} introuvable`)
  adminUsersData[idx] = { ...adminUsersData[idx], ...data }
  return adminUsersData[idx]
}

export async function deleteAdminUser(id: string): Promise<void> {
  if (API_BASE) {
    await apiFetch(`/api/admin/users/${id}`, { method: 'DELETE' })
    return
  }
  const idx = adminUsersData.findIndex((u) => u.id === id)
  if (idx !== -1) adminUsersData.splice(idx, 1)
}

export async function resetUserPassword(id: string): Promise<{ temporaryPassword: string }> {
  if (API_BASE) {
    return apiFetch<{ temporaryPassword: string }>(`/api/admin/users/${id}/reset-password`, { method: 'POST' })
  }
  const idx = adminUsersData.findIndex((u) => u.id === id)
  if (idx === -1) throw new Error(`Utilisateur ${id} introuvable`)

  adminUsersData[idx] = {
    ...adminUsersData[idx],
    mustResetPassword: true,
    lastPasswordResetAt: new Date().toISOString(),
  }

  return { temporaryPassword: randomTempPassword() }
}
