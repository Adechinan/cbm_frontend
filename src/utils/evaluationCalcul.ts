/* Konrad Ahodan : konrad.ahodan@approbations.ca */
/**
 * Calcul des notes d'évaluation d'un bâtiment.
 * Partagé entre EvaluationForm (saisie manuelle) et CampagneManager (évaluation automatique).
 */

import type {
  AleaClimatiqueType,
  BatimentType,
  CartoAleaType,
  CritereEtatBatimentType,
  CritereEvaluationType,
  EtatDisponible,
  NiveauRisque,
  PartieOuvrageType,
  PonderationAleaType,
  RecensementType,
  TypeBatimentType,
  ZoneClimatiqueType,
} from '@/types/entretien-batiment'

// ─── Types internes ───────────────────────────────────────────────────────────

export type EvalFoncEntry  = { critereId: string; elementId: string; etat: string; commentaire: string }
export type EvalTechEntry  = { critereId: string; elementId: string; nature: string; constat: string; etat: string }

export type ComputedEvaluation = {
  notePhysique: number
  noteFonctionnelle: number
  noteTechnique: number
  coefficientUsure: number
  coutGlobal: number
  criteresFonctionnels: EvalFoncEntry[]
  criteresTechniques: EvalTechEntry[]
  departementClimatique: string
  typeBatimentId: string
  anneeRef: number
  anneeConstruction: number | undefined
}

// ─── Formatage ────────────────────────────────────────────────────────────────

/**
 * Formate un nombre en FCFA avec un espace normal entre les milliers (plus lisible que l'espace fine fr-FR).
 * Ex: 1 234 567
 */
export function fmt(n: number): string {
  return n
    .toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    .replace(/\u202F/g, '\u00A0') // espace fine → espace insécable standard (plus large)
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NIVEAU_POND: Record<NiveauRisque, number> = { Faible: 0, Moyen: 50, Elevé: 100 }

export function getNoteAge(age: number): number {
  if (age < 0) return 0
  if (age < 10) return 3
  if (age <= 20) return 2
  return 1
}

function getNote(etats: EtatDisponible[], selected: string): number {
  return etats.find((e) => e.etat === selected)?.note ?? 0
}

function getDeptIdFromName(zonesClimatiques: ZoneClimatiqueType[], deptName: string): string | undefined {
  for (const zone of zonesClimatiques) {
    const found = zone.departements.find((d) => d.nom === deptName)
    if (found) return found.id
  }
  return undefined
}

// ─── Fonction principale ───────────────────────────────────────────────────────

export function computeEvaluation(params: {
  batiment: BatimentType
  anneeRef: number
  recensement: RecensementType | undefined
  typesBatiment: TypeBatimentType[]
  criteresFonctionnels: CritereEvaluationType[]
  criteresTechniques: CritereEvaluationType[]
  criteresEtatBatiment: CritereEtatBatimentType[]
  zonesClimatiques: ZoneClimatiqueType[]
  aleasClimatiques: AleaClimatiqueType[]
  cartoAlea: CartoAleaType[]
  ponderationsAlea: PonderationAleaType[]
  partiesOuvrage: PartieOuvrageType[]
}): ComputedEvaluation {
  const {
    batiment, anneeRef, recensement, typesBatiment,
    criteresFonctionnels, criteresTechniques, criteresEtatBatiment,
    zonesClimatiques, aleasClimatiques, cartoAlea, ponderationsAlea, partiesOuvrage,
  } = params

  const typeBat = typesBatiment[0]
  const typeBatimentId = typeBat?.id ?? ''

  // ── Note physique (âge) ──────────────────────────────────────────────────
  const noteConst = getNoteAge(anneeRef - batiment.anneeConstruction)
  const pondConst = typeBat?.ponderationAnneeConstruction ?? 0
  const pondRehab = typeBat?.ponderationAnneeRehabilitation ?? 0
  // Pas d'anneeRehab dans le contexte campagne (vient du recensement, on ignore)
  const scoreAge = noteConst * (pondConst / 100) + 0 * (pondRehab / 100)

  // ── Département climatique depuis l'id stocké dans le bâtiment ───────────
  let selectedDept = ''
  if (batiment.departementClimatique) {
    for (const z of zonesClimatiques) {
      const d = z.departements.find((dep) => String(dep.id) === String(batiment.departementClimatique))
      if (d) { selectedDept = d.nom; break }
    }
  }

  // ── Critères fonctionnels depuis le recensement ──────────────────────────
  const evalsFonc: Record<string, EvalFoncEntry> = {}
  for (const sec of criteresFonctionnels) {
    for (const el of sec.elements.filter((e) => e.actif)) {
      const existing = recensement?.criteresFonctionnels.find((c) => c.elementId === el.id)
      evalsFonc[el.id] = {
        critereId: sec.id,
        elementId: el.id,
        etat: existing?.etat ?? 'Non évalué',
        commentaire: existing?.commentaire ?? '',
      }
    }
  }

  // ── Critères techniques depuis le recensement ────────────────────────────
  const evalsTech: Record<string, EvalTechEntry> = {}
  for (const sec of criteresTechniques) {
    for (const el of sec.elements.filter((e) => e.actif)) {
      const existing = recensement?.criteresTechniques.find((c) => c.elementId === el.id)
      evalsTech[el.id] = {
        critereId: sec.id,
        elementId: el.id,
        nature: existing?.nature ?? '',
        constat: existing?.constat ?? '',
        etat: existing?.etat ?? 'Non évalué',
      }
    }
  }

  // ── Score fonctionnel ────────────────────────────────────────────────────
  const scoreFonc = criteresFonctionnels.reduce((gt, sec) => {
    const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
      const note = getNote(el.etatsDisponibles, evalsFonc[el.id]?.etat ?? 'Non évalué')
      return s + note * (el.ponderation / 100)
    }, 0)
    return gt + totalNP * (sec.ponderation / 100)
  }, 0)

  // ── Score technique ──────────────────────────────────────────────────────
  const scoreTech = criteresTechniques.reduce((gt, sec) => {
    const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
      const note = getNote(el.etatsDisponibles, evalsTech[el.id]?.etat ?? 'Non évalué')
      return s + note * (el.ponderation / 100)
    }, 0)
    return gt + totalNP * (sec.ponderation / 100)
  }, 0)

  // ── Coefficient d'usure ──────────────────────────────────────────────────
  const getScoreForCritere = (nom: string): number => {
    const n = nom.toLowerCase()
    if (n.includes('age') || n.includes('âge') || n.includes('physique')) return scoreAge
    if (n.includes('technique')) return scoreTech
    if (n.includes('fonctionnel')) return scoreFonc
    return 0
  }
  const cuRows = [...criteresEtatBatiment]
    .sort((a, b) => a.ordre - b.ordre)
    .map((c) => ({ pondéré: getScoreForCritere(c.nom) * (c.ponderation / 100) }))
  const icb = cuRows.reduce((s, r) => s + r.pondéré, 0) / 3
  const cu = (1 - icb) * 100

  // ── Coût global ──────────────────────────────────────────────────────────
  const aleasActifs = aleasClimatiques.filter((a) => a.actif).sort((a, b) => a.ordre - b.ordre)

  const getNiveau = (deptName: string, aleaId: string): NiveauRisque => {
    const deptId = getDeptIdFromName(zonesClimatiques, deptName)
    if (!deptId) return 'Faible'
    return cartoAlea.find((c) => c.departementClimatiqueId === deptId && c.aleaId === aleaId)?.niveau.etat ?? 'Faible'
  }

  const getCoefClimatique = (partieId: string): number => {
    if (!selectedDept || aleasActifs.length === 0) return 0
    const vals = aleasActifs.map((a) => {
      const pondZone = NIVEAU_POND[getNiveau(selectedDept, a.id)]
      const valeur = ponderationsAlea.find((p) => p.partieOuvrageId === partieId && p.aleaId === a.id)?.note ?? 0
      return valeur * (pondZone / 100)
    })
    return vals.reduce((s, v) => s + v, 0) / aleasActifs.length
  }

  const superficie = batiment.surfaceTotale ?? 0
  const coutGlobal = [...partiesOuvrage].sort((a, b) => a.ordre - b.ordre).reduce((total, p) => {
    const coefClim = getCoefClimatique(p.id)
    const coutEstimatif = superficie * p.prixUnitaire * (1 + cu / 100)
    const surcout = coutEstimatif * (coefClim / 100)
    return total + coutEstimatif + surcout
  }, 0)

  return {
    notePhysique: scoreAge,
    noteFonctionnelle: scoreFonc,
    noteTechnique: scoreTech,
    coefficientUsure: cu,
    coutGlobal,
    criteresFonctionnels: Object.values(evalsFonc),
    criteresTechniques: Object.values(evalsTech),
    departementClimatique: selectedDept,
    typeBatimentId,
    anneeRef,
    anneeConstruction: batiment.anneeConstruction,
  }
}
