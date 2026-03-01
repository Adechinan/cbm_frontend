/* Konrad Ahodan : konrad.ahodan@approbations.ca */
export type IdType = string

export type UserStatus = 'Actif' | 'Inactif'

export type PrivilegeRules = {
  canConsult: boolean
  canCreate: boolean
  canValidate: boolean
  canAccessSettings: boolean
  canEditSettings: boolean
  canAccessAll: boolean
}

export type PrivilegeType = {
  id: IdType
  code: string
  nom: string
  description: string
  rules: PrivilegeRules
  system: boolean
}

export type RoleType = {
  id: IdType
  nom: string
  description: string
  privilegeIds: IdType[]
  actif: boolean
  system: boolean
}

export type UserGroupType = {
  id: IdType
  nom: string
  description: string
  roleIds: IdType[]
  actif: boolean
}

export type AdminUserType = {
  id: IdType
  nom: string
  email: string
  telephone?: string
  statut: UserStatus
  roleIds: IdType[]
  groupId?: IdType
  mustResetPassword: boolean
  lastPasswordResetAt?: string
  createdAt: string
}
