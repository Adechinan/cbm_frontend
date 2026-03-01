/* Konrad Ahodan : konrad.ahodan@approbations.ca */
// ─── Paramétrage & Évaluation de Bâtiment ───────────────────────────────────

export type IdType = string


export type TypeChamp = 'Texte' | 'Textearea' | 'Nombre' | 'Select' | 'Radio' | 'Date' | 'Checkbox' | 'GPS'

export type ChampFicheType = {
  id: IdType
  sectionId: SectionFicheType['id']
  section?: SectionFicheType
  libelle: string
  type: TypeChamp
  obligatoire: boolean
  actif: boolean
  ordre: number
  options?: string[]   // valeurs possibles pour les types Select et Radio
  fieldKey: string     // clé stable → champ BatimentType ou entrée dans extra
}

export type SectionFicheType = {
  id: IdType
  libelle: string
  obligatoire: boolean
  actif: boolean
  ordre: number
  champs: ChampFicheType[]
}

export type TypeCritere = 'fonctionnel' | 'technique'

export type EtatDisponible = {
  etat: string
  note: number
}

export type ElementCritereEvaluation = {
  id: IdType
  libelle: string
  ponderation: number    // % de la section (0-100)
  description?: string
  ordre: number
  etatsDisponibles: EtatDisponible[]
  actif: boolean
}

export type CritereEvaluationType = {
  id: IdType
  type: TypeCritere
  section: string
  ponderation: number    // % de l'évaluation totale (0-100)
  elements: ElementCritereEvaluation[]
}

export type BatimentType = {
  id: IdType
  code: string
  sections: SectionFicheType[]
  codeBatiment: string
  denomination: string
  organisme: string
  modeAcquisition: string
  anneeConstruction: number
  anneesRestructuration?: number[]
  coutConstruction?: number
  statutConstruction: string
  departement: string
  commune: string
  arrondissement?: string
  adresse: string
  latitude?: number
  longitude?: number
  typeConstruction: 'villa_rdc' | 'batiment_etage' | 'autre'
  niveauxSousSol: number
  nombreEtages: number
  usages: string[]
  typeMateriau: string[]
  typeToiture: string[]
  energies: string[]
  surfaceTotale: number
  surfaceSallesHumides: number
  nombrePieces: number
  acteAffectation?: {
    nature: string
    dateEffet: string
    duree: string
    reference: string
    commentaire?: string
  }
  extra?: Record<string, string | string[]>   // champs dynamiques hors structure de base
}

export type RecensementStatut = 'brouillon' | 'validé'

export type RecensementType = {
  id: IdType
  code: string                    // RC-BAT-AAAA-MM-JJ-XX
  batimentId: BatimentType['id']
  batiment?: BatimentType
  date: string
  evaluateur?: string
  statut: RecensementStatut
  criteresFonctionnels: {
    critereId: CritereEvaluationType['id']
    elementId: ElementCritereEvaluation['id']
    etat: string
    commentaire?: string
  }[]
  criteresTechniques: {
    critereId: CritereEvaluationType['id']
    elementId: ElementCritereEvaluation['id']
    nature: string
    constat: string
    etat: string
  }[]
}

export type EvaluationFonctionnelleType = {
  id: IdType
  batimentId: BatimentType['id']
  batiment?: BatimentType
  date: string
  evaluateur?: string
  criteres: {
    critereId: CritereEvaluationType['id']       // id de la section
    critere?: CritereEvaluationType
    elementId: ElementCritereEvaluation['id']    // id de l'élément
    etat: string
    commentaire?: string
  }[]
}

export type EvaluationTechniqueType = {
  id: IdType
  batimentId: BatimentType['id']
  batiment?: BatimentType
  date: string
  evaluateur?: string
  criteres: {
    critereId: CritereEvaluationType['id']       // id de la section
    elementId: ElementCritereEvaluation['id']    // id de l'élément
    nature: string
    constat: string
    etat: string
  }[]
}

// ─── Cartographie des Aléas Climatiques ─────────────────────────────────────

export type NiveauRisque = 'Faible' | 'Moyen' | 'Elevé'
export type NiveauRisqueDisponible = {
  etat: NiveauRisque // ex : "Exposition faible"
  note: number // 0, 50, 100
}

export type DepartementClimatiqueType = {
  id: IdType
  zoneId: string
  nom: string
  ordre: number
}

export type ZoneClimatiqueType = {
  id: IdType
  nom: string
  departements: DepartementClimatiqueType[]
  ordre: number
}

/** Payload de création / mise à jour d'une zone (l'API gère les enregistrements DepartementClimatique) */
export type ZoneClimatiqueInput = {
  nom: string
  ordre: number
  departements: string[]  // noms des départements
}

export type AleaClimatiqueType = {
  id: IdType
  nom: string
  ordre: number
  actif: boolean
}

/** Une cellule de la cartographie : département × aléa → niveau de risque */
export type CartoAleaType = {
  departementClimatiqueId: DepartementClimatiqueType['id']
  aleaId: AleaClimatiqueType['id']
  niveau: NiveauRisqueDisponible
}


// ─── Types de bâtiment ───────────────────────────────────────────────────────

export type TypeBatimentType = {
  id: IdType
  nom: string
  actif: boolean
  ordre: number
  ponderationAnneeRef:            number  // Pondération Année de référence (%)
  ponderationAnneeConstruction:   number  // Pondération Année de construction (%)
  ponderationAnneeRehabilitation: number  // Pondération Année de réhabilitation (%)
}

export type CritereEtatBatimentType = {
  id: IdType
  nom: string
  ponderation: number // % (0–100)
  ordre: number
}

// ─── Pondération des Aléas Climatiques ───────────────────────────────────────

export type PartieOuvrageType = {
  id: IdType
  nom: string
  superficie: number        // m² de référence
  prixUnitaireRef: string   // fourchette ex : "150-400"
  prixUnitaire: number      // prix unitaire retenu (FCFA/m²)
  ordre: number
}

/** Une cellule de la matrice : partie d'ouvrage × aléa — scores + pondération calculée */
export type PonderationAleaType = {
  partieOuvrageId:           PartieOuvrageType['id']
  aleaId:                    AleaClimatiqueType['id']
  exposition?:               number  // score 1-3 : probabilité d'exposition à l'aléa
  sensibilite?:              number  // score 1-3 : sensibilité du lot à l'aléa
  importanceFonctionnelle?:  number  // score 1-3 : importance pour la fonctionnalité du bâtiment
  note:                      number  // pondération calculée (%)
}

export type CritereEvalPonderationType = {
  id: IdType
  nom: string
  definition: string
  poids: number // valeur entre 0 et 1 (ex : 0.45)
  ordre: number
}

// ─── Évaluation complète de bâtiment ─────────────────────────────────────────

export type EvaluationStatut = 'brouillon' | 'validé'

export type EvaluationType = {
  id: IdType
  code: string                    // EV-BAT-AAAA-MM-JJ-XX
  batimentId: BatimentType['id']
  batiment?: BatimentType
  date: string
  evaluateur?: string
  validateur?: string
  dateValidation?: string
  statut: EvaluationStatut
  // Valeurs physiques (pour ré-ouvrir le formulaire en édition)
  typeBatimentId?: string
  anneeConstruction?: number
  anneeRef?: number
  anneeRehab?: string
  // Résultats calculés (stockés à la sauvegarde pour affichage dans la liste)
  notePhysique?: number
  noteFonctionnelle?: number
  noteTechnique?: number
  departementClimatique?: string
  coefficientUsure?: number  // CU en %
  coutGlobal?: number        // FCFA
  recencementId?: RecensementType['id']  // lien vers le recensement de référence (si existant)
  recencement?: RecensementType
  // criteresFonctionnels: {
  //   critereId: CritereEvaluationType['id']
  //   elementId: ElementCritereEvaluation['id']
  //   etat: string
  //   commentaire?: string
  // }[]
  // criteresTechniques: {
  //   critereId: CritereEvaluationType['id']
  //   elementId: ElementCritereEvaluation['id']
  //   nature: string
  //   constat: string
  //   etat: string
  // }[]
}