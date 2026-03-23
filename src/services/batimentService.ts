/* Konrad Ahodan : konrad.ahodan@approbations.ca */
/**
 * Service layer — Bâtiments & Évaluations
 *
 * Utilise les données mock tant que NEXT_PUBLIC_API_URL n'est pas défini.
 * Pour connecter le backend Laravel, renseigner la variable dans .env.local :
 *   NEXT_PUBLIC_API_URL=http://localhost:8000
 *
 * Endpoints Laravel attendus :
 *   GET/POST   /api/criteres/fonctionnel
 *   PUT/DELETE /api/criteres/fonctionnel/{id}
 *   GET/POST   /api/criteres/technique
 *   PUT/DELETE /api/criteres/technique/{id}
 *   GET/POST   /api/champs-fiche
 *   PUT/DELETE /api/champs-fiche/{id}
 *   GET/POST   /api/batiments
 *   GET        /api/batiments/{id}
 *   POST       /api/evaluations/fonctionnelle
 *   POST       /api/evaluations/technique
 *   GET        /api/evaluations/{batimentId}
 */

import {
  AleaClimatiqueType,
  BatimentType,
  CampagneType,
  CartoAleaType,
  ChampFicheType,
  CritereEtatBatimentType,
  CritereEvalPonderationType,
  CritereEvaluationType,
  DepartementClimatiqueType,
  ElementCritereEvaluation,
  EvaluationFonctionnelleType,
  EvaluationTechniqueType,
  EvaluationType,
  PartieOuvrageType,
  PonderationAleaType,
  RecensementType,
  SectionFicheType,
  TypeBatimentType,
  ZoneClimatiqueInput,
  ZoneClimatiqueType,
} from '@/types/entretien-batiment'
import {
  aleasClimatiquesData,
  batimentsData,
  campagnesData,
  cartoAleaData,
  criteresEtatBatimentData,
  criteresEtatFonctionnel,
  criteresEtatTechnique,
  criteresEvalPonderationData,
  evaluationsFonctionnellesData,
  evaluationsTechniquesData,
  evaluationsData,
  partiesOuvrageData,
  ponderationsAleaData,
  recensementsData,
  sectionsFicheData,
  typesBatimentData,
  zonesClimatiquesData,
} from '@/assets/data/parametrage'
import { getToken } from './authService'

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  // Client : localStorage  |  Serveur : session NextAuth
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
    // Erreur réseau (serveur inaccessible, DNS, timeout…)
    throw new Error(`Service indisponible — impossible de joindre ${path}`)
  }
  if (!res.ok) throw new Error(`API error ${res.status}: ${path}`)
  return res.json() as Promise<T>
}

/**
 * Tente un appel API et retourne le fallback en cas d'échec (ex: build SSR sans token).
 */
async function tryApi<T>(fn: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await fn()
  } catch {
    return fallback
  }
}

// ─── Helpers internes ────────────────────────────────────────────────────────

function findSection(arr: CritereEvaluationType[], id: string): { sec: CritereEvaluationType; idx: number } {
  const idx = arr.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Section critère ${id} introuvable`)
  return { sec: arr[idx], idx }
}

// ─── Critères — État Fonctionnel — Sections ───────────────────────────────────

export async function getCriteresEtatFonctionnel(): Promise<CritereEvaluationType[]> {
  if (API_BASE) return tryApi(() => apiFetch<CritereEvaluationType[]>('/api/criteres/fonctionnel'), criteresEtatFonctionnel)
  return criteresEtatFonctionnel
}

export async function createCritere(data: Omit<CritereEvaluationType, 'id'>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>('/api/criteres/fonctionnel', { method: 'POST', body: JSON.stringify(data) })
  const s: CritereEvaluationType = { ...data, id: `scf-${Date.now()}` }
  criteresEtatFonctionnel.push(s)
  return s
}

export async function updateCritere(id: string, data: Partial<CritereEvaluationType>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>(`/api/criteres/fonctionnel/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const { idx } = findSection(criteresEtatFonctionnel, id)
  criteresEtatFonctionnel[idx] = { ...criteresEtatFonctionnel[idx], ...data }
  return criteresEtatFonctionnel[idx]
}

export async function deleteCritere(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/criteres/fonctionnel/${id}`, { method: 'DELETE' }); return }
  const idx = criteresEtatFonctionnel.findIndex((c) => c.id === id)
  if (idx !== -1) criteresEtatFonctionnel.splice(idx, 1)
}

// Éléments — Fonctionnel
export async function addElementFonctionnel(sectionId: string, data: Omit<ElementCritereEvaluation, 'id'>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>(`/api/criteres/fonctionnel/${sectionId}/elements`, { method: 'POST', body: JSON.stringify(data) })
  const { sec, idx } = findSection(criteresEtatFonctionnel, sectionId)
  const el: ElementCritereEvaluation = { ...data, id: `elf-${Date.now()}` }
  criteresEtatFonctionnel[idx] = { ...sec, elements: [...sec.elements, el] }
  return criteresEtatFonctionnel[idx]
}

export async function updateElementFonctionnel(sectionId: string, elementId: string, data: Partial<ElementCritereEvaluation>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>(`/api/criteres/fonctionnel/${sectionId}/elements/${elementId}`, { method: 'PUT', body: JSON.stringify(data) })
  const { sec, idx } = findSection(criteresEtatFonctionnel, sectionId)
  criteresEtatFonctionnel[idx] = { ...sec, elements: sec.elements.map((e) => e.id === elementId ? { ...e, ...data } : e) }
  return criteresEtatFonctionnel[idx]
}

export async function deleteElementFonctionnel(sectionId: string, elementId: string): Promise<CritereEvaluationType> {
  if (API_BASE) { await apiFetch(`/api/criteres/fonctionnel/${sectionId}/elements/${elementId}`, { method: 'DELETE' }) }
  const { sec, idx } = findSection(criteresEtatFonctionnel, sectionId)
  criteresEtatFonctionnel[idx] = { ...sec, elements: sec.elements.filter((e) => e.id !== elementId) }
  return criteresEtatFonctionnel[idx]
}

// ─── Critères — État Technique — Sections ─────────────────────────────────────

export async function getCriteresEtatTechnique(): Promise<CritereEvaluationType[]> {
  if (API_BASE) return tryApi(() => apiFetch<CritereEvaluationType[]>('/api/criteres/technique'), criteresEtatTechnique)
  return criteresEtatTechnique
}

export async function createCriteresTechnique(data: Omit<CritereEvaluationType, 'id'>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>('/api/criteres/technique', { method: 'POST', body: JSON.stringify(data) })
  const s: CritereEvaluationType = { ...data, id: `sct-${Date.now()}` }
  criteresEtatTechnique.push(s)
  return s
}

export async function updateCritereTechnique(id: string, data: Partial<CritereEvaluationType>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>(`/api/criteres/technique/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const { idx } = findSection(criteresEtatTechnique, id)
  criteresEtatTechnique[idx] = { ...criteresEtatTechnique[idx], ...data }
  return criteresEtatTechnique[idx]
}

export async function deleteCritereTechnique(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/criteres/technique/${id}`, { method: 'DELETE' }); return }
  const idx = criteresEtatTechnique.findIndex((c) => c.id === id)
  if (idx !== -1) criteresEtatTechnique.splice(idx, 1)
}

// Éléments — Technique
export async function addElementTechnique(sectionId: string, data: Omit<ElementCritereEvaluation, 'id'>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>(`/api/criteres/technique/${sectionId}/elements`, { method: 'POST', body: JSON.stringify(data) })
  const { sec, idx } = findSection(criteresEtatTechnique, sectionId)
  const el: ElementCritereEvaluation = { ...data, id: `elt-${Date.now()}` }
  criteresEtatTechnique[idx] = { ...sec, elements: [...sec.elements, el] }
  return criteresEtatTechnique[idx]
}

export async function updateElementTechnique(sectionId: string, elementId: string, data: Partial<ElementCritereEvaluation>): Promise<CritereEvaluationType> {
  if (API_BASE) return apiFetch<CritereEvaluationType>(`/api/criteres/technique/${sectionId}/elements/${elementId}`, { method: 'PUT', body: JSON.stringify(data) })
  const { sec, idx } = findSection(criteresEtatTechnique, sectionId)
  criteresEtatTechnique[idx] = { ...sec, elements: sec.elements.map((e) => e.id === elementId ? { ...e, ...data } : e) }
  return criteresEtatTechnique[idx]
}

export async function deleteElementTechnique(sectionId: string, elementId: string): Promise<CritereEvaluationType> {
  if (API_BASE) { await apiFetch(`/api/criteres/technique/${sectionId}/elements/${elementId}`, { method: 'DELETE' }) }
  const { sec, idx } = findSection(criteresEtatTechnique, sectionId)
  criteresEtatTechnique[idx] = { ...sec, elements: sec.elements.filter((e) => e.id !== elementId) }
  return criteresEtatTechnique[idx]
}

// ─── Bâtiments ────────────────────────────────────────────────────────────────

export async function getBatiments(): Promise<BatimentType[]> {
  if (API_BASE) return tryApi(() => apiFetch<BatimentType[]>('/api/batiments'), batimentsData)
  return batimentsData
}

export async function getBatiment(id: string): Promise<BatimentType | undefined> {
  if (API_BASE) return tryApi(() => apiFetch<BatimentType>(`/api/batiments/${id}`), batimentsData.find((b) => b.id === id))
  return batimentsData.find((b) => b.id === id)
}

export async function createBatiment(data: Omit<BatimentType, 'id'>): Promise<BatimentType> {
  if (API_BASE) {
    return apiFetch<BatimentType>('/api/batiments', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  const year    = new Date().getFullYear()
  const seq     = String(batimentsData.length + 1).padStart(4, '0')
  const newBatiment: BatimentType = {
    ...data,
    id:   `bat-${Date.now()}`,
    code: `BAT-${year}-${seq}`,
  }
  batimentsData.push(newBatiment)
  return newBatiment
}

export async function updateBatiment(
  id: string,
  data: Partial<BatimentType>
): Promise<BatimentType> {
  if (API_BASE) {
    return apiFetch<BatimentType>(`/api/batiments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
  const idx = batimentsData.findIndex((b) => b.id === id)
  if (idx === -1) throw new Error(`Bâtiment ${id} introuvable`)
  batimentsData[idx] = { ...batimentsData[idx], ...data }
  return batimentsData[idx]
}

export async function deleteBatiment(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/batiments/${id}`, { method: 'DELETE' }); return }
  const idx = batimentsData.findIndex((b) => b.id === id)
  if (idx !== -1) batimentsData.splice(idx, 1)
}

// ─── Évaluations ─────────────────────────────────────────────────────────────

export async function getEvaluationsFonctionnelles(
  batimentId?: string
): Promise<EvaluationFonctionnelleType[]> {
  const mockData = evaluationsFonctionnellesData.map((e) => ({
    ...e,
    batiment: batimentsData.find((b) => b.id === e.batimentId),
  }))
  const fallback = batimentId ? mockData.filter((e) => e.batimentId === batimentId) : mockData
  if (API_BASE) {
    const path = batimentId
      ? `/api/evaluations/fonctionnelle?batimentId=${batimentId}`
      : '/api/evaluations/fonctionnelle'
    return tryApi(() => apiFetch<EvaluationFonctionnelleType[]>(path), fallback)
  }
  return fallback
}

export async function saveEvaluationFonctionnelle(
  data: Omit<EvaluationFonctionnelleType, 'id'>
): Promise<EvaluationFonctionnelleType> {
  if (API_BASE) {
    return apiFetch<EvaluationFonctionnelleType>('/api/evaluations/fonctionnelle', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  const newEval: EvaluationFonctionnelleType = { ...data, id: `ef-${Date.now()}` }
  evaluationsFonctionnellesData.push(newEval)
  return newEval
}

export async function getEvaluationsTechniques(
  batimentId?: string
): Promise<EvaluationTechniqueType[]> {
  const mockData = evaluationsTechniquesData.map((e) => ({
    ...e,
    batiment: batimentsData.find((b) => b.id === e.batimentId),
  }))
  const fallback = batimentId ? mockData.filter((e) => e.batimentId === batimentId) : mockData
  if (API_BASE) {
    const path = batimentId
      ? `/api/evaluations/technique?batimentId=${batimentId}`
      : '/api/evaluations/technique'
    return tryApi(() => apiFetch<EvaluationTechniqueType[]>(path), fallback)
  }
  return fallback
}

export async function saveEvaluationTechnique(
  data: Omit<EvaluationTechniqueType, 'id'>
): Promise<EvaluationTechniqueType> {
  if (API_BASE) {
    return apiFetch<EvaluationTechniqueType>('/api/evaluations/technique', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  const newEval: EvaluationTechniqueType = { ...data, id: `et-${Date.now()}` }
  evaluationsTechniquesData.push(newEval)
  return newEval
}

// ─── Recensements ─────────────────────────────────────────────────────────────

/**
 * Génère un code au format RC-BAT-AAAA-MM-JJ-XX.
 * XX = nombre de recensements déjà enregistrés ce jour (toutes batiments confondus),
 * formaté sur 2 chiffres. Réinitialisé à 00 à chaque nouvelle date.
 */
function generateRecensementCode(date: string): string {
  const count = recensementsData.filter((r) => r.date === date).length
  return `RC-BAT-${date}-${String(count).padStart(2, '0')}`
}

export async function getRecensements(batimentId?: string): Promise<RecensementType[]> {
  const mockData = recensementsData.map((r) => ({
    ...r,
    batiment: batimentsData.find((b) => b.id === r.batimentId),
  }))
  const fallback = batimentId ? mockData.filter((r) => r.batimentId === batimentId) : mockData
  if (API_BASE) {
    const path = batimentId ? `/api/recensements?batimentId=${batimentId}` : '/api/recensements'
    return tryApi(() => apiFetch<RecensementType[]>(path), fallback)
  }
  return fallback
}

export async function getRecensement(id: string): Promise<RecensementType | undefined> {
  const r = recensementsData.find((r) => r.id === id)
  const fallback = r ? { ...r, batiment: batimentsData.find((b) => b.id === r.batimentId) } : undefined
  if (API_BASE) return tryApi(() => apiFetch<RecensementType>(`/api/recensements/${id}`), fallback)
  return fallback
}

export async function saveRecensement(
  data: Omit<RecensementType, 'id' | 'code' | 'statut' | 'batiment'>
): Promise<RecensementType> {
  if (API_BASE) return apiFetch<RecensementType>('/api/recensements', { method: 'POST', body: JSON.stringify(data) })
  // Un bâtiment ne peut être recensé qu'une seule fois par jour
  const doublon = recensementsData.find(
    (r) => r.batimentId === data.batimentId && r.date === data.date
  )
  if (doublon) {
    throw new Error(`Ce bâtiment a déjà été recensé le ${data.date} (${doublon.code}).`)
  }
  const code = generateRecensementCode(data.date)
  const newRec: RecensementType = { ...data, id: `rec-${Date.now()}`, code, statut: 'brouillon' }
  recensementsData.push(newRec)
  return newRec
}

export async function updateRecensement(
  id: string,
  data: Pick<RecensementType, 'criteresFonctionnels' | 'criteresTechniques'>
): Promise<RecensementType> {
  if (API_BASE) return apiFetch<RecensementType>(`/api/recensements/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = recensementsData.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error(`Recensement ${id} introuvable`)
  recensementsData[idx] = { ...recensementsData[idx], ...data }
  return recensementsData[idx]
}

export async function validerRecensement(id: string): Promise<RecensementType> {
  if (API_BASE) return apiFetch<RecensementType>(`/api/recensements/${id}/valider`, { method: 'POST' })
  const idx = recensementsData.findIndex((r) => r.id === id)
  if (idx === -1) throw new Error(`Recensement ${id} introuvable`)
  recensementsData[idx] = { ...recensementsData[idx], statut: 'validé' }
  return recensementsData[idx]
}

export async function deleteRecensement(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/recensements/${id}`, { method: 'DELETE' }); return }
  const idx = recensementsData.findIndex((r) => r.id === id)
  if (idx !== -1) recensementsData.splice(idx, 1)
}

// ─── Évaluations complètes ────────────────────────────────────────────────────

/**
 * Génère un code au format EV-BAT-AAAA-MM-JJ-XX.
 * XX = nombre d'évaluations déjà enregistrées ce jour (tous bâtiments confondus),
 * formaté sur 2 chiffres. Réinitialisé à 00 à chaque nouvelle date.
 */
function generateEvaluationCode(date: string): string {
  const count = evaluationsData.filter((e) => e.date === date).length
  return `EV-BAT-${date}-${String(count).padStart(2, '0')}`
}

export async function getEvaluation(id: string): Promise<EvaluationType> {
  if (API_BASE) return tryApi(() => apiFetch<EvaluationType>(`/api/evaluations/${id}`), evaluationsData.find((e) => e.id === id) ?? evaluationsData[0])
  const ev = evaluationsData.find((e) => e.id === id)
  if (!ev) throw new Error(`Évaluation ${id} introuvable`)
  return ev
}

export async function getEvaluations(batimentId?: string): Promise<EvaluationType[]> {
  const mockData = evaluationsData.map((e) => ({
    ...e,
    batiment: batimentsData.find((b) => b.id === e.batimentId),
    recencement: e.recencementId ? recensementsData.find((r) => r.id === e.recencementId) : undefined,
  }))
  const fallback = batimentId ? mockData.filter((e) => e.batimentId === batimentId) : mockData
  if (API_BASE) {
    const path = batimentId ? `/api/evaluations?batimentId=${batimentId}` : '/api/evaluations'
    return tryApi(() => apiFetch<EvaluationType[]>(path), fallback)
  }
  return fallback
}

export async function saveEvaluation(
  data: Omit<EvaluationType, 'id' | 'code' | 'statut' | 'batiment'>
): Promise<EvaluationType> {
  if (API_BASE) return apiFetch<EvaluationType>('/api/evaluations', { method: 'POST', body: JSON.stringify(data) })
  const code = generateEvaluationCode(data.date)
  const newEval: EvaluationType = { ...data, id: `eval-${Date.now()}`, code, statut: 'brouillon' }
  evaluationsData.push(newEval)
  return newEval
}

export async function updateEvaluation(
  id: string,
  data: Omit<Partial<EvaluationType>, 'id' | 'batiment' | 'statut'>
): Promise<EvaluationType> {
  if (API_BASE) return apiFetch<EvaluationType>(`/api/evaluations/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = evaluationsData.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error(`Évaluation ${id} introuvable`)
  evaluationsData[idx] = { ...evaluationsData[idx], ...data }
  return evaluationsData[idx]
}

export async function validerEvaluation(id: string): Promise<EvaluationType> {
  if (API_BASE) return apiFetch<EvaluationType>(`/api/evaluations/${id}/valider`, { method: 'POST' })
  const idx = evaluationsData.findIndex((e) => e.id === id)
  if (idx === -1) throw new Error(`Évaluation ${id} introuvable`)
  evaluationsData[idx] = {
    ...evaluationsData[idx],
    statut: 'validé',
    validateur: 'demo_user',
    dateValidation: new Date().toISOString().split('T')[0],
  }
  return evaluationsData[idx]
}

export async function deleteEvaluation(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/evaluations/${id}`, { method: 'DELETE' }); return }
  const idx = evaluationsData.findIndex((e) => e.id === id)
  if (idx !== -1) evaluationsData.splice(idx, 1)
}

// ─── Campagnes d'évaluation ───────────────────────────────────────────────────

function generateCampagneCode(year: number): string {
  const count = campagnesData.filter((c) => new Date(c.createdAt).getFullYear() === year).length
  return `CA-${year}-${String(count).padStart(2, '0')}`
}

export async function getCampagnes(): Promise<CampagneType[]> {
  if (!API_BASE) return campagnesData
  try { return await apiFetch<CampagneType[]>('/api/campagnes') } catch { return campagnesData }
}

export async function saveCampagne(
  data: { nom: string; anneeRef: number; dateDebut: string; dateFin: string; batimentIds: string[] }
): Promise<{ campagne: CampagneType; evaluations: EvaluationType[] }> {
  if (API_BASE) {
    const campagne = await apiFetch<CampagneType>('/api/campagnes', { method: 'POST', body: JSON.stringify(data) })
    return { campagne, evaluations: [] }
  }
  const today = new Date().toISOString().split('T')[0]
  const campagneId = `camp-${Date.now()}`
  const newEvaluations: EvaluationType[] = []
  for (const batimentId of data.batimentIds) {
    const code = generateEvaluationCode(today)
    const newEval: EvaluationType = {
      id: `eval-camp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code,
      batimentId,
      campagneId,
      date: today,
      statut: 'brouillon',
      anneeRef: data.anneeRef,
    }
    evaluationsData.push(newEval)
    newEvaluations.push(newEval)
  }
  const campagne: CampagneType = {
    id: campagneId,
    code: generateCampagneCode(data.anneeRef),
    nom: data.nom,
    anneeRef: data.anneeRef,
    statut: 'brouillon',
    dateDebut: data.dateDebut,
    dateFin: data.dateFin,
    batimentIds: data.batimentIds,
    evaluationIds: newEvaluations.map((e) => e.id),
    createdAt: today,
  }
  campagnesData.push(campagne)
  return { campagne, evaluations: newEvaluations }
}

export async function updateCampagne(
  id: string,
  data: Partial<Pick<CampagneType, 'nom' | 'anneeRef' | 'statut' | 'dateDebut' | 'dateFin' | 'batimentIds'>>
): Promise<{ campagne: CampagneType; newEvaluations: EvaluationType[] }> {
  if (API_BASE) {
    return apiFetch<{ campagne: CampagneType; newEvaluations: EvaluationType[] }>(
      `/api/campagnes/${id}`, { method: 'PUT', body: JSON.stringify(data) }
    )
  }
  const idx = campagnesData.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Campagne ${id} introuvable`)
  const current = campagnesData[idx]

  const newBatimentIds = data.batimentIds ?? current.batimentIds
  const addedIds   = data.batimentIds ? newBatimentIds.filter((bId) => !current.batimentIds.includes(bId)) : []
  const removedIds = data.batimentIds ? current.batimentIds.filter((bId) => !newBatimentIds.includes(bId)) : []

  const today = new Date().toISOString().split('T')[0]
  const newEvaluations: EvaluationType[] = []

  for (const batimentId of addedIds) {
    const code = generateEvaluationCode(today)
    const newEval: EvaluationType = {
      id: `eval-camp-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      code,
      batimentId,
      campagneId: id,
      date: today,
      statut: 'brouillon',
      anneeRef: current.anneeRef,
    }
    evaluationsData.push(newEval)
    newEvaluations.push(newEval)
  }

  const newEvalIds = [...current.evaluationIds]
  for (const batimentId of removedIds) {
    const evalIdx = evaluationsData.findIndex((e) => e.batimentId === batimentId && e.campagneId === id)
    if (evalIdx !== -1) {
      const removedId = evaluationsData[evalIdx].id
      evaluationsData[evalIdx] = { ...evaluationsData[evalIdx], campagneId: undefined }
      const pos = newEvalIds.indexOf(removedId)
      if (pos !== -1) newEvalIds.splice(pos, 1)
    }
  }
  for (const ev of newEvaluations) newEvalIds.push(ev.id)

  campagnesData[idx] = {
    ...current,
    ...(data.nom       !== undefined ? { nom:       data.nom }       : {}),
    ...(data.statut    !== undefined ? { statut:    data.statut }    : {}),
    ...(data.dateDebut !== undefined ? { dateDebut: data.dateDebut } : {}),
    ...(data.dateFin   !== undefined ? { dateFin:   data.dateFin }   : {}),
    batimentIds:   newBatimentIds,
    evaluationIds: newEvalIds,
  }
  return { campagne: campagnesData[idx], newEvaluations }
}

export async function deleteCampagne(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/campagnes/${id}`, { method: 'DELETE' }); return }
  const idx = campagnesData.findIndex((c) => c.id === id)
  if (idx !== -1) campagnesData.splice(idx, 1)
}

// ─── Sections Fiche d'Identification ─────────────────────────────────────────

export async function getSectionsFiche(): Promise<SectionFicheType[]> {
  if (API_BASE) return tryApi(() => apiFetch<SectionFicheType[]>('/api/sections-fiche'), sectionsFicheData)
  return sectionsFicheData
}

export async function createSectionFiche(
  data: Omit<SectionFicheType, 'id' | 'champs'>
): Promise<SectionFicheType> {
  if (API_BASE) return apiFetch<SectionFicheType>('/api/sections-fiche', { method: 'POST', body: JSON.stringify(data) })
  const newSection: SectionFicheType = { ...data, id: `sec-${Date.now()}`, champs: [] }
  sectionsFicheData.push(newSection)
  return newSection
}

// ─── Champs Fiche d'Identification ───────────────────────────────────────────

export async function getChampsFiche(): Promise<ChampFicheType[]> {
  if (API_BASE) return tryApi(() => apiFetch<ChampFicheType[]>('/api/champs-fiche'), sectionsFicheData.flatMap((s) => s.champs))
  return sectionsFicheData.flatMap((s) => s.champs)
}

export async function createChampFiche(
  data: Omit<ChampFicheType, 'id'>
): Promise<ChampFicheType> {
  if (API_BASE) {
    return apiFetch<ChampFicheType>('/api/champs-fiche', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }
  const sec = sectionsFicheData.find((s) => s.id === data.sectionId)
  if (!sec) throw new Error(`Section ${data.sectionId} introuvable`)
  const newChamp: ChampFicheType = { ...data, id: `ch-${Date.now()}` }
  sec.champs.push(newChamp)
  return { ...newChamp, section: sec }
}

export async function updateChampFiche(
  id: string,
  data: Partial<ChampFicheType>
): Promise<ChampFicheType> {
  if (API_BASE) {
    return apiFetch<ChampFicheType>(`/api/champs-fiche/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }
  for (const sec of sectionsFicheData) {
    const idx = sec.champs.findIndex((c) => c.id === id)
    if (idx >= 0) {
      sec.champs[idx] = { ...sec.champs[idx], ...data }
      return { ...sec.champs[idx], section: sec }
    }
  }
  throw new Error(`Champ ${id} introuvable`)
}

export async function deleteChampFiche(id: string): Promise<void> {
  if (API_BASE) {
    await apiFetch(`/api/champs-fiche/${id}`, { method: 'DELETE' })
    return
  }
  for (const sec of sectionsFicheData) {
    const idx = sec.champs.findIndex((c) => c.id === id)
    if (idx >= 0) { sec.champs.splice(idx, 1); return }
  }
}

// ─── Zones Climatiques ────────────────────────────────────────────────────────

export async function getZonesClimatiques(): Promise<ZoneClimatiqueType[]> {
  if (API_BASE) return tryApi(() => apiFetch<ZoneClimatiqueType[]>('/api/zones-climatiques'), zonesClimatiquesData)
  return zonesClimatiquesData
}

export async function createZoneClimatique(data: ZoneClimatiqueInput): Promise<ZoneClimatiqueType> {
  if (API_BASE) return apiFetch<ZoneClimatiqueType>('/api/zones-climatiques', { method: 'POST', body: JSON.stringify(data) })
  const zoneId = `zc-${Date.now()}`
  const depts: DepartementClimatiqueType[] = data.departements.map((nom, i) => ({
    id: `dept-${Date.now()}-${i}`, zoneId, nom, ordre: i + 1,
  }))
  const z: ZoneClimatiqueType = { id: zoneId, nom: data.nom, ordre: data.ordre, departements: depts }
  zonesClimatiquesData.push(z)
  return z
}

export async function updateZoneClimatique(id: string, data: ZoneClimatiqueInput): Promise<ZoneClimatiqueType> {
  if (API_BASE) return apiFetch<ZoneClimatiqueType>(`/api/zones-climatiques/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = zonesClimatiquesData.findIndex((z) => z.id === id)
  if (idx === -1) throw new Error(`Zone ${id} introuvable`)
  const depts: DepartementClimatiqueType[] = data.departements.map((nom, i) => ({
    id: `dept-${Date.now()}-${i}`, zoneId: id, nom, ordre: i + 1,
  }))
  zonesClimatiquesData[idx] = { ...zonesClimatiquesData[idx], nom: data.nom, ordre: data.ordre, departements: depts }
  return zonesClimatiquesData[idx]
}

export async function deleteZoneClimatique(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/zones-climatiques/${id}`, { method: 'DELETE' }); return }
  const idx = zonesClimatiquesData.findIndex((z) => z.id === id)
  if (idx !== -1) zonesClimatiquesData.splice(idx, 1)
}

// ─── Aléas Climatiques ────────────────────────────────────────────────────────

export async function getAleasClimatiques(): Promise<AleaClimatiqueType[]> {
  if (API_BASE) return tryApi(() => apiFetch<AleaClimatiqueType[]>('/api/aleas-climatiques'), aleasClimatiquesData)
  return aleasClimatiquesData
}

export async function createAleaClimatique(data: Omit<AleaClimatiqueType, 'id'>): Promise<AleaClimatiqueType> {
  if (API_BASE) return apiFetch<AleaClimatiqueType>('/api/aleas-climatiques', { method: 'POST', body: JSON.stringify(data) })
  const a: AleaClimatiqueType = { ...data, id: `al-${Date.now()}` }
  aleasClimatiquesData.push(a)
  return a
}

export async function updateAleaClimatique(id: string, data: Partial<AleaClimatiqueType>): Promise<AleaClimatiqueType> {
  if (API_BASE) return apiFetch<AleaClimatiqueType>(`/api/aleas-climatiques/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = aleasClimatiquesData.findIndex((a) => a.id === id)
  if (idx === -1) throw new Error(`Aléa ${id} introuvable`)
  aleasClimatiquesData[idx] = { ...aleasClimatiquesData[idx], ...data }
  return aleasClimatiquesData[idx]
}

export async function deleteAleaClimatique(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/aleas-climatiques/${id}`, { method: 'DELETE' }); return }
  const idx = aleasClimatiquesData.findIndex((a) => a.id === id)
  if (idx !== -1) aleasClimatiquesData.splice(idx, 1)
}

// ─── Cartographie des Aléas ───────────────────────────────────────────────────

export async function getCartoAlea(): Promise<CartoAleaType[]> {
  if (API_BASE) return tryApi(() => apiFetch<CartoAleaType[]>('/api/carto-alea'), cartoAleaData)
  return cartoAleaData
}

export async function saveCartoAlea(data: CartoAleaType[]): Promise<void> {
  if (API_BASE) { await apiFetch('/api/carto-alea', { method: 'PUT', body: JSON.stringify(data) }); return }
  cartoAleaData.splice(0, cartoAleaData.length, ...data)
}

// ─── Parties d'ouvrage ────────────────────────────────────────────────────────

export async function getPartiesOuvrage(): Promise<PartieOuvrageType[]> {
  if (API_BASE) return tryApi(() => apiFetch<PartieOuvrageType[]>('/api/parties-ouvrage'), partiesOuvrageData)
  return partiesOuvrageData
}

export async function createPartieOuvrage(data: Omit<PartieOuvrageType, 'id'>): Promise<PartieOuvrageType> {
  if (API_BASE) return apiFetch<PartieOuvrageType>('/api/parties-ouvrage', { method: 'POST', body: JSON.stringify(data) })
  const p: PartieOuvrageType = { ...data, id: `po-${Date.now()}` }
  partiesOuvrageData.push(p)
  return p
}

export async function updatePartieOuvrage(id: string, data: Partial<PartieOuvrageType>): Promise<PartieOuvrageType> {
  if (API_BASE) return apiFetch<PartieOuvrageType>(`/api/parties-ouvrage/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = partiesOuvrageData.findIndex((p) => p.id === id)
  if (idx === -1) throw new Error(`Partie ${id} introuvable`)
  partiesOuvrageData[idx] = { ...partiesOuvrageData[idx], ...data }
  return partiesOuvrageData[idx]
}

export async function deletePartieOuvrage(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/parties-ouvrage/${id}`, { method: 'DELETE' }); return }
  const idx = partiesOuvrageData.findIndex((p) => p.id === id)
  if (idx !== -1) partiesOuvrageData.splice(idx, 1)
}

// ─── Pondérations Aléas ───────────────────────────────────────────────────────

export async function getPonderationsAlea(): Promise<PonderationAleaType[]> {
  if (API_BASE) return tryApi(() => apiFetch<PonderationAleaType[]>('/api/ponderation-alea'), ponderationsAleaData)
  return ponderationsAleaData
}

export async function savePonderationsAlea(data: PonderationAleaType[]): Promise<void> {
  if (API_BASE) { await apiFetch('/api/ponderation-alea', { method: 'PUT', body: JSON.stringify(data) }); return }
  ponderationsAleaData.splice(0, ponderationsAleaData.length, ...data)
}

// ─── Critères d'évaluation des pondérations ───────────────────────────────────

export async function getCriteresEvalPonderation(): Promise<CritereEvalPonderationType[]> {
  if (API_BASE) return tryApi(() => apiFetch<CritereEvalPonderationType[]>('/api/criteres-eval-ponderation'), criteresEvalPonderationData)
  return criteresEvalPonderationData
}

export async function createCritereEvalPonderation(data: Omit<CritereEvalPonderationType, 'id'>): Promise<CritereEvalPonderationType> {
  if (API_BASE) return apiFetch<CritereEvalPonderationType>('/api/criteres-eval-ponderation', { method: 'POST', body: JSON.stringify(data) })
  const c: CritereEvalPonderationType = { ...data, id: `cep-${Date.now()}` }
  criteresEvalPonderationData.push(c)
  return c
}

export async function updateCritereEvalPonderation(id: string, data: Partial<CritereEvalPonderationType>): Promise<CritereEvalPonderationType> {
  if (API_BASE) return apiFetch<CritereEvalPonderationType>(`/api/criteres-eval-ponderation/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = criteresEvalPonderationData.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Critère ${id} introuvable`)
  criteresEvalPonderationData[idx] = { ...criteresEvalPonderationData[idx], ...data }
  return criteresEvalPonderationData[idx]
}

export async function deleteCritereEvalPonderation(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/criteres-eval-ponderation/${id}`, { method: 'DELETE' }); return }
  const idx = criteresEvalPonderationData.findIndex((c) => c.id === id)
  if (idx !== -1) criteresEvalPonderationData.splice(idx, 1)
}

// ─── Types de bâtiment ────────────────────────────────────────────────────────

export async function getTypesBatiment(): Promise<TypeBatimentType[]> {
  if (API_BASE) return tryApi(() => apiFetch<TypeBatimentType[]>('/api/types-batiment'), typesBatimentData)
  return typesBatimentData
}

export async function createTypeBatiment(data: Omit<TypeBatimentType, 'id'>): Promise<TypeBatimentType> {
  if (API_BASE) return apiFetch<TypeBatimentType>('/api/types-batiment', { method: 'POST', body: JSON.stringify(data) })
  const t: TypeBatimentType = { ...data, id: `tb-${Date.now()}` }
  typesBatimentData.push(t)
  return t
}

export async function updateTypeBatiment(id: string, data: Partial<TypeBatimentType>): Promise<TypeBatimentType> {
  if (API_BASE) return apiFetch<TypeBatimentType>(`/api/types-batiment/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = typesBatimentData.findIndex((t) => t.id === id)
  if (idx === -1) throw new Error(`Type bâtiment ${id} introuvable`)
  typesBatimentData[idx] = { ...typesBatimentData[idx], ...data }
  return typesBatimentData[idx]
}

export async function deleteTypeBatiment(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/types-batiment/${id}`, { method: 'DELETE' }); return }
  const idx = typesBatimentData.findIndex((t) => t.id === id)
  if (idx !== -1) typesBatimentData.splice(idx, 1)
}

// ─── Critères d'état de bâtiment ─────────────────────────────────────────────

export async function getCriteresEtatBatiment(): Promise<CritereEtatBatimentType[]> {
  if (API_BASE) return tryApi(() => apiFetch<CritereEtatBatimentType[]>('/api/criteres-etat-batiment'), criteresEtatBatimentData)
  return criteresEtatBatimentData
}

export async function createCritereEtatBatiment(data: Omit<CritereEtatBatimentType, 'id'>): Promise<CritereEtatBatimentType> {
  if (API_BASE) return apiFetch<CritereEtatBatimentType>('/api/criteres-etat-batiment', { method: 'POST', body: JSON.stringify(data) })
  const c: CritereEtatBatimentType = { ...data, id: `ceb-${Date.now()}` }
  criteresEtatBatimentData.push(c)
  return c
}

export async function updateCritereEtatBatiment(id: string, data: Partial<CritereEtatBatimentType>): Promise<CritereEtatBatimentType> {
  if (API_BASE) return apiFetch<CritereEtatBatimentType>(`/api/criteres-etat-batiment/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  const idx = criteresEtatBatimentData.findIndex((c) => c.id === id)
  if (idx === -1) throw new Error(`Critère ${id} introuvable`)
  criteresEtatBatimentData[idx] = { ...criteresEtatBatimentData[idx], ...data }
  return criteresEtatBatimentData[idx]
}

export async function deleteCritereEtatBatiment(id: string): Promise<void> {
  if (API_BASE) { await apiFetch(`/api/criteres-etat-batiment/${id}`, { method: 'DELETE' }); return }
  const idx = criteresEtatBatimentData.findIndex((c) => c.id === id)
  if (idx !== -1) criteresEtatBatimentData.splice(idx, 1)
}
