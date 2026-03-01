/* Konrad Ahodan : konrad.ahodan@approbations.ca */
const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

const COOKIE_NAME = 'api_token'
const COOKIE_MAX_AGE = 60 * 60 * 24 // 24 h

/** Récupère le token depuis localStorage (client uniquement). */
export function getToken(): string {
  return typeof window !== 'undefined' ? (localStorage.getItem(COOKIE_NAME) ?? '') : ''
}

/** Stocke le token dans localStorage + cookie (accessible aux Server Components). */
function persistToken(token: string): void {
  localStorage.setItem(COOKIE_NAME, token)
  document.cookie = `${COOKIE_NAME}=${token}; path=/; max-age=${COOKIE_MAX_AGE}; samesite=lax`
}

/** Supprime le token de localStorage et du cookie. */
function clearToken(): void {
  localStorage.removeItem(COOKIE_NAME)
  document.cookie = `${COOKIE_NAME}=; path=/; max-age=0`
}

/**
 * Authentifie l'utilisateur auprès de l'API Laravel Sanctum.
 * Stocke le token dans localStorage et dans un cookie (pour le SSR).
 */
export async function loginApi(email: string, password: string): Promise<string> {
  const res = await fetch(`${API_BASE}/api/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  if (!res.ok) {
    const err = await res.json().catch(() => ({}))
    throw new Error((err as { message?: string }).message ?? 'Identifiants incorrects')
  }
  const data = await res.json() as { token: string }
  persistToken(data.token)
  return data.token
}

/** Révoque le token côté Laravel et le supprime du stockage local. */
export async function logoutApi(): Promise<void> {
  const token = getToken()
  if (token) {
    await fetch(`${API_BASE}/api/logout`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, Accept: 'application/json' },
    }).catch(() => null) // silencieux si réseau indisponible
  }
  clearToken()
}
