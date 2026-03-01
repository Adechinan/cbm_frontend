/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { AdminUserType, PrivilegeType, RoleType, UserGroupType } from '@/types/administration'

export const privilegesData: PrivilegeType[] = [
  {
    id: 'priv-lecteur',
    code: 'LECTEUR',
    nom: 'Lecteur',
    description: 'Peut consulter et créer, mais ne peut pas valider.',
    system: true,
    rules: {
      canConsult: true,
      canCreate: true,
      canValidate: false,
      canAccessSettings: false,
      canEditSettings: false,
      canAccessAll: false,
    },
  },
  {
    id: 'priv-validation',
    code: 'VALIDATION',
    nom: 'Validation',
    description: 'Autorise la validation des recensements et évaluations.',
    system: true,
    rules: {
      canConsult: true,
      canCreate: true,
      canValidate: true,
      canAccessSettings: false,
      canEditSettings: false,
      canAccessAll: false,
    },
  },
  {
    id: 'priv-super-admin',
    code: 'SUPER_ADMIN',
    nom: 'Super Admin',
    description: "Accès complet à l'application, y compris les paramètres.",
    system: true,
    rules: {
      canConsult: true,
      canCreate: true,
      canValidate: true,
      canAccessSettings: true,
      canEditSettings: true,
      canAccessAll: true,
    },
  },
  {
    id: 'priv-consult-admin',
    code: 'CONSULT_ADMIN',
    nom: 'Consult Admin',
    description: 'Peut consulter les paramètres sans les modifier.',
    system: true,
    rules: {
      canConsult: true,
      canCreate: false,
      canValidate: false,
      canAccessSettings: true,
      canEditSettings: false,
      canAccessAll: false,
    },
  },
]

export const rolesData: RoleType[] = [
  {
    id: 'role-admin',
    nom: 'Administrateur',
    description: 'Administration globale de la plateforme',
    privilegeIds: ['priv-super-admin', 'priv-validation'],
    actif: true,
    system: true,
  },
  {
    id: 'role-operateur',
    nom: 'Opérateur',
    description: 'Saisie et suivi des données terrain',
    privilegeIds: ['priv-lecteur'],
    actif: true,
    system: false,
  },
]

export const userGroupsData: UserGroupType[] = [
  {
    id: 'grp-admin-central',
    nom: 'Manager',
    description: 'Équipe centrale de pilotage et de l\'administration de la plateforme',
    roleIds: ['role-admin'],
    actif: true,
  },
  {
    id: 'grp-exploitation',
    nom: 'Exploitation',
    description: 'Équipe de recensement et de saisie',
    roleIds: ['role-operateur'],
    actif: true,
  },
]

export const adminUsersData: AdminUserType[] = [
  {
    id: 'usr-001',
    nom: 'Admin Entretien',
    email: 'admin@entretien.com',
    telephone: '+229 01 90 00 00 00',
    statut: 'Actif',
    roleIds: ['role-admin'],
    groupId: 'grp-admin-central',
    mustResetPassword: false,
    createdAt: '2025-01-10T08:00:00Z',
  },
  {
    id: 'usr-002',
    nom: 'Agent Recensement',
    email: 'agent@entretien.com',
    telephone: '+229 01 91 00 00 00',
    statut: 'Actif',
    roleIds: ['role-operateur'],
    groupId: 'grp-exploitation',
    mustResetPassword: true,
    lastPasswordResetAt: '2026-02-20T10:30:00Z',
    createdAt: '2025-03-15T09:20:00Z',
  },
]
