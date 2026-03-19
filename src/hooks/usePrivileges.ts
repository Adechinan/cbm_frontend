/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { useSession } from 'next-auth/react'
import { useMemo } from 'react'

/**
 * Règles de privilèges disponibles dans l'application.
 *
 * canConsult       → consultation des données (batiments, evaluations, campagnes…)
 * canCreate        → création / modification / suppression des données métier
 * canValidate      → validation d'une évaluation ou d'un recensement
 * canAccessSettings → accès en lecture aux pages de paramétrage et d'administration
 * canEditSettings  → modification des paramètres (critères, sections, rôles…)
 * canAccessAll     → super-administrateur (bypasse toutes les vérifications)
 */
export type Privileges = {
  canConsult:        boolean
  canCreate:         boolean
  canValidate:       boolean
  canAccessSettings: boolean
  canEditSettings:   boolean
  canAccessAll:      boolean
}

/** Privilèges par défaut : lecture seule, aucune écriture. */
const DEFAULTS: Privileges = {
  canConsult:        true,
  canCreate:         false,
  canValidate:       false,
  canAccessSettings: false,
  canEditSettings:   false,
  canAccessAll:      false,
}

/**
 * Retourne les privilèges de l'utilisateur connecté, lus depuis la session NextAuth.
 * En mode mock (sans API), tous les droits sont accordés (canAccessAll: true).
 */
export function usePrivileges(): Privileges {
  const { data: session } = useSession()

  return useMemo(() => {
    const p = (session as { privileges?: Record<string, boolean> } | null)?.privileges
    if (!p || Object.keys(p).length === 0) return DEFAULTS
    // canAccessAll active tous les autres droits
    if (p.canAccessAll) {
      return { canConsult: true, canCreate: true, canValidate: true, canAccessSettings: true, canEditSettings: true, canAccessAll: true }
    }
    return { ...DEFAULTS, ...p }
  }, [session])
}
