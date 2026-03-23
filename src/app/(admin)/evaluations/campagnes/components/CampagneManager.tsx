/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useRef, useState } from 'react'
import {
  Alert, Badge, Button, Card, CardBody, CardHeader,
  Col, Form, Modal, Pagination, Row, Table,
} from 'react-bootstrap'
import {
  AleaClimatiqueType,
  BatimentType,
  CampagneType,
  CartoAleaType,
  CritereEtatBatimentType,
  CritereEvaluationType,
  EvaluationType,
  PartieOuvrageType,
  PonderationAleaType,
  RecensementType,
  TypeBatimentType,
  ZoneClimatiqueType,
} from '@/types/entretien-batiment'
import {
  deleteCampagne,
  saveCampagne,
  updateCampagne,
  updateEvaluation,
  validerEvaluation,
} from '@/services/batimentService'
import { computeEvaluation, fmt } from '@/utils/evaluationCalcul'
import { usePrivileges } from '@/hooks/usePrivileges'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import EvaluationForm, { EvaluationFormHandle } from '@/app/(admin)/evaluations/nouveau/components/EvaluationForm'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUT_BG: Record<string, string> = {
  brouillon:  'warning',
  en_cours:   'info',
  validée:    'success',
  clôturée:   'secondary',
}

const EVAL_STATUT_BG: Record<string, string> = {
  brouillon: 'warning',
  validé:    'success',
}

const CU_BG = (cu: number) => cu >= 45 ? 'danger' : cu >= 20 ? 'warning' : 'success'

const NOTE_BG = (n: number) => n >= 2 ? 'success' : n >= 1 ? 'warning' : 'danger'

const PAGE_SIZE = 10

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  campagnesInit: CampagneType[]
  evaluationsInit: EvaluationType[]
  batiments: BatimentType[]
  recensements: RecensementType[]
  criteresFonctionnels: CritereEvaluationType[]
  criteresTechniques: CritereEvaluationType[]
  typesBatiment: TypeBatimentType[]
  criteresEtatBatiment: CritereEtatBatimentType[]
  zonesClimatiques: ZoneClimatiqueType[]
  aleasClimatiques: AleaClimatiqueType[]
  cartoAlea: CartoAleaType[]
  partiesOuvrage: PartieOuvrageType[]
  ponderationsAlea: PonderationAleaType[]
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function CampagneManager({
  campagnesInit,
  evaluationsInit,
  batiments,
  recensements,
  criteresFonctionnels,
  criteresTechniques,
  typesBatiment,
  criteresEtatBatiment,
  zonesClimatiques,
  aleasClimatiques,
  cartoAlea,
  partiesOuvrage,
  ponderationsAlea,
}: Props) {
  const priv = usePrivileges()
  const [campagnes, setCampagnes]     = useState<CampagneType[]>(campagnesInit)
  const [evalsList, setEvalsList]     = useState<EvaluationType[]>(evaluationsInit)
  const [page, setPage]               = useState(1)

  // ── Modals ─────────────────────────────────────────────────────────────────
  const [showFormModal, setShowFormModal]         = useState(false)
  const [editCampagne, setEditCampagne]           = useState<CampagneType | null>(null)
  const [sommaireModal, setSommaireModal]         = useState<CampagneType | null>(null)
  const [evalViewModal, setEvalViewModal]         = useState<EvaluationType | null>(null)
  const [evalEditModal, setEvalEditModal]         = useState<EvaluationType | null>(null)

  // ── Formulaire campagne ─────────────────────────────────────────────────────
  const [nom, setNom]                             = useState('')
  const [anneeRef, setAnneeRef]                   = useState(new Date().getFullYear())
  const [dateDebut, setDateDebut]                 = useState('')
  const [dateFin, setDateFin]                     = useState('')
  const [selectedBatimentIds, setSelectedBatimentIds] = useState<string[]>([])
  const [batimentSearch, setBatimentSearch]       = useState('')
  const [saving, setSaving]                       = useState(false)
  const [formError, setFormError]                 = useState('')

  // ── Eval edit ──────────────────────────────────────────────────────────────
  const formRef     = useRef<EvaluationFormHandle>(null)
  const [formSaving, setFormSaving]   = useState(false)
  const [validating, setValidating]   = useState<string | null>(null)
  const [deleting, setDeleting]       = useState<string | null>(null)
  const [evaluating, setEvaluating]   = useState<string | null>(null)
  const [fermant, setFermant]         = useState(false)

  const batimentMap = new Map(batiments.map((b) => [b.id, b]))

  // ── Pagination ─────────────────────────────────────────────────────────────
  const totalPages = Math.max(1, Math.ceil(campagnes.length / PAGE_SIZE))
  const paginated  = campagnes.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  // ── Ouvrir modal création ──────────────────────────────────────────────────
  const openCreate = () => {
    setEditCampagne(null)
    setNom('')
    setAnneeRef(new Date().getFullYear())
    setDateDebut('')
    setDateFin('')
    setSelectedBatimentIds([])
    setBatimentSearch('')
    setFormError('')
    setShowFormModal(true)
  }

  // ── Ouvrir modal édition (seulement nom/statut) ────────────────────────────
  const openEdit = (c: CampagneType) => {
    setEditCampagne(c)
    setNom(c.nom)
    setAnneeRef(c.anneeRef)
    setDateDebut(c.dateDebut ?? '')
    setDateFin(c.dateFin ?? '')
    setSelectedBatimentIds([...new Set(c.batimentIds)])
    setBatimentSearch('')
    setFormError('')
    setShowFormModal(true)
  }

  // ── Enregistrer campagne ───────────────────────────────────────────────────
  const handleSave = async () => {
    if (!nom.trim()) { setFormError('Le nom est requis.'); return }
    if (!dateDebut) { setFormError('La date de début est requise.'); return }
    if (!dateFin) { setFormError('La date de fin est requise.'); return }
    if (dateFin < dateDebut) { setFormError('La date de fin doit être après la date de début.'); return }
    if (selectedBatimentIds.length === 0 && !editCampagne) { setFormError('Sélectionnez au moins un bâtiment.'); return }
    setSaving(true)
    setFormError('')
    try {
      if (editCampagne) {
        const removedBatimentIds = editCampagne.batimentIds.filter((id) => !selectedBatimentIds.includes(id))
        const { campagne: updated, newEvaluations } = await updateCampagne(editCampagne.id, {
          nom: nom.trim(), anneeRef, dateDebut, dateFin, batimentIds: [...new Set(selectedBatimentIds)],
        })
        setCampagnes((prev) => prev.map((c) => c.id === updated.id ? updated : c))
        if (sommaireModal?.id === updated.id) setSommaireModal(updated)
        setEvalsList((prev) => {
          const withDetached = prev.map((e) =>
            e.campagneId === editCampagne.id && removedBatimentIds.includes(e.batimentId)
              ? { ...e, campagneId: undefined }
              : e
          )
          return [...withDetached, ...newEvaluations]
        })
      } else {
        const { campagne, evaluations: newEvals } = await saveCampagne({
          nom: nom.trim(),
          anneeRef,
          dateDebut,
          dateFin,
          batimentIds: selectedBatimentIds,
        })
        setCampagnes((prev) => [campagne, ...prev])
        setEvalsList((prev) => [...prev, ...newEvals])
      }
      setShowFormModal(false)
    } catch {
      setFormError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setSaving(false)
    }
  }

  // ── Fermer campagne ────────────────────────────────────────────────────────
  const handleFermer = async () => {
    if (!editCampagne) return
    if (!confirm('Clôturer cette campagne ? Elle ne pourra plus être modifiée.')) return
    setFermant(true)
    try {
      const { campagne: updated } = await updateCampagne(editCampagne.id, { statut: 'clôturée' })
      setCampagnes((prev) => prev.map((c) => c.id === updated.id ? updated : c))
      if (sommaireModal?.id === updated.id) setSommaireModal(updated)
      setShowFormModal(false)
    } catch {
      setFormError('Une erreur est survenue lors de la fermeture.')
    } finally {
      setFermant(false)
    }
  }

  // ── Supprimer campagne ─────────────────────────────────────────────────────
  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette campagne ? Les évaluations associées ne seront pas supprimées.')) return
    setDeleting(id)
    try {
      await deleteCampagne(id)
      setCampagnes((prev) => prev.filter((c) => c.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  // ── Valider une évaluation depuis le sommaire ──────────────────────────────
  const handleValiderEval = async (evalId: string) => {
    setValidating(evalId)
    try {
      const updated = await validerEvaluation(evalId)
      setEvalsList((prev) => prev.map((e) => e.id === evalId ? { ...e, ...updated } : e))
      if (evalViewModal?.id === evalId) setEvalViewModal({ ...evalViewModal, ...updated })
    } finally {
      setValidating(null)
    }
  }

  // ── Évaluation automatique de tous les bâtiments d'une campagne ──────────
  const doEvaluation = async (campagne: CampagneType) => {
    setEvaluating(campagne.id)
    try {
      const today = new Date().toISOString().split('T')[0]
      const updatedEvals: EvaluationType[] = []

      for (const batimentId of campagne.batimentIds) {
        const bat = batimentMap.get(batimentId)
        if (!bat) continue

        // Recensement validé le plus récent pour ce bâtiment
        const recensement = recensements
          .filter((r) => r.batimentId === batimentId && r.statut === 'validé' && r.date <= campagne.dateDebut)
          .sort((a, b) => b.date.localeCompare(a.date))[0]

        if (!recensement) continue // bâtiment sans recensement → on saute

        // Évaluation existante pour ce bâtiment dans cette campagne
        const ev = evalsList.find(
          (e) => e.batimentId === batimentId &&
            (e.campagneId === campagne.id || campagne.evaluationIds.includes(e.id))
        )
        if (!ev) continue

        const computed = computeEvaluation({
          batiment: bat,
          anneeRef: campagne.anneeRef,
          recensement,
          typesBatiment,
          criteresFonctionnels,
          criteresTechniques,
          criteresEtatBatiment,
          zonesClimatiques,
          aleasClimatiques,
          cartoAlea,
          ponderationsAlea,
          partiesOuvrage,
        })

        const updated = await updateEvaluation(ev.id, {
          ...computed,
          recencementId: recensement.id,
          date: today,
        })

        updatedEvals.push(updated)
      }

      setEvalsList((prev) =>
        prev.map((e) => {
          const u = updatedEvals.find((x) => x.id === e.id)
          return u ? { ...e, ...u } : e
        })
      )
    } finally {
      setEvaluating(null)
    }
  }

  // ── Eval saved depuis EvaluationForm ──────────────────────────────────────
  const handleEvalSaved = (updated: EvaluationType) => {
    setEvalsList((prev) => prev.map((e) => e.id === updated.id ? { ...e, ...updated } : e))
    setEvalEditModal(null)
  }

  // ── Évaluations d'une campagne ─────────────────────────────────────────────
  const getEvalsForCampagne = (c: CampagneType) =>
    evalsList.filter((e) => e.campagneId === c.id || c.evaluationIds.includes(e.id))

  // ── Stats pour la liste ────────────────────────────────────────────────────
  const campagneStats = (c: CampagneType) => {
    const evals = getEvalsForCampagne(c)
    const done  = evals.filter((e) => e.statut === 'validé').length
    return { total: c.batimentIds.length, done }
  }

  // ── Toggle sélection bâtiment ─────────────────────────────────────────────
  const toggleBatiment = (id: string) => {
    setSelectedBatimentIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const filteredBatiments = batiments.filter((b) =>
    `${b.denomination} ${b.code} ${b.organisme}`.toLowerCase().includes(batimentSearch.toLowerCase())
  )

  // ── Pagination helpers ─────────────────────────────────────────────────────
  const getPageNums = (): (number | null)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const range = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
    const nums = [...range].sort((a, b) => a - b)
    const result: (number | null)[] = []
    for (let i = 0; i < nums.length; i++) {
      if (i > 0 && nums[i] - nums[i - 1] > 1) result.push(null)
      result.push(nums[i])
    }
    return result
  }

  const formProps = {
    batiments, recensements, criteresFonctionnels, criteresTechniques,
    typesBatiment, criteresEtatBatiment, zonesClimatiques, aleasClimatiques,
    cartoAlea, partiesOuvrage, ponderationsAlea,
  }

  // ── Rendu ──────────────────────────────────────────────────────────────────
  return (
    <>
      {/* ── Liste des campagnes ──────────────────────────────────────────── */}
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <h5 className="card-title mb-0">Campagnes d&apos;évaluation</h5>
            <Badge bg="secondary" className="fw-normal">
              {campagnes.length} campagne{campagnes.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {priv.canCreate && (
            <Button variant="primary" size="sm" onClick={openCreate}>
              <IconifyIcon icon="tabler:plus" className="me-1" />
              Nouvelle campagne
            </Button>
          )}
        </CardHeader>

        <CardBody className="p-0">
          {campagnes.length === 0 ? (
            <div className="text-center text-muted py-5">
              <IconifyIcon icon="tabler:clipboard-off" style={{ fontSize: '2rem' }} />
              <p className="mt-2 mb-0">Aucune campagne enregistrée.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table hover className="align-middle mb-0" style={{ minWidth: 800 }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '13%' }}>Code</th>
                    <th style={{ width: '22%' }}>Nom</th>
                    <th className="text-center" style={{ width: '9%' }}>Année réf.</th>
                    <th className="text-center" style={{ width: '10%' }}>Début</th>
                    <th className="text-center" style={{ width: '10%' }}>Fin</th>
                    <th className="text-center" style={{ width: '14%' }}>Progression</th>
                    <th className="text-center" style={{ width: '9%' }}>Statut</th>
                    <th className="text-center" style={{ width: '13%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((c) => {
                    const { total, done } = campagneStats(c)
                    const isDeleting = deleting === c.id
                    return (
                      <tr key={c.id}>
                        <td>
                          <code className="text-muted" style={{ fontSize: '0.72rem' }}>{c.code}</code>
                        </td>
                        <td>
                          <div className="fw-medium" style={{ fontSize: '0.87rem' }}>{c.nom}</div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{total} bâtiment{total !== 1 ? 's' : ''}</div>
                        </td>
                        <td className="text-center fw-semibold">{c.anneeRef}</td>
                        <td className="text-center" style={{ fontSize: '0.82rem' }}>{c.dateDebut ?? '—'}</td>
                        <td className="text-center" style={{ fontSize: '0.82rem' }}>{c.dateFin ?? '—'}</td>
                        <td className="text-center">
                          <div className="d-flex align-items-center gap-2 justify-content-center">
                            <div className="progress flex-grow-1" style={{ height: 6, maxWidth: 80 }}>
                              <div
                                className={`progress-bar bg-${done === total ? 'success' : 'primary'}`}
                                style={{ width: total > 0 ? `${(done / total) * 100}%` : '0%' }}
                              />
                            </div>
                            <small className="text-muted">{done}/{total}</small>
                          </div>
                        </td>
                        <td className="text-center">
                          <Badge bg={STATUT_BG[c.statut]} className="fw-normal text-capitalize">
                            {c.statut}
                          </Badge>
                        </td>
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            <Button
                              size="sm" variant="soft-primary" title="Voir le sommaire"
                              className="btn-icon rounded-circle"
                              onClick={() => setSommaireModal(c)}
                            >
                              <IconifyIcon icon="tabler:layout-list" />
                            </Button>
                            <Button
                              size="sm" variant="soft-info" title="Évaluer automatiquement"
                              className="btn-icon rounded-circle"
                              disabled={evaluating === c.id}
                              onClick={() => doEvaluation(c)}
                            >
                              {evaluating === c.id
                                ? <span className="spinner-border spinner-border-sm" />
                                : <IconifyIcon icon="tabler:player-play" />}
                            </Button>
                            <Button
                              size="sm" variant="soft-success" title={c.statut === 'clôturée' ? 'Campagne fermée' : 'Modifier'}
                              className="btn-icon rounded-circle"
                              disabled={c.statut === 'clôturée'}
                              onClick={() => openEdit(c)}
                            >
                              <IconifyIcon icon="tabler:edit" />
                            </Button>
                            {c.statut !== 'clôturée' && (
                              <Button
                                size="sm" variant="soft-danger" title="Supprimer"
                                className="btn-icon rounded-circle"
                                disabled={isDeleting}
                                onClick={() => handleDelete(c.id)}
                              >
                                {isDeleting
                                  ? <span className="spinner-border spinner-border-sm" />
                                  : <IconifyIcon icon="tabler:trash" />}
                              </Button>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </Table>
            </div>
          )}

          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top">
              <small className="text-muted">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, campagnes.length)} sur {campagnes.length}
              </small>
              <Pagination className="mb-0" size="sm">
                <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
                {getPageNums().map((p, i) =>
                  p === null
                    ? <Pagination.Ellipsis key={`e${i}`} disabled />
                    : <Pagination.Item key={p} active={p === page} onClick={() => setPage(p)}>{p}</Pagination.Item>
                )}
                <Pagination.Next disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} />
              </Pagination>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Modal Créer / Modifier campagne ──────────────────────────────── */}
      <Modal show={showFormModal} onHide={() => setShowFormModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            {editCampagne ? 'Modifier la campagne' : 'Nouvelle campagne d\'évaluation'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {formError && <Alert variant="danger" className="py-2">{formError}</Alert>}

          <Row className="g-3">
            <Col xs={12} md={8}>
              <Form.Label className="fw-medium">Nom de la campagne <span className="text-danger">*</span></Form.Label>
              <Form.Control
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Ex : Campagne 2026 — Ministère des Travaux Publics"
                maxLength={200}
              />
            </Col>
            <Col xs={12} md={4}>
              <Form.Label className="fw-medium">Année de référence <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="number"
                value={anneeRef}
                onChange={(e) => setAnneeRef(Number(e.target.value))}
                min={1900}
                max={2100}
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="fw-medium">Date de début <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                value={dateDebut}
                onChange={(e) => setDateDebut(e.target.value)}
              />
            </Col>
            <Col xs={12} md={6}>
              <Form.Label className="fw-medium">Date de fin <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="date"
                value={dateFin}
                min={dateDebut || undefined}
                onChange={(e) => setDateFin(e.target.value)}
              />
            </Col>

            <Col xs={12}>
              <Form.Label className="fw-medium">
                Bâtiments à inclure {!editCampagne && <span className="text-danger">*</span>}
                {selectedBatimentIds.length > 0 && (
                  <Badge bg="primary" className="ms-2 fw-normal">{selectedBatimentIds.length} sélectionné{selectedBatimentIds.length > 1 ? 's' : ''}</Badge>
                )}
              </Form.Label>
              <Form.Control
                placeholder="Rechercher un bâtiment..."
                value={batimentSearch}
                onChange={(e) => setBatimentSearch(e.target.value)}
                className="mb-2"
                size="sm"
              />
              <div
                className="border rounded"
                style={{ maxHeight: 260, overflowY: 'auto' }}
              >
                {filteredBatiments.length === 0 ? (
                  <div className="text-muted text-center py-3 small">Aucun bâtiment trouvé</div>
                ) : (
                  filteredBatiments.map((b) => (
                    <div
                      key={b.id}
                      className={`d-flex align-items-start gap-2 px-3 py-2 border-bottom cursor-pointer ${selectedBatimentIds.includes(b.id) ? 'bg-primary bg-opacity-10' : ''}`}
                      style={{ cursor: 'pointer' }}
                      onClick={() => toggleBatiment(b.id)}
                    >
                      <Form.Check
                        type="checkbox"
                        checked={selectedBatimentIds.includes(b.id)}
                        onChange={() => toggleBatiment(b.id)}
                        onClick={(e) => e.stopPropagation()}
                        className="mt-1 flex-shrink-0"
                      />
                      <div>
                        <div className="fw-medium" style={{ fontSize: '0.87rem' }}>{b.denomination}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {b.code} — {b.organisme} — {b.commune}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
              {selectedBatimentIds.length > 0 && (
                <div className="mt-1 text-end">
                  <Button variant="link" size="sm" className="p-0 text-muted" onClick={() => setSelectedBatimentIds([])}>
                    Tout désélectionner
                  </Button>
                </div>
              )}
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setShowFormModal(false)}>Annuler</Button>
          {editCampagne && (() => {
            const evals = getEvalsForCampagne(editCampagne)
            const hasUnvalidated = editCampagne.batimentIds.some((id) => {
              const ev = evals.find((e) => e.batimentId === id)
              return !ev || ev.statut !== 'validé'
            })
            return (
              <Button
                variant="danger"
                disabled={fermant || saving || hasUnvalidated}
                title={hasUnvalidated ? 'Des évaluations ne sont pas encore validées' : undefined}
                onClick={handleFermer}
              >
                {fermant
                  ? <><span className="spinner-border spinner-border-sm me-1" />Fermeture...</>
                  : <><IconifyIcon icon="tabler:lock" className="me-1" />Clôturer</>}
              </Button>
            )
          })()}
          <Button variant="primary" disabled={saving || fermant} onClick={handleSave}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
              : <><IconifyIcon icon="tabler:device-floppy" className="me-1" />{editCampagne ? 'Modifier' : 'Créer la campagne'}</>}
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Modal Sommaire ────────────────────────────────────────────────── */}
      <Modal
        show={!!sommaireModal}
        onHide={() => setSommaireModal(null)}
        size="xl"
        centered
        scrollable
        fullscreen="lg-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <div style={{ fontSize: '1rem' }}>
              Sommaire — <span className="fw-semibold">{sommaireModal?.nom}</span>
            </div>
            <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
              <code className="text-muted" style={{ fontSize: '0.75rem' }}>{sommaireModal?.code}</code>
              <Badge bg="secondary" className="fw-normal" style={{ fontSize: '0.7rem' }}>
                Année réf. {sommaireModal?.anneeRef}
              </Badge>
              {sommaireModal?.dateDebut && (
                <span className="text-muted" style={{ fontSize: '0.75rem' }}>
                  Du {sommaireModal.dateDebut} au {sommaireModal.dateFin}
                </span>
              )}
              {sommaireModal && (
                <Badge bg={STATUT_BG[sommaireModal.statut]} className="fw-normal text-capitalize" style={{ fontSize: '0.7rem' }}>
                  {sommaireModal.statut}
                </Badge>
              )}
            </div>
          </Modal.Title>
        </Modal.Header>

        <Modal.Body className="p-0">
          {sommaireModal && (() => {
            const evals = getEvalsForCampagne(sommaireModal)
            return (
              <div className="overflow-auto">
                <Table hover className="align-middle mb-0" style={{ minWidth: 900 }}>
                  <thead className="table-light">
                    <tr>
                      <th style={{ width: '22%' }}>Bâtiment</th>
                      <th className="text-center" style={{ width: '10%' }}>Note Physique</th>
                      <th className="text-center" style={{ width: '11%' }}>Note Fonctionnelle</th>
                      <th className="text-center" style={{ width: '10%' }}>Note Technique</th>
                      <th className="text-center" style={{ width: '9%' }}>Coef. Usure</th>
                      <th className="text-center" style={{ width: '14%' }}>Coût (FCFA)</th>
                      <th className="text-center" style={{ width: '9%' }}>Statut</th>
                      <th className="text-center" style={{ width: '15%' }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...new Set(sommaireModal.batimentIds)].map((batimentId) => {
                      const bat = batimentMap.get(batimentId)
                      const ev  = evals.find((e) => e.batimentId === batimentId)
                      const hasRecensement = recensements.some(
                        (r) => r.batimentId === batimentId && r.statut === 'validé'
                      )
                      const rowDisabled = !hasRecensement
                      return (
                        <tr
                          key={batimentId}
                          style={{
                            cursor: rowDisabled ? 'default' : 'pointer',
                            opacity: rowDisabled ? 0.45 : 1,
                          }}
                          onClick={() => !rowDisabled && ev && setEvalViewModal(ev)}
                        >
                          {/* Bâtiment */}
                          <td>
                            <div className="fw-medium" style={{ fontSize: '0.87rem' }}>
                              {bat?.denomination ?? batimentId}
                            </div>
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>
                              {bat?.code}
                              {rowDisabled && (
                                <span className="ms-2 text-danger fw-medium">
                                  <IconifyIcon icon="tabler:alert-circle" className="me-1" />
                                  Aucun recensement
                                </span>
                              )}
                            </div>
                          </td>

                          {/* Note physique */}
                          <td className="text-center">
                            {ev?.notePhysique != null
                              ? <Badge bg={NOTE_BG(ev.notePhysique)} className="fw-semibold">{ev.notePhysique.toFixed(2)}</Badge>
                              : <span className="text-muted small">—</span>}
                          </td>

                          {/* Note fonctionnelle */}
                          <td className="text-center">
                            {ev?.noteFonctionnelle != null
                              ? <Badge bg={NOTE_BG(ev.noteFonctionnelle)} className="fw-semibold">{ev.noteFonctionnelle.toFixed(2)}</Badge>
                              : <span className="text-muted small">—</span>}
                          </td>

                          {/* Note technique */}
                          <td className="text-center">
                            {ev?.noteTechnique != null
                              ? <Badge bg={NOTE_BG(ev.noteTechnique)} className="fw-semibold">{ev.noteTechnique.toFixed(2)}</Badge>
                              : <span className="text-muted small">—</span>}
                          </td>

                          {/* CU */}
                          <td className="text-center">
                            {ev?.coefficientUsure != null
                              ? <Badge bg={CU_BG(ev.coefficientUsure)} className="fw-semibold">{ev.coefficientUsure.toFixed(1)}&nbsp;%</Badge>
                              : <span className="text-muted small">—</span>}
                          </td>

                          {/* Coût */}
                          <td className="text-center fw-semibold" style={{ fontSize: '0.85rem' }}>
                            {ev?.coutGlobal != null
                              ? fmt(ev.coutGlobal)
                              : <span className="text-muted fw-normal small">—</span>}
                          </td>

                          {/* Statut évaluation */}
                          <td className="text-center">
                            {ev
                              ? <Badge bg={EVAL_STATUT_BG[ev.statut]} className="fw-normal text-capitalize">{ev.statut}</Badge>
                              : <Badge bg="secondary" className="fw-normal">En attente</Badge>}
                          </td>

                          {/* Actions */}
                          <td className="text-center" onClick={(e) => e.stopPropagation()}>
                            {!rowDisabled && (
                              <div className="d-flex gap-1 justify-content-center">
                                {ev && (
                                  <Button
                                    size="sm" variant="soft-info" title="Consulter l'évaluation"
                                    className="btn-icon rounded-circle"
                                    onClick={() => setEvalViewModal(ev)}
                                  >
                                    <IconifyIcon icon="tabler:eye" />
                                  </Button>
                                )}
                                {ev && ev.statut === 'brouillon' && (
                                  <Button
                                    size="sm" variant="soft-success" title="Modifier l'évaluation"
                                    className="btn-icon rounded-circle"
                                    onClick={() => setEvalEditModal(ev)}
                                  >
                                    <IconifyIcon icon="tabler:edit" />
                                  </Button>
                                )}
                              </div>
                            )}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot>
                    <tr className="table-primary">
                      <td colSpan={5} className="text-end fw-bold pe-3">
                        Coût total estimé de la campagne
                      </td>
                      <td className="text-center fw-bold">
                        {fmt(evals.reduce((sum, e) => sum + (e.coutGlobal ?? 0), 0))} FCFA
                      </td>
                      <td colSpan={2} />
                    </tr>
                  </tfoot>
                </Table>
              </div>
            )
          })()}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={() => setSommaireModal(null)}>Fermer</Button>
          {sommaireModal && (
            <Button
              variant="primary"
              disabled={evaluating === sommaireModal.id}
              onClick={() => doEvaluation(sommaireModal)}
            >
              {evaluating === sommaireModal.id
                ? <><span className="spinner-border spinner-border-sm me-1" />Évaluation en cours...</>
                : <><IconifyIcon icon="tabler:player-play" className="me-1" />Évaluer automatiquement</>}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ── Modal Consulter évaluation ────────────────────────────────────── */}
      <Modal show={!!evalViewModal} onHide={() => setEvalViewModal(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            <div>
              Évaluation — {evalViewModal ? (batimentMap.get(evalViewModal.batimentId)?.denomination ?? evalViewModal.batimentId) : ''}
            </div>
            <code className="text-muted" style={{ fontSize: '0.78rem' }}>{evalViewModal?.code}</code>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {evalViewModal && (() => {
            const bat = batimentMap.get(evalViewModal.batimentId)
            const cu  = evalViewModal.coefficientUsure
            return (
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <div className="text-muted small mb-2 fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>Informations</div>
                    <table className="table table-sm mb-0">
                      <tbody>
                        <tr><td className="text-muted">Bâtiment</td><td className="fw-medium">{bat?.denomination ?? evalViewModal.batimentId}</td></tr>
                        <tr><td className="text-muted">Code</td><td>{bat?.code ?? '—'}</td></tr>
                        <tr><td className="text-muted">Année réf.</td><td>{evalViewModal.anneeRef ?? '—'}</td></tr>
                        {evalViewModal.validateur ? (
                          <tr><td className="text-muted">Validateur</td><td className="fw-medium">{evalViewModal.validateur}</td></tr>
                        ) : (
                          <tr><td className="text-muted">Évaluateur</td><td className="fw-medium">{evalViewModal.evaluateur ?? '—'}</td></tr>
                        )}
                        {evalViewModal.dateValidation && (
                          <tr><td className="text-muted">Date validation</td><td>{evalViewModal.dateValidation}</td></tr>
                        )}
                        <tr>
                          <td className="text-muted">Statut</td>
                          <td>
                            <Badge bg={EVAL_STATUT_BG[evalViewModal.statut]} className="fw-normal text-capitalize">
                              {evalViewModal.statut}
                            </Badge>
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="border rounded p-3 h-100">
                    <div className="text-muted small mb-2 fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>Résultats calculés</div>
                    <table className="table table-sm mb-0">
                      <tbody>
                        <tr>
                          <td className="text-muted">Note Physique</td>
                          <td>{evalViewModal.notePhysique != null
                            ? <Badge bg={NOTE_BG(evalViewModal.notePhysique)}>{evalViewModal.notePhysique.toFixed(2)}</Badge>
                            : '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Note Fonctionnelle</td>
                          <td>{evalViewModal.noteFonctionnelle != null
                            ? <Badge bg={NOTE_BG(evalViewModal.noteFonctionnelle)}>{evalViewModal.noteFonctionnelle.toFixed(2)}</Badge>
                            : '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Note Technique</td>
                          <td>{evalViewModal.noteTechnique != null
                            ? <Badge bg={NOTE_BG(evalViewModal.noteTechnique)}>{evalViewModal.noteTechnique.toFixed(2)}</Badge>
                            : '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Coef. d&apos;usure</td>
                          <td>{cu != null
                            ? <Badge bg={CU_BG(cu)}>{cu.toFixed(1)} %</Badge>
                            : '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Coût global</td>
                          <td className="fw-semibold">{evalViewModal.coutGlobal != null ? `${fmt(evalViewModal.coutGlobal)} FCFA` : '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                    <div className="mt-3 text-end">
                      <a
                        href={`/evaluations/${evalViewModal.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="small"
                      >
                        <IconifyIcon icon="tabler:external-link" className="me-1" />
                        Consulter le détail du calcul
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            )
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setEvalViewModal(null)}>Fermer</Button>
          {evalViewModal?.statut === 'brouillon' && priv.canValidate && (
            <Button
              variant="success"
              disabled={validating === evalViewModal?.id}
              onClick={() => { handleValiderEval(evalViewModal!.id) }}
            >
              {validating === evalViewModal?.id
                ? <><span className="spinner-border spinner-border-sm me-1" />Validation...</>
                : <><IconifyIcon icon="tabler:circle-check" className="me-1" />Valider</>}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ── Modal Modifier évaluation ──────────────────────────────────────── */}
      <Modal
        show={!!evalEditModal}
        onHide={() => setEvalEditModal(null)}
        size="xl"
        centered
        scrollable
        fullscreen="lg-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Modifier l&apos;évaluation —{' '}
            <span className="fw-normal text-muted" style={{ fontSize: '0.9rem' }}>
              {evalEditModal ? (batimentMap.get(evalEditModal.batimentId)?.denomination ?? evalEditModal.batimentId) : ''}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {evalEditModal && (
            <EvaluationForm
              ref={formRef}
              {...formProps}
              initialData={evalEditModal}
              editId={evalEditModal.id}
              onSaved={handleEvalSaved}
              onCancel={() => setEvalEditModal(null)}
              onSavingChange={setFormSaving}
            />
          )}
        </Modal.Body>
        <Modal.Footer className="border-top">
          <Button variant="light" onClick={() => setEvalEditModal(null)}>Annuler</Button>
          {priv.canCreate && (
            <Button variant="primary" disabled={formSaving} onClick={() => formRef.current?.save()}>
              {formSaving
                ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
                : <><IconifyIcon icon="tabler:device-floppy" className="me-1" />Enregistrer</>}
            </Button>
          )}
          {evalEditModal?.statut === 'brouillon' && priv.canValidate && (
            <Button
              variant="success"
              disabled={validating === evalEditModal?.id}
              onClick={async () => { await handleValiderEval(evalEditModal!.id); setEvalEditModal(null) }}
            >
              {validating === evalEditModal?.id
                ? <><span className="spinner-border spinner-border-sm me-1" />Validation...</>
                : <><IconifyIcon icon="tabler:circle-check" className="me-1" />Valider</>}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}
