/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import { AleaClimatiqueType, BatimentType, CampagneType, CartoAleaType, ChampFicheType, CritereEtatBatimentType, CritereEvalPonderationType, CritereEvaluationType, DepartementClimatiqueType, EtatDisponible, EvaluationFonctionnelleType, EvaluationTechniqueType, EvaluationType, NiveauRisqueDisponible, PartieOuvrageType, PonderationAleaType, RecensementType, SectionFicheType, TypeBatimentType, ZoneClimatiqueType } from '@/types/entretien-batiment'

// ─── Types de bâtiment ───────────────────────────────────────────────────────

export const typesBatimentData: TypeBatimentType[] = [
  {
    id: 'tb-01', nom: 'Bâtiment Administratif', actif: true, ordre: 1,
    ponderationAnneeRef: 0, ponderationAnneeConstruction: 70, ponderationAnneeRehabilitation: 30,
  },
]

// ─── Critères d'état de bâtiment ─────────────────────────────────────────────

export const criteresEtatBatimentData: CritereEtatBatimentType[] = [
  { id: 'ceb-01', nom: 'Etat Physique',  ponderation: 30, ordre: 1 },
  { id: 'ceb-02', nom: 'Etat Technique',   ponderation: 45, ordre: 2 },
  { id: 'ceb-03', nom: 'Etat Fonctionnel', ponderation: 25, ordre: 3 },
]

// ─── Sections + Champs Fiche d'Identification ─────────────────────────────────

export const sectionsFicheData: SectionFicheType[] = [
  // ── Dénomination ──────────────────────────────────────────────────────────
  {
    id: 'sec-01', libelle: 'Dénomination', obligatoire: true, actif: true, ordre: 1,
    champs: [
      { id: 'ch-01', sectionId: 'sec-01', libelle: "Organisme d'appartenance",  type: 'Texte',  obligatoire: true,  actif: true, ordre: 1, fieldKey: 'organisme' },
      { id: 'ch-02', sectionId: 'sec-01', libelle: 'Dénomination du site',       type: 'Texte',  obligatoire: true,  actif: true, ordre: 2, fieldKey: 'denomination' },
      { id: 'ch-03', sectionId: 'sec-01', libelle: 'Code du bâtiment',           type: 'Texte',  obligatoire: true,  actif: true, ordre: 3, fieldKey: 'codeBatiment' },
      { id: 'ch-03b', sectionId: 'sec-01', libelle: 'Code Liaison',              type: 'Texte',  obligatoire: false, actif: true, ordre: 5, fieldKey: 'codeLiaison' },
      { id: 'ch-04', sectionId: 'sec-01', libelle: "Mode d'acquisition",         type: 'Select', obligatoire: false, actif: true, ordre: 4, fieldKey: 'modeAcquisition',
        options: ['État', 'Privé', 'Mixte'] },
    ],
  }, 
  // ── Données historiques ───────────────────────────────────────────────────
  {
    id: 'sec-02', libelle: 'Données historiques', obligatoire: false, actif: true, ordre: 2,
    champs: [
      { id: 'ch-05', sectionId: 'sec-02', libelle: 'Année de construction',      type: 'Nombre', obligatoire: true,  actif: true, ordre: 1, fieldKey: 'anneeConstruction' },
      { id: 'ch-06', sectionId: 'sec-02', libelle: 'Années de restructuration / rénovation / historique des travaux', type: 'Texte', obligatoire: false, actif: true, ordre: 2, fieldKey: 'anneesRestructuration' },
      { id: 'ch-07', sectionId: 'sec-02', libelle: 'Coût de construction (FCFA)',type: 'Nombre', obligatoire: false, actif: true, ordre: 3, fieldKey: 'coutConstruction' },
      { id: 'ch-08', sectionId: 'sec-02', libelle: 'Statut de la construction',  type: 'Select', obligatoire: false, actif: true, ordre: 4, fieldKey: 'statutConstruction',
        options: ['Ancien', 'Nouveau', 'En rénovation'] },
    ],
  },
  // ── Localisation ─────────────────────────────────────────────────────────
  {
    id: 'sec-03', libelle: 'Localisation', obligatoire: true, actif: true, ordre: 3,
    champs: [
      { id: 'ch-09', sectionId: 'sec-03', libelle: 'Département',    type: 'Select', obligatoire: true,  actif: true, ordre: 1, fieldKey: 'departement',
        options: ['Littoral', 'Atlantique', 'Ouémé', 'Plateau', 'Mono', 'Couffo', 'Collines', 'Zou', 'Donga', 'Borgou', 'Atacora', 'Alibori'] },
      { id: 'ch-10', sectionId: 'sec-03', libelle: 'Commune',         type: 'Texte',  obligatoire: true,  actif: true, ordre: 2, fieldKey: 'commune' },
      { id: 'ch-11', sectionId: 'sec-03', libelle: 'Arrondissement',  type: 'Texte',  obligatoire: false, actif: true, ordre: 3, fieldKey: 'arrondissement' },
      { id: 'ch-12', sectionId: 'sec-03', libelle: 'Adresse',         type: 'Texte',  obligatoire: false,  actif: true, ordre: 4, fieldKey: 'adresse' },
      { id: 'ch-13', sectionId: 'sec-03', libelle: 'Latitude (GPS)',      type: 'GPS',    obligatoire: false, actif: true, ordre: 5, fieldKey: 'latitude' },
      { id: 'ch-14', sectionId: 'sec-03', libelle: 'Longitude (GPS)',     type: 'GPS',    obligatoire: false, actif: true, ordre: 6, fieldKey: 'longitude' },
      { id: 'ch-14b', sectionId: 'sec-03', libelle: 'Zone climatique',    type: 'Select', obligatoire: true, actif: true, ordre: 7, fieldKey: 'departementClimatique' },
    ],
  },
  // ── Type de construction ──────────────────────────────────────────────────
  {
    id: 'sec-04', libelle: 'Type de construction', obligatoire: true, actif: true, ordre: 4,
    champs: [
      { id: 'ch-15', sectionId: 'sec-04', libelle: 'Type de construction',          type: 'Radio',  obligatoire: true,  actif: true, ordre: 1, fieldKey: 'typeConstruction',
        options: ['Villa simple (RDC)', 'Bâtiment à étage', 'Autre'] },
      { id: 'ch-16', sectionId: 'sec-04', libelle: 'Nombre de niveaux de sous-sol', type: 'Nombre', obligatoire: false, actif: true, ordre: 2, fieldKey: 'niveauxSousSol' },
      { id: 'ch-17', sectionId: 'sec-04', libelle: "Nombre d'étages",               type: 'Nombre', obligatoire: false, actif: true, ordre: 3, fieldKey: 'nombreEtages' },
    ],
  },
  // ── Usage ─────────────────────────────────────────────────────────────────
  {
    id: 'sec-05', libelle: 'Usage', obligatoire: false, actif: true, ordre: 5,
    champs: [
      { id: 'ch-18', sectionId: 'sec-05', libelle: 'Bureau',             type: 'Checkbox', obligatoire: false, actif: true, ordre: 1, fieldKey: 'usages' },
      { id: 'ch-19', sectionId: 'sec-05', libelle: 'Logement',           type: 'Checkbox', obligatoire: false, actif: true, ordre: 2, fieldKey: 'usages' },
      { id: 'ch-20', sectionId: 'sec-05', libelle: 'Magasin',            type: 'Checkbox', obligatoire: false, actif: true, ordre: 3, fieldKey: 'usages' },
      { id: 'ch-21', sectionId: 'sec-05', libelle: 'Technique',          type: 'Checkbox', obligatoire: false, actif: true, ordre: 4, fieldKey: 'usages' },
      { id: 'ch-22', sectionId: 'sec-05', libelle: 'Mixte (à préciser)', type: 'Texte',    obligatoire: false, actif: true, ordre: 5, fieldKey: 'usageMixteDetail' },
    ],
  },
  // ── Type de matériau ─────────────────────────────────────────────────────
  {
    id: 'sec-06', libelle: 'Type de matériau', obligatoire: false, actif: true, ordre: 6,
    champs: [
      { id: 'ch-23', sectionId: 'sec-06', libelle: 'Maçonnerie-béton',                         type: 'Radio', obligatoire: false, actif: true, ordre: 1, fieldKey: 'typeMateriauBeton',                options: ['Oui', 'Non'] },
      { id: 'ch-24', sectionId: 'sec-06', libelle: 'Maçonnerie-béton-structure métallique',    type: 'Radio', obligatoire: false, actif: true, ordre: 2, fieldKey: 'typeMateriauStructureMetallique',  options: ['Oui', 'Non'] },
      { id: 'ch-25', sectionId: 'sec-06', libelle: 'Maçonnerie-bois',                          type: 'Radio', obligatoire: false, actif: true, ordre: 3, fieldKey: 'typeMateriauBois',                 options: ['Oui', 'Non'] },
    ],
  },
  // ── Type de toiture ──────────────────────────────────────────────────────
  {
    id: 'sec-07', libelle: 'Type de toiture', obligatoire: false, actif: true, ordre: 7,
    champs: [
      { id: 'ch-31', sectionId: 'sec-07', libelle: 'Toiture dalle accessible',     type: 'Radio', obligatoire: false, actif: true, ordre: 1, fieldKey: 'typeToitureAccessible',    options: ['Oui', 'Non'] },
      { id: 'ch-32', sectionId: 'sec-07', libelle: 'Toiture dalle non accessible', type: 'Radio', obligatoire: false, actif: true, ordre: 2, fieldKey: 'typeToitureNonAccessible', options: ['Oui', 'Non'] },
      { id: 'ch-33', sectionId: 'sec-07', libelle: 'Toiture en tuile',             type: 'Radio', obligatoire: false, actif: true, ordre: 3, fieldKey: 'typeToitureTuile',         options: ['Oui', 'Non'] },
      { id: 'ch-34', sectionId: 'sec-07', libelle: 'Toiture en bac alu',           type: 'Radio', obligatoire: false, actif: true, ordre: 4, fieldKey: 'typeToitureBacAlu',        options: ['Oui', 'Non'] },
      { id: 'ch-35', sectionId: 'sec-07', libelle: 'Toiture en onduline',          type: 'Radio', obligatoire: false, actif: true, ordre: 5, fieldKey: 'typeToitureOnduline',      options: ['Oui', 'Non'] },
      { id: 'ch-36', sectionId: 'sec-07', libelle: 'Toiture en tôle galvanisée',   type: 'Radio', obligatoire: false, actif: true, ordre: 6, fieldKey: 'typeToitureToleGalvanisee',options: ['Oui', 'Non'] },
    ],
  },
  // ── Type d'énergies utilisées ─────────────────────────────────────────────
  {
    id: 'sec-08', libelle: "Type d'énergies utilisées", obligatoire: false, actif: true, ordre: 8,
    champs: [
      { id: 'ch-37', sectionId: 'sec-08', libelle: 'Électricité',            type: 'Checkbox', obligatoire: false, actif: true, ordre: 1, fieldKey: 'energies' },
      { id: 'ch-38', sectionId: 'sec-08', libelle: 'Gaz',                    type: 'Checkbox', obligatoire: false, actif: true, ordre: 2, fieldKey: 'energies' },
      { id: 'ch-39', sectionId: 'sec-08', libelle: 'Énergies renouvelables', type: 'Checkbox', obligatoire: false, actif: true, ordre: 3, fieldKey: 'energies' },
    ],
  },
  // ── Superficie ────────────────────────────────────────────────────────────
  {
    id: 'sec-09', libelle: 'Superficie', obligatoire: true, actif: true, ordre: 9,
    champs: [
      { id: 'ch-40', sectionId: 'sec-09', libelle: 'Surface totale (m²)',         type: 'Nombre', obligatoire: true,  actif: true, ordre: 1, fieldKey: 'surfaceTotale' },
      { id: 'ch-41', sectionId: 'sec-09', libelle: 'Surface salles humides (m²)', type: 'Nombre', obligatoire: false, actif: true, ordre: 2, fieldKey: 'surfaceSallesHumides' },
      { id: 'ch-42', sectionId: 'sec-09', libelle: 'Nombre de pièces',            type: 'Nombre', obligatoire: false, actif: true, ordre: 3, fieldKey: 'nombrePieces' },
    ],
  },
  // ── Acte d'affectation ────────────────────────────────────────────────────
  {
    id: 'sec-10', libelle: "Acte d'affectation ou de mise à disposition", obligatoire: false, actif: true, ordre: 10,
    champs: [
      { id: 'ch-26', sectionId: 'sec-10', libelle: 'Nature',        type: 'Texte',     obligatoire: false, actif: true, ordre: 1, fieldKey: 'acteNature' },
      { id: 'ch-27', sectionId: 'sec-10', libelle: "Date d'effet",  type: 'Date',      obligatoire: false, actif: true, ordre: 2, fieldKey: 'acteDateEffet' },
      { id: 'ch-28', sectionId: 'sec-10', libelle: 'Durée',         type: 'Texte',     obligatoire: false, actif: true, ordre: 3, fieldKey: 'acteDuree' },
      { id: 'ch-29', sectionId: 'sec-10', libelle: 'Référence',     type: 'Texte',     obligatoire: false, actif: true, ordre: 4, fieldKey: 'acteReference' },
      { id: 'ch-30', sectionId: 'sec-10', libelle: 'Commentaire',   type: 'Textearea', obligatoire: false, actif: true, ordre: 5, fieldKey: 'acteCommentaire' },
    ],
  },
  // ── Stationnement - Accès ─────────────────────────────────────────────────
  {
    id: 'sec-11', libelle: 'Stationnement - Accès', obligatoire: false, actif: true, ordre: 11,
    champs: [
      { id: 'ch-43', sectionId: 'sec-11', libelle: 'Nombre de places',             type: 'Texte',  obligatoire: false, actif: true, ordre: 1, fieldKey: 'nbPlaces' },
      { id: 'ch-44', sectionId: 'sec-11', libelle: 'Nombre de places PMR',         type: 'Nombre', obligatoire: false, actif: true, ordre: 2, fieldKey: 'nbPlacesPMR' },
      { id: 'ch-45', sectionId: 'sec-11', libelle: "Accès aux PMR (rampes, etc.)", type: 'Radio',  obligatoire: false, actif: true, ordre: 3, fieldKey: 'accesPMR', options: ['Oui', 'Non'] },
    ],
  },
  // ── Classement du bâtiment ────────────────────────────────────────────────
  {
    id: 'sec-12', libelle: 'Classement du bâtiment', obligatoire: false, actif: true, ordre: 12,
    champs: [
      { id: 'ch-46', sectionId: 'sec-12', libelle: 'ERP — Établissement Recevant du Public',        type: 'Radio',  obligatoire: false, actif: true, ordre: 1, fieldKey: 'erp',          options: ['Oui', 'Non'] },
      { id: 'ch-47', sectionId: 'sec-12', libelle: 'Catégorie ERP (1 à 5)',                         type: 'Nombre', obligatoire: false, actif: true, ordre: 2, fieldKey: 'categorieERP' },
      { id: 'ch-48', sectionId: 'sec-12', libelle: "Type d'ERP (J, R, L, M, N, O, U)",             type: 'Texte',  obligatoire: false, actif: true, ordre: 3, fieldKey: 'typeERP' },
      { id: 'ch-49', sectionId: 'sec-12', libelle: 'ERT — Établissement Recevant des Travailleurs', type: 'Radio',  obligatoire: false, actif: true, ordre: 4, fieldKey: 'ert',          options: ['Oui', 'Non'] },
      { id: 'ch-50', sectionId: 'sec-12', libelle: 'IGH — Immeuble Grande Hauteur',                type: 'Radio',  obligatoire: false, actif: true, ordre: 5, fieldKey: 'igh',          options: ['Oui', 'Non'] },
      { id: 'ch-51', sectionId: 'sec-12', libelle: 'Catégories de SSI (A, B, C, D, E)',            type: 'Texte',  obligatoire: false, actif: true, ordre: 6, fieldKey: 'categorieSSI' },
    ],
  },
  // ── Occupation ───────────────────────────────────────────────────────────
  {
    id: 'sec-13', libelle: 'Occupation', obligatoire: false, actif: true, ordre: 13,
    champs: [
      { id: 'ch-52', sectionId: 'sec-13', libelle: "Capacité d'accueil ERP", type: 'Nombre', obligatoire: false, actif: true, ordre: 1, fieldKey: 'capaciteAccueil' },
      { id: 'ch-53', sectionId: 'sec-13', libelle: 'Effectif en personnel',  type: 'Nombre', obligatoire: false, actif: true, ordre: 2, fieldKey: 'effectifPersonnel' },
    ],
  },
  // ── Exposition aux aléas climatiques ──────────────────────────────────────
  {
    id: 'sec-14', libelle: 'Exposition aux aléas', obligatoire: false, actif: true, ordre: 14,
    champs: [
      { id: 'ch-54', sectionId: 'sec-14', libelle: 'Pluies Torrentielles',    type: 'Radio', obligatoire: false, actif: true, ordre: 1, fieldKey: 'alea_pluies',     options: ['Oui', 'Non'] },
      { id: 'ch-55', sectionId: 'sec-14', libelle: 'Érosion Côtière',         type: 'Radio', obligatoire: false, actif: true, ordre: 2, fieldKey: 'alea_erosion',    options: ['Oui', 'Non'] },
      { id: 'ch-56', sectionId: 'sec-14', libelle: 'Tempête',                 type: 'Radio', obligatoire: false, actif: true, ordre: 3, fieldKey: 'alea_tempete',    options: ['Oui', 'Non'] },
      { id: 'ch-57', sectionId: 'sec-14', libelle: 'Température Extrême',     type: 'Radio', obligatoire: false, actif: true, ordre: 4, fieldKey: 'alea_temperature', options: ['Oui', 'Non'] },
      { id: 'ch-58', sectionId: 'sec-14', libelle: 'Inondations',             type: 'Radio', obligatoire: false, actif: true, ordre: 5, fieldKey: 'alea_inondations', options: ['Oui', 'Non'] },
      { id: 'ch-59', sectionId: 'sec-14', libelle: "Salinisation de l'eau",   type: 'Radio', obligatoire: false, actif: true, ordre: 6, fieldKey: 'alea_salinisation',options: ['Oui', 'Non'] },
      { id: 'ch-60', sectionId: 'sec-14', libelle: 'Sécheresse',              type: 'Radio', obligatoire: false, actif: true, ordre: 7, fieldKey: 'alea_secheresse',  options: ['Oui', 'Non'] },
      { id: 'ch-61', sectionId: 'sec-14', libelle: 'Glissement de terrain',   type: 'Radio', obligatoire: false, actif: true, ordre: 8, fieldKey: 'alea_glissement',  options: ['Oui', 'Non'] },
    ],
  },
  // ── Plans et autres ───────────────────────────────────────────────────────
  {
    id: 'sec-15', libelle: 'Plans et autres', obligatoire: false, actif: true, ordre: 15,
    champs: [
      { id: 'ch-62', sectionId: 'sec-15', libelle: "Disponibilité de plans, actes de propriété et documents techniques", type: 'Radio',     obligatoire: false, actif: true, ordre: 1, fieldKey: 'plansDisponibles', options: ['Oui', 'Non'] },
      { id: 'ch-63', sectionId: 'sec-15', libelle: 'Commentaire',                                                         type: 'Textearea', obligatoire: false, actif: true, ordre: 2, fieldKey: 'commentairePlans' },
    ],
  },
]

// Tableau plat dérivé (lecture seule — les mutations doivent passer par sectionsFicheData)
export const champsFicheData: ChampFicheType[] = sectionsFicheData.flatMap((s) => s.champs)

const ETATS_GENERAUX: EtatDisponible[] = [
  { etat: 'Bon',     note: 3 },
  { etat: 'Passable', note: 2 },
  { etat: 'Mauvais',  note: 1 },
]

// ─── Critères État Fonctionnel ────────────────────────────────────────────────

export const criteresEtatFonctionnel: CritereEvaluationType[] = [
  {
    id: 'scf-01', type: 'fonctionnel', section: 'Hygiène', ponderation: 20,
    elements: [
      { id: 'cf-01', libelle: 'Perception générale de la vétusté des matériaux (sols, plafonds, murs)', ponderation: 50, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-02', libelle: 'Perception générale de la vétusté des équipements',                        ponderation: 50, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'scf-02', type: 'fonctionnel', section: 'Sûreté des locaux', ponderation: 20,
    elements: [
      { id: 'cf-03', libelle: 'Environnement', ponderation: 34, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-04', libelle: 'Sûreté passive', ponderation: 33, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-05', libelle: 'Sûreté active',  ponderation: 33, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'scf-03', type: 'fonctionnel', section: 'Espaces publics', ponderation: 20,
    elements: [
      { id: 'cf-06', libelle: "Qualité des équipements de l'accueil",      ponderation: 25, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-07', libelle: 'Sanitaires (quantité et répartition)',       ponderation: 25, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-08', libelle: 'Sanitaires PMR',                             ponderation: 25, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-09', libelle: 'Accès aux personnes à mobilités réduites',   ponderation: 25, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'scf-04', type: 'fonctionnel', section: 'Regroupement fonctionnel des services', ponderation: 20,
    elements: [
      { id: 'cf-10', libelle: 'Distribution et circulation',       ponderation: 34, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-11', libelle: "Facilité d'accès pour les agents",  ponderation: 33, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-12', libelle: 'Adaptation au service rendu',       ponderation: 33, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'scf-05', type: 'fonctionnel', section: "Confort d'usage", ponderation: 20,
    elements: [
      { id: 'cf-13', libelle: 'Confort thermique',                       ponderation: 34, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-14', libelle: "Confort visuel — éclairage naturel",      ponderation: 33, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'cf-15', libelle: "Confort visuel — éclairage artificiel",   ponderation: 33, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
]

// ─── Critères État Technique ──────────────────────────────────────────────────

export const criteresEtatTechnique: CritereEvaluationType[] = [
  {
    id: 'sct-01', type: 'technique', section: 'Structure / Fondations', ponderation: 15,
    elements: [
      { id: 'ct-01', libelle: 'Fondations',                  description: "Soubassement et chaînages bas", ponderation: 25, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-02', libelle: 'Planchers',                   description: "Dalle plancher corps creux", ponderation: 25, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-03', libelle: 'Poteaux / poutres',           description: "Béton armé ou structure métallique", ponderation: 25, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-04', libelle: 'Mvts du bâtiment - fissures', description: "Murs", ponderation: 25, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-02', type: 'technique', section: 'Façade (peinture extérieure, bardage, revêtement)', ponderation: 5,
    elements: [
      { id: 'ct-05', libelle: 'Revêtement extérieur (peinture, Mur rideau, Bardage, etc.)', description: "Façade vitrée en aluminium", ponderation: 50, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-06', libelle: 'Peinture Intérieure (mur, plafond, menuiseries)',  description: "Murs, plafonds et portes", ponderation: 50, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-03', type: 'technique', section: 'Menuiseries extérieures', ponderation: 5,
    elements: [
      { id: 'ct-07', libelle: "Portes d'entrée en façade", description: "Métallique", ponderation: 34, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-08', libelle: 'Portes intérieures',         description: "Vitrées", ponderation: 33, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-09', libelle: 'Fenêtres',                   description: "Châssis aluminium", ponderation: 33, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-04', type: 'technique', section: 'Couverture / Étanchéité', ponderation: 10,
    elements: [
      { id: 'ct-10', libelle: 'Toiture',                                                description: "Terrasse béton", ponderation: 34, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-11', libelle: 'Étanchéité',                                             description: "Bitume, membrane", ponderation: 33, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-12', libelle: "Aménagements de toiture (skydomes, descentes EP, etc.)", description: "Evacuation pluviale (descentes pluviales en PVC)", ponderation: 33, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-05', type: 'technique', section: 'Second Œuvre', ponderation: 10,
    elements: [
      { id: 'ct-13', libelle: 'Revêtements de sols hall public',          description: "Carrelage", ponderation: 12, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-14', libelle: 'Revêtements muraux hall public',         description: "Carrelage", ponderation: 12, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-15', libelle: "Revêtements de sols des circulations ",   description: "Carrelage", ponderation: 11, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-16', libelle: 'Revêtements de sols espaces de travail',            description: "Carrelage", ponderation: 11, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-17', libelle: "Revêtements de sols escalier",   description: "Carrelage", ponderation: 11, ordre: 5, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-18', libelle: 'Revêtements de murs circulations',            description: "Peinture, enduit", ponderation: 11, ordre: 6, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-19', libelle: 'Revêtements de murs espaces de travail',                        description: "Peinture, enduit", ponderation: 11, ordre: 7, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-20', libelle: 'Revêtements de murs escalier',                              description: "Peinture, enduit", ponderation: 11, ordre: 8, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-21', libelle: 'Cloison/doublage',                       description: "Murs", ponderation: 10, ordre: 9, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-62', libelle: 'Plafonds et faux-plafonds',                       description: "Dalles minérales", ponderation: 10, ordre: 10, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-63', libelle: 'Panneaux acoustiques',                       description: "Panneaux acoustiques", ponderation: 10, ordre: 11, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-06', type: 'technique', section: 'Sécurité incendie', ponderation: 10,
    elements: [
      { id: 'ct-22', libelle: 'Colonnes sèches',                                description: "Conduites métalliques fixes", ponderation: 12, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-23', libelle: 'Colonnes humides',                               description: "Conduites fixes sous pression", ponderation: 12, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-24', libelle: 'Désenfumage',                                    description: "Volets de désenfumage", ponderation: 11, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-25', libelle: 'RIA',                                            description: "Tuyau semi-rigide", ponderation: 11, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-26', libelle: 'Sprinklers',                                     description: "Système d’extinction automatique à eau", ponderation: 11, ordre: 5, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-27', libelle: "Blocs Autonomes d'Éclairage de Sécurité (BAES)", description: "BAES lumineux", ponderation: 11, ordre: 6, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-28', libelle: 'Extincteurs',                                    description: "A poudre", ponderation: 11, ordre: 7, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-29', libelle: 'Portes coupe-feu',                               description: "Portes métalliques avec ferme-porte automatique", ponderation: 11, ordre: 8, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-30', libelle: "Espaces d'attente sécurisés",                    description: "Zones de refuge avec alarme", ponderation: 10, ordre: 9, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-07', type: 'technique', section: "Sûreté / Contrôle d'accès / Vidéo", ponderation: 5,
    elements: [
      { id: 'ct-31', libelle: "Contrôle d'accès",           description: "Badges, interphones, caméras", ponderation: 15, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-32', libelle: 'Vidéosurveillance',           description: "Badges, interphones, caméras", ponderation: 15, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-33', libelle: 'Système anti-intrusion',      description: "Badges, interphones, caméras", ponderation: 14, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-34', libelle: 'Porte automatique',           description: "Mécanismes électromécaniques", ponderation: 14, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-35', libelle: 'Portail motorisé / Barrière', description: "Mécanismes électromécaniques", ponderation: 14, ordre: 5, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-36', libelle: 'Barrière levante',            description: "Mécanismes électromécaniques", ponderation: 14, ordre: 6, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-37', libelle: 'Clôture du site',             description: "Mur en parpaing, barbelés", ponderation: 14, ordre: 7, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-08', type: 'technique', section: 'Ventilation - Climatisation', ponderation: 10,
    elements: [
      { id: 'ct-38', libelle: "VMC (extracteur d'air, etc.)",                                      description: "Extracteurs d’air, gaines", ponderation: 15, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-39', libelle: 'CTA bâtiment',                                                      description: "Unités de traitement centralisé", ponderation: 15, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-40', libelle: "Gaines de ventilation et de traitement d'air (réseau de conduits)", description: "Conduits métalliques", ponderation: 14, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-41', libelle: 'Régulation (thermostats, etc.)',                                     description: "Thermostats muraux", ponderation: 14, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-42', libelle: 'Production de froid (VRV, etc.)',                                    description: "Systèmes VRV, climatiseurs split", ponderation: 14, ordre: 5, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-43', libelle: 'Distribution du froid (réseaux de distribution)',                    description: "Canalisations en cuivre", ponderation: 14, ordre: 6, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-44', libelle: 'Terminaux de froid (cassettes, splits, etc.)',                       description: "cassettes, splits", ponderation: 14, ordre: 7, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-09', type: 'technique', section: 'Plomberie / Sanitaire', ponderation: 10,
    elements: [
      { id: 'ct-45', libelle: 'Eau Chaude Sanitaire',                                                              description: "Chauffe-eau électriques", ponderation: 25, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-46', libelle: 'Canalisations (réseaux eau froide, chaude, eaux usées, pluviales)',                 description: "PVC, PPR", ponderation: 25, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-47', libelle: 'Appareillages (lavabos, WC, douches, urinoirs, robinetterie, mitigeurs, etc.)',           description: "Lavabos, WC, urinoirs, douches, robinetterie, mitigeurs", ponderation: 25, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-48', libelle: "Appareillages PMR (Lavabos, WC, douches, urinoirs, robinetterie, mitigeurs, etc.)",                     description: "WC rehaussé, barres d’appui, lavabos bas", ponderation: 25, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-10', type: 'technique', section: 'Électricité courants forts', ponderation: 10,
    elements: [
      { id: 'ct-49', libelle: 'Groupe électrogène',                                                                                                               description: "Diesel", ponderation: 17, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-50', libelle: 'Onduleur',                                                                                                                         description: "Alimentation de secours pour équipements informatiques", ponderation: 17, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-51', libelle: 'Transformateur',                                                                                                                   description: "Poste de transformation HT/BT", ponderation: 17, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-52', libelle: 'Etat général des armoires (conformité aux normes, propreté, absence de poussière, rouille, ventilation, etc.)',                                         description: "TGBT, armoires, coffrets", ponderation: 17, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-53', libelle: 'Etat général du câblage (câblage apparent ou en goulottes, absence de fils dénudés ou de bricolage, présence de mise à la terre conforme, etc.)',       description: "Câbles en goulottes, chemins de câbles, mise à la terre", ponderation: 16, ordre: 5, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-54', libelle: "Eclairage (types de luminaires, niveau d’éclairement suffisant, luminaires vétustes ou en mauvais état, etc.)",                               description: "Luminaires à tubes LED, plafonniers, spots encastrés,", ponderation: 16, ordre: 6, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-11', type: 'technique', section: 'Appareils élévateurs', ponderation: 5,
    elements: [
      { id: 'ct-55', libelle: 'Ascenseurs', description: "Ascenseurs électriques", ponderation: 100, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
  {
    id: 'sct-12', type: 'technique', section: 'Voiries - Réseaux - Divers', ponderation: 5,
    elements: [
      { id: 'ct-56', libelle: 'Voirie interne',                                                                                  description: "Pavés autobloquants", ponderation: 17, ordre: 1, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-57', libelle: 'Réseaux divers (eau potable, assainissement (EU/EP), électrique extérieur, télécoms, etc.)',     description: "Regards, caniveaux", ponderation: 17, ordre: 2, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-58', libelle: 'Espaces verts — aire de jeu',                                                                     description: "Gazon, arbres d’ombrage", ponderation: 17, ordre: 3, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-59', libelle: 'Séparateur à hydrocarbures',                                                                      description: "Dispositif de traitement des eaux usées issues des parkings", ponderation: 17, ordre: 4, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-60', libelle: 'Éclairage extérieur',                                                                             description: "Lampadaires solaires", ponderation: 16, ordre: 5, etatsDisponibles: ETATS_GENERAUX, actif: true },
      { id: 'ct-61', libelle: "Accès à l'accueil du public (guérite, etc.)",                                                     description: "Guérite", ponderation: 16, ordre: 6, etatsDisponibles: ETATS_GENERAUX, actif: true },
    ],
  },
]

// ─── Bâtiments (données mock) ─────────────────────────────────────────────────

export const batimentsData: BatimentType[] = [
  {
    id: 'bat-01',
    code: 'BAT-2024-0001',
    codeBatiment: 'HVC-001',
    codeLiaison: 'HVC-001',
    sections: [],
    denomination: 'Hôtel de Ville de Cotonou',
    organisme: 'Mairie de Cotonou',
    modeAcquisition: 'Construction',
    anneeConstruction: 1985,
    statutConstruction: 'En rénovation',
    departement: 'Littoral',
    commune: 'Cotonou',
    arrondissement: '1er arrondissement',
    adresse: 'Avenue Jean-Paul II, Cotonou',
    latitude: 6.3654,
    longitude: 2.4183,
    departementClimatique: 'Couffo',
    typeConstruction: 'batiment_etage',
    niveauxSousSol: 0,
    nombreEtages: 3,
    usages: ['Bureau'],
    typeMateriau: ['Maçonnerie-béton'],
    typeToiture: ['Toiture dalle non accessible'],
    energies: ['Electricité'],
    surfaceTotale: 2500,
    surfaceSallesHumides: 120,
    nombrePieces: 45,
  },
  {
    id: 'bat-02',
    code: 'BAT-2024-0002',
    codeBatiment: 'PREF-ZOU-001',
    codeLiaison: 'PREF-ZOU-001',
    sections: [],
    denomination: 'Préfecture du Zou',
    organisme: 'Préfecture du Zou',
    modeAcquisition: 'Construction',
    anneeConstruction: 1972,
    statutConstruction: 'En rénovation',
    departement: 'Zou',
    commune: 'Abomey',
    adresse: 'Place Goho, Abomey',
    departementClimatique: 'Zou',
    typeConstruction: 'batiment_etage',
    niveauxSousSol: 0,
    nombreEtages: 2,
    usages: ['Bureau', 'Technique'],
    typeMateriau: ['Maçonnerie-béton'],
    typeToiture: ['Toiture en tôle galvanisée'],
    energies: ['Electricité'],
    surfaceTotale: 1800,
    surfaceSallesHumides: 80,
    nombrePieces: 32,
  },
]

// ─── Évaluations mock ────────────────────────────────────────────────────────

export const evaluationsFonctionnellesData: EvaluationFonctionnelleType[] = [
  {
    id: 'ev-fonc-01',
    batimentId: 'bat-01',
    date: '2024-11-15',
    evaluateur: 'Inspecteur Kouassi',
    criteres: [
      { critereId: 'scf-01', elementId: 'cf-01', etat: 'Passable', commentaire: 'Revêtement de sol usé dans les couloirs' },
      { critereId: 'scf-01', elementId: 'cf-02', etat: 'Mauvais',  commentaire: 'Équipements vétustes, remplacement nécessaire' },
      { critereId: 'scf-02', elementId: 'cf-03', etat: 'Bon' },
      { critereId: 'scf-02', elementId: 'cf-04', etat: 'Passable' },
      { critereId: 'scf-02', elementId: 'cf-05', etat: 'Bon' },
      { critereId: 'scf-03', elementId: 'cf-06', etat: 'Passable' },
      { critereId: 'scf-03', elementId: 'cf-07', etat: 'Mauvais', commentaire: 'Nombre insuffisant de sanitaires' },
      { critereId: 'scf-03', elementId: 'cf-08', etat: 'Bon' },
      { critereId: 'scf-03', elementId: 'cf-09', etat: 'Mauvais', commentaire: "Aucune rampe d'accès PMR" },
      { critereId: 'scf-04', elementId: 'cf-10', etat: 'Bon' },
      { critereId: 'scf-04', elementId: 'cf-11', etat: 'Passable' },
      { critereId: 'scf-04', elementId: 'cf-12', etat: 'Bon' },
    ],
  },
]

export const evaluationsTechniquesData: EvaluationTechniqueType[] = [
  {
    id: 'ev-tech-01',
    batimentId: 'bat-01',
    date: '2024-11-15',
    evaluateur: 'Inspecteur Kouassi',
    criteres: [
      { critereId: 'sct-01', elementId: 'ct-01', nature: 'Béton armé',       constat: 'Aucun désordre apparent',                    etat: 'Bon' },
      { critereId: 'sct-01', elementId: 'ct-02', nature: 'Dalle béton',       constat: 'Fissures légères en rive',                   etat: 'Passable' },
      { critereId: 'sct-01', elementId: 'ct-03', nature: 'Béton armé',        constat: 'RAS',                                        etat: 'Bon' },
      { critereId: 'sct-01', elementId: 'ct-04', nature: 'Maçonnerie',        constat: 'Fissures verticales observées façade nord',   etat: 'Mauvais' },
      { critereId: 'sct-02', elementId: 'ct-05', nature: 'Enduit ciment',     constat: 'Décollements localisés',                     etat: 'Passable' },
      { critereId: 'sct-02', elementId: 'ct-06', nature: 'Peinture vinylique',constat: 'Cloquage et écaillage',                      etat: 'Mauvais' },
    ],
  },
]

// ─── Recensements mock ────────────────────────────────────────────────────────

export const recensementsData: RecensementType[] = [
  {
    id: 'rec-01',
    code: 'RC-BAT-2024-11-15-00',
    batimentId: 'bat-01',
    date: '2024-11-15',
    evaluateur: 'Inspecteur Koffi',
    statut: 'validé',
    criteresFonctionnels: [
      { critereId: 'scf-01', elementId: 'cf-01', etat: 'Passable', commentaire: 'Revêtement de sol usé dans les couloirs' },
      { critereId: 'scf-01', elementId: 'cf-02', etat: 'Mauvais',  commentaire: 'Équipements vétustes, remplacement nécessaire' },
      { critereId: 'scf-02', elementId: 'cf-03', etat: 'Bon' },
      { critereId: 'scf-02', elementId: 'cf-04', etat: 'Passable' },
      { critereId: 'scf-02', elementId: 'cf-05', etat: 'Bon' },
      { critereId: 'scf-03', elementId: 'cf-06', etat: 'Passable' },
      { critereId: 'scf-03', elementId: 'cf-07', etat: 'Mauvais', commentaire: 'Nombre insuffisant de sanitaires' },
      { critereId: 'scf-03', elementId: 'cf-08', etat: 'Bon' },
      { critereId: 'scf-03', elementId: 'cf-09', etat: 'Mauvais', commentaire: "Aucune rampe d'accès PMR" },
      { critereId: 'scf-04', elementId: 'cf-10', etat: 'Bon' },
      { critereId: 'scf-04', elementId: 'cf-11', etat: 'Passable' },
      { critereId: 'scf-04', elementId: 'cf-12', etat: 'Bon' },
    ],
    criteresTechniques: [
      { critereId: 'sct-01', elementId: 'ct-01', nature: 'Béton armé',        constat: 'Aucun désordre apparent',                  etat: 'Bon' },
      { critereId: 'sct-01', elementId: 'ct-02', nature: 'Dalle béton',        constat: 'Fissures légères en rive',                 etat: 'Passable' },
      { critereId: 'sct-01', elementId: 'ct-03', nature: 'Béton armé',         constat: 'RAS',                                      etat: 'Bon' },
      { critereId: 'sct-01', elementId: 'ct-04', nature: 'Maçonnerie',         constat: 'Fissures verticales observées façade nord', etat: 'Mauvais' },
      { critereId: 'sct-02', elementId: 'ct-05', nature: 'Enduit ciment',      constat: 'Décollements localisés',                   etat: 'Passable' },
      { critereId: 'sct-02', elementId: 'ct-06', nature: 'Peinture vinylique', constat: 'Cloquage et écaillage',                    etat: 'Mauvais' },
    ],
  },
  {
    id: 'rec-02',
    code: 'RC-BAT-2025-01-20-00',
    batimentId: 'bat-02',
    date: '2025-01-20',
    evaluateur: 'Ingénieur Adjanohoun',
    statut: 'brouillon',
    criteresFonctionnels: [
      { critereId: 'scf-01', elementId: 'cf-01', etat: 'Bon' },
      { critereId: 'scf-01', elementId: 'cf-02', etat: 'Passable', commentaire: 'Équipements à renouveler partiellement' },
      { critereId: 'scf-02', elementId: 'cf-03', etat: 'Bon' },
      { critereId: 'scf-02', elementId: 'cf-04', etat: 'Bon' },
      { critereId: 'scf-03', elementId: 'cf-06', etat: 'Passable' },
      { critereId: 'scf-04', elementId: 'cf-10', etat: 'Bon' },
    ],
    criteresTechniques: [
      { critereId: 'sct-01', elementId: 'ct-01', nature: 'Béton armé', constat: 'Bon état général', etat: 'Bon' },
      { critereId: 'sct-02', elementId: 'ct-05', nature: 'Enduit', constat: 'Légères fissures superficielles', etat: 'Passable' },
    ],
  },
]

// ─── Zones Climatiques ────────────────────────────────────────────────────────

const _depts: DepartementClimatiqueType[] = [
  { id: 'dept-01', zoneId: 'zc-01', nom: 'Littoral',             ordre: 1  },
  { id: 'dept-02', zoneId: 'zc-01', nom: 'Atlantique',           ordre: 2  },
  { id: 'dept-03', zoneId: 'zc-01', nom: 'Ouémé',                ordre: 3  },
  { id: 'dept-04', zoneId: 'zc-01', nom: 'Plateau',              ordre: 4  },
  { id: 'dept-05', zoneId: 'zc-01', nom: 'Mono',                 ordre: 5  },
  { id: 'dept-06', zoneId: 'zc-01', nom: 'Couffo',               ordre: 6  },
  { id: 'dept-07', zoneId: 'zc-02', nom: 'Collines',             ordre: 7  },
  { id: 'dept-08', zoneId: 'zc-02', nom: 'Zou',                  ordre: 8  },
  { id: 'dept-09', zoneId: 'zc-02', nom: 'Donga (partie sud)',   ordre: 9  },
  { id: 'dept-10', zoneId: 'zc-02', nom: 'Borgou (partie sud)',  ordre: 10 },
  { id: 'dept-11', zoneId: 'zc-02', nom: 'Atacora (partie sud)', ordre: 11 },
  { id: 'dept-12', zoneId: 'zc-03', nom: 'Alibori',              ordre: 12 },
  { id: 'dept-13', zoneId: 'zc-03', nom: 'Donga (partie nord)',  ordre: 13 },
  { id: 'dept-14', zoneId: 'zc-03', nom: 'Borgou (partie nord)', ordre: 14 },
  { id: 'dept-15', zoneId: 'zc-03', nom: 'Atacora (partie nord)',ordre: 15 },
]

export const zonesClimatiquesData: ZoneClimatiqueType[] = [
  {
    id: 'zc-01',
    nom: 'Zone Guinéenne (Sud)',
    departements: _depts.filter((d) => d.zoneId === 'zc-01'),
    ordre: 1,
  },
  {
    id: 'zc-02',
    nom: 'Zone Soudano-Guinéenne (Centre)',
    departements: _depts.filter((d) => d.zoneId === 'zc-02'),
    ordre: 2,
  },
  {
    id: 'zc-03',
    nom: 'Zone Soudanienne (Nord)',
    departements: _depts.filter((d) => d.zoneId === 'zc-03'),
    ordre: 3,
  },
]

// ─── Aléas Climatiques ────────────────────────────────────────────────────────

export const aleasClimatiquesData: AleaClimatiqueType[] = [
  { id: 'al-01', nom: 'Pluies Torrentielles',  ordre: 1, actif: true },
  { id: 'al-02', nom: 'Érosion Côtière',        ordre: 2, actif: true },
  { id: 'al-03', nom: 'Tempête',                ordre: 3, actif: true },
  { id: 'al-04', nom: 'Température Extrême',    ordre: 4, actif: true },
  { id: 'al-05', nom: 'Inondations',            ordre: 5, actif: true },
  { id: 'al-06', nom: "Salinisation de l'eau",  ordre: 6, actif: true },
  { id: 'al-07', nom: 'Sécheresse',             ordre: 7, actif: true },
  { id: 'al-08', nom: 'Glissement de terrain',  ordre: 8, actif: true },
]

// ─── Cartographie des Aléas (département × aléa → niveau) ───────────────────
// F = Faible, M = Moyen, E = Elevé

const F: NiveauRisqueDisponible = { etat: 'Faible', note: 0 }
const M: NiveauRisqueDisponible = { etat: 'Moyen', note: 50 }
const E: NiveauRisqueDisponible = { etat: 'Elevé', note: 100 }

// [PT, EC, Tempête, TE, Inond, Salin, Séch, GT]
const cartoDepts: [string, NiveauRisqueDisponible[]][] = [
  // Zone Guinéenne (Sud)
  ['Littoral',             [M, E, E, F, E, E, F, F]],
  ['Atlantique',           [M, E, E, F, E, E, F, F]],
  ['Ouémé',               [E, E, E, M, E, E, F, F]],
  ['Plateau',              [M, F, M, M, M, M, F, F]],
  ['Mono',                 [M, E, E, M, E, E, F, F]],
  ['Couffo',               [M, F, M, M, M, F, F, F]],
  // Zone Soudano-Guinéenne (Centre)
  ['Collines',             [E, F, F, E, M, F, F, M]],
  ['Zou',                  [E, F, M, M, M, F, F, F]],
  ['Donga (partie sud)',   [E, F, M, E, M, F, F, F]],
  ['Borgou (partie sud)',  [M, F, M, E, M, F, M, F]],
  ['Atacora (partie sud)', [M, F, M, E, M, F, M, M]],
  // Zone Soudanienne (Nord)
  ['Alibori',              [M, F, E, E, E, F, E, F]],
  ['Donga (partie nord)',  [M, F, M, E, M, F, M, F]],
  ['Borgou (partie nord)', [M, F, M, E, M, F, M, F]],
  ['Atacora (partie nord)',[M, F, E, E, E, F, M, M]],
]

const aleaIds = ['al-01', 'al-02', 'al-03', 'al-04', 'al-05', 'al-06', 'al-07', 'al-08']

// Lookup nom → id pour construire les CartoAleaType
const _deptIdByNom: Record<string, string> = Object.fromEntries(_depts.map((d) => [d.nom, d.id]))

export const cartoAleaData: CartoAleaType[] = cartoDepts.flatMap(([deptNom, niveaux]) =>
  aleaIds.map((aleaId, i) => ({
    departementClimatiqueId: _deptIdByNom[deptNom] ?? deptNom,
    aleaId,
    niveau: niveaux[i],
  }))
)

// ─── Parties d'ouvrage ────────────────────────────────────────────────────────

export const partiesOuvrageData: PartieOuvrageType[] = [
  { id: 'po-01', nom: 'Gros œuvre (structure, maçonnerie)',                       superficie: 1000, prixUnitaireRef: "150-400",   prixUnitaire: 300,  ordre: 1  },
  { id: 'po-02', nom: 'Toiture / Couverture / Etanchéité',                       superficie: 1000, prixUnitaireRef: "550-850",   prixUnitaire: 750,  ordre: 2  },
  { id: 'po-03', nom: 'Menuiseries extérieures',                                  superficie: 1000, prixUnitaireRef: "550-950",   prixUnitaire: 850,  ordre: 3  },
  { id: 'po-04', nom: 'Second Œuvre',                                             superficie: 1000, prixUnitaireRef: "650-1050",  prixUnitaire: 900,  ordre: 4  },
  { id: 'po-05', nom: 'Plomberie sanitaire',                                      superficie: 1000, prixUnitaireRef: "1050-1550", prixUnitaire: 1350, ordre: 5  },
  { id: 'po-06', nom: 'CFO',                                                      superficie: 1000, prixUnitaireRef: "1200-1800", prixUnitaire: 1550, ordre: 6  },
  { id: 'po-07', nom: 'CFA',                                                      superficie: 1000, prixUnitaireRef: "1400-1900", prixUnitaire: 1650, ordre: 7  },
  { id: 'po-08', nom: 'Ventilation',                                              superficie: 1000, prixUnitaireRef: "700-1150",  prixUnitaire: 800,  ordre: 8  },
  { id: 'po-09', nom: 'Climatisation (split / centrale)',                         superficie: 1000, prixUnitaireRef: "750-1250",  prixUnitaire: 850,  ordre: 9  },
  { id: 'po-10', nom: 'Façade (peinture extérieure, bardage, revêtement)',        superficie: 1000, prixUnitaireRef: "250-800",   prixUnitaire: 500,  ordre: 10 },
  { id: 'po-11', nom: 'Peinture Intérieure (mur, plafond, ménuiseries)',          superficie: 1000, prixUnitaireRef: "300-750",   prixUnitaire: 400,  ordre: 11 },
  { id: 'po-12', nom: 'VRD',                                                      superficie: 1000, prixUnitaireRef: "300-650",   prixUnitaire: 400,  ordre: 12 },
]

// ─── Pondérations Aléas — scores (Expo, Sens, Imp) × partie × aléa ───────────
// Colonnes : [PT, EC, Tempête, TE, Inond, Salin, Séch, GT] => aleasClimatiquesData: AleaClimatiqueType
// Scores : [exposition, sensibilité, importanceFonctionnelle] ∈ {1, 2, 3}
// pExp=0.45  pSens=0.35  pImp=0.20 (depuis criteresEvalPonderationData)

const scoreRows: [string, [number, number, number][]][] = [
  //         PT       EC      Tp      TE      In      Sa      Se      GT
  ['po-01', [[2,2,3],[2,2,3],[2,2,3],[2,2,3],[3,3,3],[3,2,3],[3,3,3],[3,3,3]]],
  ['po-02', [[3,3,3],[2,2,3],[3,3,3],[2,2,3],[1,1,3],[3,1,3],[1,1,3],[3,2,3]]],
  ['po-03', [[3,3,2],[2,2,2],[3,3,2],[2,3,2],[2,2,2],[3,3,2],[1,2,2],[3,2,2]]],
  ['po-04', [[1,1,2],[1,1,2],[1,1,2],[2,2,2],[3,1,2],[1,1,2],[2,2,2],[2,3,2]]],
  ['po-05', [[1,1,3],[1,1,3],[1,1,3],[2,3,3],[1,1,3],[1,1,3],[2,3,3],[3,3,3]]],
  ['po-06', [[2,2,3],[1,1,3],[1,1,3],[3,3,3],[1,1,3],[2,2,3],[2,2,3],[1,1,3]]],
  ['po-07', [[2,2,2],[1,1,2],[1,1,2],[1,1,2],[1,1,2],[1,1,2],[1,1,2],[1,1,2]]],
  ['po-08', [[2,2,2],[2,2,2],[1,1,2],[3,2,2],[3,1,2],[3,2,2],[2,3,2],[1,1,2]]],
  ['po-09', [[2,2,2],[2,2,2],[1,1,2],[3,2,2],[3,1,2],[3,2,2],[2,3,2],[1,1,2]]],
  ['po-10', [[3,3,3],[2,2,3],[2,2,3],[3,2,3],[2,2,3],[3,3,3],[2,2,3],[2,2,3]]],
  ['po-11', [[1,1,2],[1,1,2],[1,1,2],[2,1,2],[2,1,2],[1,2,2],[2,2,2],[2,2,3]]],
  ['po-12', [[3,3,3],[3,2,3],[3,1,3],[2,2,3],[3,3,3],[2,2,3],[3,2,3],[3,3,3]]],
]

const _pExp = 0.45, _pSens = 0.35, _pImp = 0.20

const _notes: Record<string, Record<string, number>> = {}
for (const [partieId, scores] of scoreRows) {
  _notes[partieId] = {}
  for (let i = 0; i < aleaIds.length; i++) {
    const [e, s, imp] = scores[i]
    _notes[partieId][aleaIds[i]] = (((e * _pExp + s * _pSens + imp * _pImp) * 100) / 100)
  }
}

const _sumParAlea: Record<string, number> = {}
for (const aleaId of aleaIds) {
  _sumParAlea[aleaId] = scoreRows.reduce((sum, [pid]) => sum + _notes[pid][aleaId], 0)
}

export const ponderationsAleaData: PonderationAleaType[] = scoreRows.flatMap(
  ([partieOuvrageId, scores]) =>
    aleaIds.map((aleaId, i) => {
      const [e, s, imp] = scores[i]
      const nt  = _notes[partieOuvrageId][aleaId]
      const sum = _sumParAlea[aleaId]
      return {
        partieOuvrageId,
        aleaId,
        exposition:              e,
        sensibilite:             s,
        importanceFonctionnelle: imp,
        note:                    Math.round((sum > 0 ? (nt / sum) * 100 : 0)),
      }
    })
)

// ─── Critères d'évaluation des pondérations climatiques ──────────────────────

export const criteresEvalPonderationData: CritereEvalPonderationType[] = [
  {
    id: 'cep-01',
    nom: 'Exposition',
    definition: "Probabilité que le lot soit exposé à l'aléas (1 = faible, 2 = moyen et 3 = forte)",
    poids: 0.45,
    ordre: 1,
  },
  {
    id: 'cep-02',
    nom: 'Sensibilité',
    definition: "Sensibilité de l'élément à l'aléas (1 = faible, 2 = moyen et 3 = forte).",
    poids: 0.35,
    ordre: 2,
  },
  {
    id: 'cep-03',
    nom: 'Importance fonctionnelle',
    definition: "Importance du lot pour la fonctionnalité du bâtiment (1 = faible, 2 = moyen et 3 = forte).",
    poids: 0.2,
    ordre: 3,
  },
]

// ─── Évaluations complètes mock ───────────────────────────────────────────────

export let campagnesData: CampagneType[] = []

export const evaluationsData: EvaluationType[] = [
  {
    id: 'eval-01',
    code: 'EV-BAT-2024-11-15-00',
    batimentId: 'bat-01',
    date: '2024-11-15',
    evaluateur: 'Inspecteur Kouassi',
    statut: 'validé',
    departementClimatique: 'Littoral',
    notePhysique: 6.5,
    noteFonctionnelle: 5.8,
    noteTechnique: 6.2,
    coefficientUsure: 42,
    coutGlobal: 125000000,
  },
  {
    id: 'eval-02',
    code: 'EV-BAT-2025-01-20-00',
    batimentId: 'bat-02',
    date: '2025-01-20',
    evaluateur: 'Ingénieur Ahoui',
    statut: 'brouillon',
    departementClimatique: 'Zou',
    notePhysique: 7.2,
    noteFonctionnelle: 7.8,
    noteTechnique: 6.9,
    coefficientUsure: 28,
    coutGlobal: 95000000,
  },
]
