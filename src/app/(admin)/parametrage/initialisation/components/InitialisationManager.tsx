/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Alert, Button, Card, CardBody, CardHeader } from 'react-bootstrap'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import {
  aleasClimatiquesData,
  batimentsData,
  cartoAleaData,
  champsFicheData,
  criteresEtatBatimentData,
  criteresEtatFonctionnel,
  criteresEtatTechnique,
  criteresEvalPonderationData,
  partiesOuvrageData,
  ponderationsAleaData,
  sectionsFicheData,
  typesBatimentData,
  zonesClimatiquesData,
} from '@/assets/data/parametrage'
import {
  addElementFonctionnel,
  addElementTechnique,
  createAleaClimatique,
  createBatiment,
  createChampFiche,
  createCritere,
  createCritereEtatBatiment,
  createCritereEvalPonderation,
  createCriteresTechnique,
  createPartieOuvrage,
  createSectionFiche,
  createTypeBatiment,
  createZoneClimatique,
  getAleasClimatiques,
  getPartiesOuvrage,
  getSectionsFiche,
  getZonesClimatiques,
  saveCartoAlea,
  savePonderationsAlea,
} from '@/services/batimentService'

// ─── Types ───────────────────────────────────────────────────────────────────

type StepStatus = 'pending' | 'running' | 'done' | 'error' | 'skipped'

type Step = {
  id: string
  label: string
  detail: string
  status: StepStatus
  error?: string
}

type IdMaps = {
  aleaIdMap:    Record<string, string>
  deptIdMap:    Record<string, string>
  partieIdMap:  Record<string, string>
  sectionIdMap: Record<string, string>
}

// ─── Configuration des étapes ────────────────────────────────────────────────

function buildSteps(): Step[] {
  const foncSections = criteresEtatFonctionnel.length
  const foncElements = criteresEtatFonctionnel.reduce((s, c) => s + c.elements.length, 0)
  const techSections = criteresEtatTechnique.length
  const techElements = criteresEtatTechnique.reduce((s, c) => s + c.elements.length, 0)
  const depts = new Set(cartoAleaData.map((c) => c.departementClimatiqueId)).size

  return [
    { id: 'types',          label: 'Types de bâtiment',                   detail: `${typesBatimentData.length} type(s)`,                                             status: 'pending' },
    { id: 'criteres-bat',   label: "Critères d'état de bâtiment",         detail: `${criteresEtatBatimentData.length} critères`,                                    status: 'pending' },
    { id: 'sections-fiche', label: "Sections — Fiche d'identification",    detail: `${sectionsFicheData.length} sections`,                                           status: 'pending' },
    { id: 'champs-fiche',   label: "Champs — Fiche d'identification",      detail: `${champsFicheData.length} champs`,                                               status: 'pending' },
    { id: 'eval-pond',   label: "Critères d'éval. pondération",      detail: `${criteresEvalPonderationData.length} critères`,                           status: 'pending' },
    { id: 'zones',       label: 'Zones climatiques',                  detail: `${zonesClimatiquesData.length} zones`,                                     status: 'pending' },
    { id: 'aleas',       label: 'Aléas climatiques',                  detail: `${aleasClimatiquesData.length} aléas`,                                     status: 'pending' },
    { id: 'parties',     label: "Parties d'ouvrage",                  detail: `${partiesOuvrageData.length} parties`,                                     status: 'pending' },
    { id: 'fonctionnel', label: 'Critères état fonctionnel',          detail: `${foncSections} sections • ${foncElements} éléments`,                     status: 'pending' },
    { id: 'technique',   label: 'Critères état technique',            detail: `${techSections} sections • ${techElements} éléments`,                     status: 'pending' },
    { id: 'carto',       label: 'Cartographie des aléas',             detail: `${depts} dép. × ${aleasClimatiquesData.length} aléas = ${cartoAleaData.length} entrées`, status: 'pending' },
    { id: 'ponderation', label: 'Pondérations des aléas',             detail: `${ponderationsAleaData.length} entrées`,                                  status: 'pending' },
    { id: 'batiments',   label: 'Bâtiments de démonstration',         detail: `${batimentsData.length} bâtiments`,                                       status: 'pending' },
  ]
}

// ─── Icône selon le statut ────────────────────────────────────────────────────

function StatusIcon({ status }: { status: StepStatus }) {
  switch (status) {
    case 'running':  return <span className="spinner-border spinner-border-sm text-primary" />
    case 'done':     return <IconifyIcon icon="tabler:circle-check-filled" className="text-success" style={{ fontSize: '1.2rem' }} />
    case 'error':    return <IconifyIcon icon="tabler:circle-x-filled"     className="text-danger"  style={{ fontSize: '1.2rem' }} />
    case 'skipped':  return <IconifyIcon icon="tabler:minus-circle"        className="text-muted"   style={{ fontSize: '1.2rem' }} />
    default:         return <IconifyIcon icon="tabler:circle-dashed"       className="text-secondary" style={{ fontSize: '1.2rem' }} />
  }
}

// ─── Logique des étapes (extraite, réutilisable) ──────────────────────────────

async function execStep(stepId: string, maps: IdMaps): Promise<void> {
  const { aleaIdMap, deptIdMap, partieIdMap } = maps

  switch (stepId) {
    case 'types':
      for (const item of typesBatimentData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...data } = item
        await createTypeBatiment(data)
      }
      break

    case 'criteres-bat':
      for (const item of criteresEtatBatimentData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...data } = item
        await createCritereEtatBatiment(data)
      }
      break

    case 'sections-fiche':
      for (const section of sectionsFicheData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: mockId, champs: _champs, ...secData } = section
        const created = await createSectionFiche(secData)
        maps.sectionIdMap[mockId] = created.id
      }
      break

    case 'champs-fiche':
      for (const section of sectionsFicheData) {
        for (const champ of section.champs) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _id, section: _sec, sectionId: mockSectionId, ...champData } = champ
          await createChampFiche({
            ...champData,
            sectionId: maps.sectionIdMap[mockSectionId] ?? mockSectionId,
          })
        }
      }
      break

    case 'eval-pond':
      for (const item of criteresEvalPonderationData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...data } = item
        await createCritereEvalPonderation(data)
      }
      break

    case 'zones':
      for (const item of zonesClimatiquesData) {
        const created = await createZoneClimatique({
          nom: item.nom,
          ordre: item.ordre,
          departements: item.departements.map((d) => d.nom),
        })
        for (const realDept of created.departements) {
          const origDept = item.departements.find((d) => d.nom === realDept.nom)
          if (origDept) deptIdMap[origDept.id] = realDept.id
        }
      }
      break

    case 'aleas':
      for (const item of aleasClimatiquesData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: mockId, ...data } = item
        const created = await createAleaClimatique(data)
        aleaIdMap[mockId] = created.id
      }
      break

    case 'parties':
      for (const item of partiesOuvrageData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: mockId, ...data } = item
        const created = await createPartieOuvrage(data)
        partieIdMap[mockId] = created.id
      }
      break

    case 'fonctionnel':
      for (const sec of criteresEtatFonctionnel) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, elements, ...secData } = sec
        const created = await createCritere({ ...secData, elements: [] })
        for (const el of elements) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _elId, ...elData } = el
          await addElementFonctionnel(created.id, elData)
        }
      }
      break

    case 'technique':
      for (const sec of criteresEtatTechnique) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, elements, ...secData } = sec
        const created = await createCriteresTechnique({ ...secData, elements: [] })
        for (const el of elements) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id: _elId, ...elData } = el
          await addElementTechnique(created.id, elData)
        }
      }
      break

    case 'carto': {
      const mapped = cartoAleaData.map((c) => ({
        ...c,
        departementClimatiqueId: deptIdMap[c.departementClimatiqueId] ?? c.departementClimatiqueId,
        aleaId:                  aleaIdMap[c.aleaId]                  ?? c.aleaId,
      }))
      await saveCartoAlea(mapped)
      break
    }

    case 'ponderation': {
      const mapped = ponderationsAleaData.map((p) => ({
        ...p,
        partieOuvrageId: partieIdMap[p.partieOuvrageId] ?? p.partieOuvrageId,
        aleaId:          aleaIdMap[p.aleaId]            ?? p.aleaId,
      }))
      await savePonderationsAlea(mapped)
      break
    }

    case 'batiments':
      for (const item of batimentsData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id: _id, ...data } = item
        await createBatiment(data)
      }
      break
  }
}

/**
 * Reconstruit les trois maps d'IDs en interrogeant l'API courante.
 * Utilisé lors de la relance indépendante d'une étape.
 */
async function buildMapsFromApi(): Promise<IdMaps> {
  const [zones, aleas, parties, sections] = await Promise.all([
    getZonesClimatiques(),
    getAleasClimatiques(),
    getPartiesOuvrage(),
    getSectionsFiche(),
  ])

  const deptIdMap: Record<string, string> = {}
  for (const zone of zones) {
    const mockZone = zonesClimatiquesData.find((z) => z.nom === zone.nom)
    if (mockZone) {
      for (const realDept of zone.departements) {
        const mockDept = mockZone.departements.find((d) => d.nom === realDept.nom)
        if (mockDept) deptIdMap[mockDept.id] = realDept.id
      }
    }
  }

  const aleaIdMap: Record<string, string> = {}
  for (const alea of aleas) {
    const mockAlea = aleasClimatiquesData.find((a) => a.nom === alea.nom)
    if (mockAlea) aleaIdMap[mockAlea.id] = alea.id
  }

  const partieIdMap: Record<string, string> = {}
  for (const partie of parties) {
    const mockPartie = partiesOuvrageData.find((p) => p.nom === partie.nom)
    if (mockPartie) partieIdMap[mockPartie.id] = partie.id
  }

  const sectionIdMap: Record<string, string> = {}
  for (const section of sections) {
    const mockSection = sectionsFicheData.find((s) => s.libelle === section.libelle)
    if (mockSection) sectionIdMap[mockSection.id] = section.id
  }

  return { deptIdMap, aleaIdMap, partieIdMap, sectionIdMap }
}

// Étapes qui ont besoin des maps (reconstruit depuis l'API lors d'une relance seule)
const STEPS_NEEDING_MAPS = new Set(['carto', 'ponderation', 'champs-fiche'])

// ─── Composant principal ──────────────────────────────────────────────────────

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? ''

export default function InitialisationManager() {
  const [steps, setSteps]     = useState<Step[]>(buildSteps)
  const [running, setRunning] = useState(false)
  const [finished, setFinished] = useState(false)

  // ── Helpers ────────────────────────────────────────────────────────────────

  const setStepStatus = (id: string, status: StepStatus, error?: string) =>
    setSteps((prev) => prev.map((s) => (s.id === id ? { ...s, status, error } : s)))

  // ── Tout lancer séquentiellement ──────────────────────────────────────────

  const handleStart = async () => {
    setSteps(buildSteps())
    setRunning(true)
    setFinished(false)

    const maps: IdMaps = { aleaIdMap: {}, deptIdMap: {}, partieIdMap: {}, sectionIdMap: {} }
    let failed = false

    for (const step of buildSteps()) {
      if (failed) { setStepStatus(step.id, 'skipped'); continue }
      setStepStatus(step.id, 'running')
      try {
        await execStep(step.id, maps)
        setStepStatus(step.id, 'done')
      } catch (err) {
        setStepStatus(step.id, 'error', err instanceof Error ? err.message : String(err))
        failed = true
      }
    }

    setRunning(false)
    setFinished(true)
  }

  // ── Relancer une seule étape ───────────────────────────────────────────────

  const handleRerunStep = async (stepId: string) => {
    setStepStatus(stepId, 'running')
    try {
      let maps: IdMaps = { aleaIdMap: {}, deptIdMap: {}, partieIdMap: {}, sectionIdMap: {} }
      if (STEPS_NEEDING_MAPS.has(stepId)) {
        maps = await buildMapsFromApi()
      }
      await execStep(stepId, maps)
      setStepStatus(stepId, 'done')
    } catch (err) {
      setStepStatus(stepId, 'error', err instanceof Error ? err.message : String(err))
    }
  }

  // ── Décomptes ──────────────────────────────────────────────────────────────

  const doneCount  = steps.filter((s) => s.status === 'done').length
  const errorCount = steps.filter((s) => s.status === 'error').length
  const progress   = Math.round((doneCount / steps.length) * 100)
  const anyRunning = steps.some((s) => s.status === 'running')

  // ── Rendu ──────────────────────────────────────────────────────────────────

  if (!API_BASE) {
    return (
      <Alert variant="warning">
        <Alert.Heading>
          <IconifyIcon icon="tabler:plug-x" className="me-2" />
          Backend non configuré
        </Alert.Heading>
        <p className="mb-0">
          La variable <code>NEXT_PUBLIC_API_URL</code> n&apos;est pas définie.
          L&apos;initialisation nécessite un backend Laravel connecté.
        </p>
      </Alert>
    )
  }

  return (
    <>
      {/* ── Alerte avertissement ───────────────────────────────────────────── */}
      {!running && !finished && (
        <Alert variant="warning" className="d-flex gap-2 mb-4">
          <IconifyIcon icon="tabler:alert-triangle" className="fs-5 flex-shrink-0 mt-1" />
          <div>
            <strong>À utiliser sur une base de données vide.</strong>{' '}
            Si des données existent déjà, des doublons seront créés.
            Les aléas et parties d&apos;ouvrage doivent être chargés avant la cartographie
            et les pondérations (le mapping des identifiants est automatique).
          </div>
        </Alert>
      )}

      {/* ── Résultat final ────────────────────────────────────────────────── */}
      {finished && errorCount === 0 && (
        <Alert variant="success" className="d-flex gap-2 mb-4">
          <IconifyIcon icon="tabler:circle-check-filled" className="fs-5 flex-shrink-0 mt-1" />
          <div>
            <strong>Initialisation terminée avec succès !</strong>{' '}
            {doneCount}/{steps.length} étapes effectuées.
          </div>
        </Alert>
      )}
      {finished && errorCount > 0 && (
        <Alert variant="danger" className="d-flex gap-2 mb-4">
          <IconifyIcon icon="tabler:circle-x-filled" className="fs-5 flex-shrink-0 mt-1" />
          <div>
            <strong>Initialisation partiellement échouée.</strong>{' '}
            {doneCount} étape(s) réussie(s), {errorCount} erreur(s).
            Utilisez le bouton <strong>Relancer</strong> sur les étapes en erreur ou ignorées.
          </div>
        </Alert>
      )}

      {/* ── Liste des étapes ──────────────────────────────────────────────── */}
      <Card>
        <CardHeader>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h5 className="card-title mb-0">Étapes d&apos;initialisation</h5>
              {running && (
                <p className="text-muted small mb-0 mt-1">
                  Chargement en cours — veuillez ne pas quitter cette page.
                </p>
              )}
            </div>
            {(running || finished) && (
              <span className="text-muted small fw-semibold">{doneCount}/{steps.length}</span>
            )}
          </div>

          {/* Barre de progression */}
          {(running || finished) && (
            <div className="progress mt-2" style={{ height: 5, borderRadius: 3, overflow: 'hidden' }}>
              <div
                className={`progress-bar ${errorCount > 0 ? 'bg-danger' : 'bg-primary'}`}
                style={{ width: `${progress}%`, transition: 'width 0.4s ease' }}
              />
            </div>
          )}
        </CardHeader>

        <CardBody className="p-0">
          <ul className="list-group list-group-flush">
            {steps.map((step, idx) => (
              <li
                key={step.id}
                className={`list-group-item d-flex align-items-center gap-3 px-4 py-3 ${
                  step.status === 'running' ? 'bg-primary bg-opacity-10' : ''
                }`}
              >
                {/* Icône de statut */}
                <div style={{ width: 22, display: 'flex', justifyContent: 'center', flexShrink: 0 }}>
                  <StatusIcon status={step.status} />
                </div>

                {/* Contenu */}
                <div className="flex-grow-1 min-width-0">
                  <div className="fw-medium" style={{ fontSize: '0.88rem' }}>
                    <span className="text-muted me-2" style={{ fontSize: '0.78rem' }}>{idx + 1}.</span>
                    {step.label}
                  </div>
                  <div className="text-muted" style={{ fontSize: '0.78rem' }}>{step.detail}</div>
                  {step.status === 'error' && step.error && (
                    <div className="text-danger mt-1" style={{ fontSize: '0.78rem' }}>
                      <IconifyIcon icon="tabler:alert-circle" className="me-1" />
                      {step.error}
                    </div>
                  )}
                </div>

                {/* Badge de statut + bouton Relancer */}
                <div className="d-flex align-items-center gap-2 flex-shrink-0">
                  {step.status === 'done' && (
                    <>
                      <span className="badge text-bg-success fw-normal" style={{ fontSize: '0.72rem' }}>OK</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={anyRunning}
                        onClick={() => handleRerunStep(step.id)}
                        title="Relancer cette étape"
                        style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        <IconifyIcon icon="tabler:refresh" className="me-1" />
                        Relancer
                      </Button>
                    </>
                  )}
                  {step.status === 'error' && (
                    <>
                      <span className="badge text-bg-danger fw-normal" style={{ fontSize: '0.72rem' }}>Erreur</span>
                      <Button
                        variant="outline-danger"
                        size="sm"
                        disabled={anyRunning}
                        onClick={() => handleRerunStep(step.id)}
                        title="Relancer cette étape"
                        style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        <IconifyIcon icon="tabler:refresh" className="me-1" />
                        Relancer
                      </Button>
                    </>
                  )}
                  {step.status === 'skipped' && (
                    <>
                      <span className="badge text-bg-secondary fw-normal" style={{ fontSize: '0.72rem' }}>Ignorée</span>
                      <Button
                        variant="outline-secondary"
                        size="sm"
                        disabled={anyRunning}
                        onClick={() => handleRerunStep(step.id)}
                        title="Relancer cette étape"
                        style={{ fontSize: '0.72rem', padding: '2px 8px' }}
                      >
                        <IconifyIcon icon="tabler:refresh" className="me-1" />
                        Relancer
                      </Button>
                    </>
                  )}
                </div>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>

      {/* ── Boutons d'action ──────────────────────────────────────────────── */}
      <div className="d-flex justify-content-end gap-2 mt-4">
        {finished && (
          <Button
            variant="outline-secondary"
            onClick={() => { setSteps(buildSteps()); setFinished(false) }}
          >
            <IconifyIcon icon="tabler:refresh" className="me-1" />
            Réinitialiser l&apos;affichage
          </Button>
        )}
        <Button
          variant="primary"
          onClick={handleStart}
          disabled={anyRunning}
          style={{ minWidth: 220 }}
        >
          {anyRunning ? (
            <>
              <span className="spinner-border spinner-border-sm me-2" />
              Initialisation en cours…
            </>
          ) : (
            <>
              <IconifyIcon icon="tabler:database-import" className="me-1" />
              {finished ? "Relancer l'initialisation" : "Lancer l'initialisation"}
            </>
          )}
        </Button>
      </div>
    </>
  )
}
