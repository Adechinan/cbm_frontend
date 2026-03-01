/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { getToken } from './authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export type CurrentUserProfile = {
  nom: string
  email: string
  telephone?: string
  statut?: string
  createdAt?: string
  lastPasswordResetAt?: string
}

function resolveToken(apiToken?: string): string {
  return apiToken || getToken()
}

export async function getCurrentUserProfile(apiToken?: string): Promise<CurrentUserProfile | null> {
  if (!API_BASE) return null

  const token = resolveToken(apiToken)
  const res = await fetch(`${API_BASE}/api/me`, {
    headers: {
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  })

  if (!res.ok) throw new Error('Impossible de charger le profil utilisateur')

  const data = await res.json() as {
    name?: string
    email?: string
    phone?: string | null
    status?: string
    created_at?: string
    last_password_reset_at?: string | null
  }

  return {
    nom: data.name ?? '',
    email: data.email ?? '',
    telephone: data.phone ?? undefined,
    statut: data.status ?? 'Actif',
    createdAt: data.created_at ?? undefined,
    lastPasswordResetAt: data.last_password_reset_at ?? undefined,
  }
}

export async function changeMyPassword(
  payload: {
    currentPassword: string
    newPassword: string
    confirmPassword: string
  },
  apiToken?: string
): Promise<void> {
  if (!API_BASE) return

  const token = resolveToken(apiToken)
  const res = await fetch(`${API_BASE}/api/me/password`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({
      current_password: payload.currentPassword,
      new_password: payload.newPassword,
      new_password_confirmation: payload.confirmPassword,
    }),
  })

  if (!res.ok) {
    const data = await res.json().catch(() => ({}))
    const message = (data as { message?: string }).message ?? 'Impossible de modifier le mot de passe'
    throw new Error(message)
  }
}

