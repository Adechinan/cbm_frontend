/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useRef, useState } from 'react'
import Link from 'next/link'
import {
  Badge, Button, Card, CardBody, CardHeader, Modal, Pagination, Table,
} from 'react-bootstrap'
import {
  AleaClimatiqueType,
  BatimentType,
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
import { deleteEvaluation, validerEvaluation } from '@/services/batimentService'
import { fmt } from '@/utils/evaluationCalcul'
import { usePrivileges } from '@/hooks/usePrivileges'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import EvaluationForm, { EvaluationFormHandle } from '../nouveau/components/EvaluationForm'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUT_BG: Record<string, string> = {
  brouillon: 'warning',
  validé: 'success',
}

const CU_BG = (cu: number) => cu >= 45 ? 'danger' : cu >= 20 ? 'warning' : 'success'

const PAGE_SIZE = 10
type SortCol = 'batiment' | 'cu' | 'cout' | 'statut'
type SortDir = 'asc' | 'desc'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
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

export default function EvaluationList({
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
  const [evaluations, setEvaluations] = useState<EvaluationType[]>(evaluationsInit)
  const [editModal, setEditModal] = useState<EvaluationType | null>(null)
  const [viewModal, setViewModal] = useState<EvaluationType | null>(null)
  const [validating, setValidating] = useState<string | null>(null)
  const [deleting, setDeleting] = useState<string | null>(null)
  const [formSaving, setFormSaving] = useState(false)
  const formRef = useRef<EvaluationFormHandle>(null)

  const [sortCol, setSortCol] = useState<SortCol | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage] = useState(1)

  const batimentMap = new Map(batiments.map((b) => [b.id, b]))

  const formProps = {
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
  }

  const handleSaved = (updated: EvaluationType) => {
    setEvaluations((prev) =>
      prev.map((e) => e.id === updated.id ? { ...e, ...updated } : e)
    )
  }

  const handleValider = async (id: string) => {
    setValidating(id)
    try {
      const updated = await validerEvaluation(id)
      setEvaluations((prev) => prev.map((e) => e.id === id ? { ...e, statut: updated.statut } : e))
    } finally {
      setValidating(null)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette évaluation ? Cette action est irréversible.')) return
    setDeleting(id)
    try {
      await deleteEvaluation(id)
      setEvaluations((prev) => prev.filter((e) => e.id !== id))
    } finally {
      setDeleting(null)
    }
  }

  // ── Tri ──────────────────────────────────────────────────────────────────────
  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = [...evaluations].sort((a, b) => {
    if (!sortCol) return 0
    const batA = batimentMap.get(a.batimentId) ?? a.batiment
    const batB = batimentMap.get(b.batimentId) ?? b.batiment
    let av: number | string
    let bv: number | string
    switch (sortCol) {
      case 'batiment':
        av = (batA?.denomination ?? a.batimentId).toLowerCase()
        bv = (batB?.denomination ?? b.batimentId).toLowerCase()
        break
      case 'cu':
        av = a.coefficientUsure ?? -Infinity
        bv = b.coefficientUsure ?? -Infinity
        break
      case 'cout':
        av = a.coutGlobal ?? -Infinity
        bv = b.coutGlobal ?? -Infinity
        break
      case 'statut':
        av = a.statut
        bv = b.statut
        break
      default:
        return 0
    }
    if (av < bv) return sortDir === 'asc' ? -1 : 1
    if (av > bv) return sortDir === 'asc' ? 1 : -1
    return 0
  })

  const totalPages = Math.max(1, Math.ceil(sorted.length / PAGE_SIZE))
  const paginated = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

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

  // Icône de tri inline
  const sortIcon = (col: SortCol) => {
    if (sortCol !== col) return <IconifyIcon icon="tabler:arrows-sort" className="text-muted opacity-50 ms-1" style={{ fontSize: '0.85rem' }} />
    return sortDir === 'asc'
      ? <IconifyIcon icon="tabler:sort-ascending" className="text-primary ms-1" style={{ fontSize: '0.85rem' }} />
      : <IconifyIcon icon="tabler:sort-descending" className="text-primary ms-1" style={{ fontSize: '0.85rem' }} />
  }

  return (
    <>
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div className="d-flex align-items-center gap-2">
            <h5 className="card-title mb-0">Évaluations</h5>
            <Badge bg="secondary" className="fw-normal">
              {evaluations.length} évaluation{evaluations.length !== 1 ? 's' : ''}
            </Badge>
          </div>
          {priv.canCreate && (
            <Link href="/evaluations/nouveau">
              <Button variant="primary" size="sm">
                <IconifyIcon icon="tabler:plus" className="me-1" />
                Nouvelle évaluation
              </Button>
            </Link>
          )}
        </CardHeader>
        <CardBody className="p-0">
          {evaluations.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="tabler-clipboard-x" style={{ fontSize: '2rem' }} />
              <p className="mt-2 mb-0">Aucune évaluation enregistrée.</p>
            </div>
          ) : (
            <div className="overflow-auto">
              <Table hover className="align-middle mb-0" style={{ minWidth: 1100 }}>
                <thead className="table-light">
                  <tr>
                    <th style={{ width: '16%' }}>Code Évaluation</th>
                    <th
                      style={{ width: '20%', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('batiment')}
                    >
                      Bâtiment{sortIcon('batiment')}
                    </th>
                    <th className="text-center" style={{ width: '9%' }}>État Physique</th>
                    <th className="text-center" style={{ width: '9%' }}>État Fonctionnel</th>
                    <th className="text-center" style={{ width: '9%' }}>État Technique</th>
                    <th
                      className="text-center"
                      style={{ width: '9%', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('cu')}
                    >
                      Coef. d&apos;usure{sortIcon('cu')}
                    </th>
                    <th
                      className="text-center"
                      style={{ width: '13%', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('cout')}
                    >
                      Coût global (FCFA){sortIcon('cout')}
                    </th>
                    <th
                      className="text-center"
                      style={{ width: '8%', cursor: 'pointer', userSelect: 'none' }}
                      onClick={() => handleSort('statut')}
                    >
                      Statut{sortIcon('statut')}
                    </th>
                    <th className="text-center" style={{ width: '8%' }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map((e) => {
                    const bat = batimentMap.get(e.batimentId) ?? e.batiment
                    const isDeleting = deleting === e.id

                    return (
                      <tr key={e.id}>
                        {/* Code évaluation */}
                        <td>
                          <code
                            className="text-muted"
                            style={{ fontSize: '0.72rem' }}
                            title={e.code}
                          >
                            {/* {e.code.length > 12 ? `${e.code.slice(0, 12)}…` : e.code} */}
                            {e.code}
                          </code>
                        </td>

                        {/* Bâtiment */}
                        <td>
                          <div className="fw-medium" style={{ fontSize: '0.87rem' }}>
                            {bat?.denomination ?? e.batimentId}
                          </div>
                          <div className="text-muted" style={{ fontSize: '0.75rem' }}>{bat?.code}</div>
                        </td>

                        {/* Date */}
                        {/* <td className="small">{e.date}</td> */}

                        {/* Note état physique */}
                        <td className="text-center">
                          {e.notePhysique != null ? (
                            <Badge
                              bg={e.notePhysique >= 2 ? 'success' : e.notePhysique >= 1 ? 'warning' : 'danger'}
                              className="fw-semibold"
                            >
                              {e.notePhysique.toFixed(2)}
                            </Badge>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>

                        {/* Note état fonctionnel */}
                        <td className="text-center">
                          {e.noteFonctionnelle != null ? (
                            <Badge
                              bg={e.noteFonctionnelle >= 2 ? 'success' : e.noteFonctionnelle >= 1 ? 'warning' : 'danger'}
                              className="fw-semibold"
                            >
                              {e.noteFonctionnelle.toFixed(2)}
                            </Badge>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>

                        {/* Note état technique */}
                        <td className="text-center">
                          {e.noteTechnique != null ? (
                            <Badge
                              bg={e.noteTechnique >= 2 ? 'success' : e.noteTechnique >= 1 ? 'warning' : 'danger'}
                              className="fw-semibold"
                            >
                              {e.noteTechnique.toFixed(2)}
                            </Badge>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>

                        {/* Coef d'usure */}
                        <td className="text-center">
                          {e.coefficientUsure != null ? (
                            <Badge bg={CU_BG(e.coefficientUsure)} className="fw-semibold">
                              {e.coefficientUsure.toFixed(1)}&nbsp;%
                            </Badge>
                          ) : (
                            <span className="text-muted small">—</span>
                          )}
                        </td>

                        {/* Coût global */}
                        <td className="text-center fw-semibold" style={{ fontSize: '0.85rem' }}>
                          {e.coutGlobal != null
                            ? fmt(e.coutGlobal)
                            : <span className="text-muted fw-normal small">—</span>}
                        </td>

                        {/* Statut */}
                        <td className="text-center">
                          <Badge bg={STATUT_BG[e.statut]} className="fw-normal text-capitalize">
                            {e.statut}
                          </Badge>
                        </td>

                        {/* Actions */}
                        <td className="text-center">
                          <div className="d-flex gap-1 justify-content-center">
                            {/* Consulter */}
                            <Button
                              size="sm" variant="soft-info" title="Consulter"
                              className="btn-icon rounded-circle"
                              onClick={() => setViewModal(e)}
                            >
                              <IconifyIcon icon="tabler:eye" />
                            </Button>

                            {/* Modifier (brouillon + canCreate) */}
                            {e.statut === 'brouillon' && priv.canCreate && (
                              <Button
                                size="sm" variant="soft-success" title="Modifier"
                                className="btn-icon rounded-circle"
                                onClick={() => setEditModal(e)}
                              >
                                <IconifyIcon icon="tabler:edit" />
                              </Button>
                            )}

                            {/* Valider (brouillon uniquement) */}
                            {/* {e.statut === 'brouillon' && (
                              <Button
                                size="sm" variant="soft-success" title="Valider"
                                className="btn-icon rounded-circle"
                                disabled={validating === e.id}
                                onClick={() => handleValider(e.id)}
                              >
                                {validating === e.id
                                  ? <span className="spinner-border spinner-border-sm" />
                                  : <IconifyIcon icon="tabler:circle-check" />}
                              </Button>
                            )} */}

                            {/* Supprimer (brouillon + canCreate) */}
                            {priv.canCreate && (
                              <Button
                                size="sm" variant="soft-danger"
                                title={e.statut === 'validé' ? 'Impossible de supprimer une évaluation validée' : 'Supprimer'}
                                disabled={e.statut === 'validé' || isDeleting}
                                className="btn-icon rounded-circle"
                                onClick={() => handleDelete(e.id)}
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

          {/* ── Pagination ─────────────────────────────────────────────────── */}
          {totalPages > 1 && (
            <div className="d-flex align-items-center justify-content-between px-3 py-2 border-top">
              <small className="text-muted">
                {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, sorted.length)} sur {sorted.length}
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

      {/* ── Modal Consulter ───────────────────────────────────────────────── */}
      <Modal show={!!viewModal} onHide={() => setViewModal(null)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>
            Évaluation&nbsp;—&nbsp;{viewModal?.batiment?.denomination ?? viewModal?.batimentId}&nbsp;
            <br />
            <code className="text-muted" style={{ fontSize: '0.8rem' }}>{viewModal?.code}</code>

          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewModal && (() => {
            const bat = batimentMap.get(viewModal.batimentId) ?? viewModal.batiment
            const cu = viewModal.coefficientUsure
            return (
              <div className="row g-3">
                <div className="col-md-6">
                  <div className="border rounded p-3">
                    <div className="text-muted small mb-2 fw-semibold text-uppercase" style={{ letterSpacing: 1 }}>Informations</div>
                    <table className="table table-sm mb-0">
                      <tbody>
                        <tr><td className="text-muted">Bâtiment</td><td className="fw-medium">{bat?.denomination ?? viewModal.batimentId}</td></tr>
                        <tr><td className="text-muted">Bâtiment Code</td><td>{bat?.code ?? '—'}</td></tr>
                        {/* <tr><td className="text-muted">Évaluateur</td><td>{viewModal.evaluateur ?? '—'}</td></tr> */}

                        {viewModal.validateur ? (
                          <tr>
                            <td className="text-muted">Validateur</td>
                            <td className="fw-medium">{viewModal.validateur}</td>
                          </tr>
                        ) : (
                          <tr>
                            <td className="text-muted">Évaluateur</td>
                            <td className="fw-medium">{viewModal.evaluateur ?? '—'}</td>
                          </tr>
                        )}

                        {viewModal.dateValidation && (
                          <tr><td className="text-muted">Date de validation</td><td>{viewModal.dateValidation}</td></tr>
                        )}
                        <tr>
                          <td className="text-muted">Statut</td>
                          <td>
                            <Badge bg={STATUT_BG[viewModal.statut]} className="fw-normal text-capitalize">
                              {viewModal.statut}
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
                          <td>{viewModal.notePhysique != null
                            ? <Badge bg={viewModal.notePhysique >= 2 ? 'success' : viewModal.notePhysique >= 1 ? 'warning' : 'danger'}>{viewModal.notePhysique.toFixed(2)}</Badge>
                            : '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Note Fonctionnelle</td>
                          <td>{viewModal.noteFonctionnelle != null
                            ? <Badge bg={viewModal.noteFonctionnelle >= 2 ? 'success' : viewModal.noteFonctionnelle >= 1 ? 'warning' : 'danger'}>{viewModal.noteFonctionnelle.toFixed(2)}</Badge>
                            : '—'}</td>
                        </tr>
                        <tr>
                          <td className="text-muted">Note Technique</td>
                          <td>{viewModal.noteTechnique != null
                            ? <Badge bg={viewModal.noteTechnique >= 2 ? 'success' : viewModal.noteTechnique >= 1 ? 'warning' : 'danger'}>{viewModal.noteTechnique.toFixed(2)}</Badge>
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
                          <td className="fw-semibold">{viewModal.coutGlobal != null ? `${fmt(viewModal.coutGlobal)} FCFA` : '—'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )
          })()}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={() => setViewModal(null)}>Fermer</Button>
          {viewModal?.statut === 'brouillon' && (
            <Button
              variant="success"
              disabled={validating === viewModal?.id}
              onClick={() => { handleValider(viewModal!.id); setViewModal(null) }}
            >
              <IconifyIcon icon="tabler:circle-check" className="me-1" />Valider
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      {/* ── Modal Modifier — contient EvaluationForm ─────────────────────── */}
      <Modal
        show={!!editModal}
        onHide={() => setEditModal(null)}
        size="xl"
        centered
        scrollable
        fullscreen="lg-down"
      >
        <Modal.Header closeButton>
          <Modal.Title>
            Modifier l&apos;évaluation —&nbsp;
            <span className="fw-normal text-muted" style={{ fontSize: '0.9rem' }}>
              {editModal ? (batimentMap.get(editModal.batimentId)?.denomination ?? editModal.batimentId) : ''}
            </span>&nbsp;
            {editModal && (<Badge bg={STATUT_BG[editModal.statut]} className="fw-normal text-capitalize me-1">
              {editModal.statut}
            </Badge>)}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {editModal && (
            <EvaluationForm
              ref={formRef}
              {...formProps}
              initialData={editModal}
              editId={editModal.id}
              onSaved={(updated) => {
                handleSaved(updated)
                setEditModal(null)
              }}
              onCancel={() => setEditModal(null)}
              onSavingChange={setFormSaving}
            />
          )}
        </Modal.Body>

        <Modal.Footer className="border-top">
          {/* Annuler */}
          <Button variant="light" onClick={() => setEditModal(null)}>
            Annuler
          </Button>

          {/* Enregistrer (canCreate) */}
          {priv.canCreate && (
            <Button
              variant="primary"
              disabled={formSaving}
              onClick={() => formRef.current?.save()}
            >
              {formSaving
                ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
                : <><IconifyIcon icon="tabler:device-floppy" className="me-1" />Enregistrer</>}
            </Button>
          )}

          {/* Valider (brouillon + canValidate) */}
          {editModal?.statut === 'brouillon' && priv.canValidate && (
            <Button
              variant="success"
              disabled={validating === editModal?.id}
              onClick={async () => {
                await handleValider(editModal!.id)
                setEditModal(null)
              }}
            >
              {validating === editModal?.id
                ? <><span className="spinner-border spinner-border-sm me-1" />Validation...</>
                : <><IconifyIcon icon="tabler:circle-check" className="me-1" />Valider</>}
            </Button>
          )}
        </Modal.Footer>
      </Modal>
    </>
  )
}
