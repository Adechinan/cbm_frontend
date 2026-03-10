/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import {
  Badge, Button, Card, CardBody, CardHeader,
  Col, Form, Modal, Nav, Pagination, Row, Table, Tab,
} from 'react-bootstrap'
import Link from 'next/link'
import { BatimentType, CritereEvaluationType, RecensementType } from '@/types/entretien-batiment'
import { deleteRecensement, updateRecensement, validerRecensement } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import FonctionnelGroupedForm from '../../components/FonctionnelGroupedForm'
import TechniqueGroupedForm from '../../components/TechniqueGroupedForm'

// ─── Constantes ───────────────────────────────────────────────────────────────

const STATUT_BG: Record<string, string> = {
  brouillon: 'warning',
  validé:    'success',
}

const ETATS_COULEUR: Record<string, string> = {
  Bon: 'success', Passable: 'warning', Mauvais: 'danger', Dangereux: 'dark', 'Non évalué': 'secondary',
}

const PAGE_SIZE = 10
type SortCol = 'batiment' | 'date' | 'statut'
type SortDir = 'asc' | 'desc'

// ─── Types locaux ─────────────────────────────────────────────────────────────

type EvalFonc = RecensementType['criteresFonctionnels'][number]
type EvalTech = RecensementType['criteresTechniques'][number]

type Props = {
  recensementsInit:     RecensementType[]
  batiments:            BatimentType[]
  criteresFonctionnels: CritereEvaluationType[]
  criteresTechniques:   CritereEvaluationType[]
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function resumeEtats(criteres: { etat: string }[]): Record<string, number> {
  const counts: Record<string, number> = {}
  for (const c of criteres) counts[c.etat] = (counts[c.etat] ?? 0) + 1
  return counts
}

function EtatsBadges({ counts }: { counts: Record<string, number> }) {
  return (
    <div className="d-flex flex-wrap gap-1">
      {Object.entries(counts).map(([etat, n]) => (
        <Badge key={etat} bg={ETATS_COULEUR[etat] ?? 'secondary'} className="fw-normal" style={{ fontSize: '0.7rem' }}>
          {etat} ({n})
        </Badge>
      ))}
    </div>
  )
}

// ─── Modal ────────────────────────────────────────────────────────────────────

function RecensementModal({
  show, onHide, recensement, mode,
  criteresFonctionnels, criteresTechniques,
  onValider, validating, onSaved,
}: {
  show: boolean
  onHide: () => void
  recensement: RecensementType | null
  mode: 'view' | 'edit'
  criteresFonctionnels: CritereEvaluationType[]
  criteresTechniques:   CritereEvaluationType[]
  onValider: (id: string) => void
  validating: boolean
  onSaved: (r: RecensementType) => void
}) {
  const [activeTab, setActiveTab] = useState('fonctionnel')
  const [editFonc, setEditFonc]   = useState<EvalFonc[]>([])
  const [editTech, setEditTech]   = useState<EvalTech[]>([])
  const [saving, setSaving]       = useState(false)

  // Réinitialise l'état éditable à chaque ouverture
  useEffect(() => {
    if (recensement) {
      setEditFonc(
        recensement.criteresFonctionnels.map((c) => ({
          ...c,
          etat: c.etat ?? 'Non évalué',
          commentaire: c.commentaire ?? '',
        }))
      )
      setEditTech(
        recensement.criteresTechniques.map((c) => ({
          ...c,
          nature: c.nature ?? '',
          constat: c.constat ?? '',
          etat: c.etat ?? 'Non évalué',
        }))
      )
      setActiveTab('fonctionnel')
    }
  }, [recensement])

  if (!recensement) return null

  const isBrouillon  = recensement.statut === 'brouillon'
  const isEdit       = mode === 'edit'
  const hasNonEvalue = editFonc.some((e) => e.etat === 'Non évalué') || editTech.some((e) => e.etat === 'Non évalué')

  // Index : elementId → { libelle, section, etatsDisponibles }
  const mapFonc = new Map(
    criteresFonctionnels.flatMap((s) =>
      s.elements.map((e) => [e.id, { libelle: e.libelle, section: s.section, etats: e.etatsDisponibles }])
    )
  )
  const mapTech = new Map(
    criteresTechniques.flatMap((s) =>
      s.elements.map((e) => [e.id, { libelle: e.libelle, section: s.section, etats: e.etatsDisponibles }])
    )
  )
  const groupedEditFonc = criteresFonctionnels
    .map((critere) => ({
      critereId: critere.id,
      section: critere.section,
      rows: editFonc.filter((item) => item.critereId === critere.id),
    }))
    .filter((group) => group.rows.length > 0)
  const groupedEditTech = criteresTechniques
    .map((critere) => ({
      critereId: critere.id,
      section: critere.section,
      rows: editTech.filter((item) => item.critereId === critere.id),
    }))
    .filter((group) => group.rows.length > 0)

  const handleSave = async () => {
    setSaving(true)
    try {
      const updated = await updateRecensement(recensement.id, {
        criteresFonctionnels: editFonc,
        criteresTechniques:   editTech,
      })
      onSaved(updated)
      onHide()
    } finally {
      setSaving(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? 'Modifier' : 'Consulter'} — {recensement.batiment?.denomination ?? recensement.batimentId}
          <Badge bg={STATUT_BG[recensement.statut]} className="ms-2 fw-normal" style={{ fontSize: '0.75rem' }}>
            {recensement.statut}
          </Badge>
          <div className="font-monospace text-muted fw-normal mt-1" style={{ fontSize: '0.75rem' }}>
            {recensement.code}
          </div>
        </Modal.Title>
      </Modal.Header>

      <Modal.Body>
        {/* Infos générales */}
        {/* <Row className="mb-3 g-2 small text-muted">
          <Col xs="auto"><i className="tabler-calendar me-1" />{recensement.date}</Col>
          {recensement.evaluateur && <Col xs="auto"><i className="tabler-user me-1" />{recensement.evaluateur}</Col>}
        </Row> */}

        <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k ?? 'fonctionnel')}>
          <Nav variant="tabs" className="mb-3">
            <Nav.Item><Nav.Link eventKey="fonctionnel">État Fonctionnel</Nav.Link></Nav.Item>
            {/* <Nav.Item><Nav.Link eventKey="fonctionnel">État Fonctionnel ({editFonc.length})</Nav.Link></Nav.Item> */}
            <Nav.Item><Nav.Link eventKey="technique">État Technique</Nav.Link></Nav.Item>
            {/* <Nav.Item><Nav.Link eventKey="technique">État Technique ({editTech.length})</Nav.Link></Nav.Item> */}
          </Nav>

          <Tab.Content>
            {/* ── Fonctionnel ── */}
            <Tab.Pane eventKey="fonctionnel">
              <FonctionnelGroupedForm
                groups={groupedEditFonc}
                mapFonc={mapFonc}
                etatsCouleur={ETATS_COULEUR}
                isEdit={isEdit}
                onChangeEtat={(critereId, elementId, value) => {
                  setEditFonc((prev) =>
                    prev.map((x) =>
                      x.critereId === critereId && x.elementId === elementId
                        ? { ...x, etat: value }
                        : x
                    )
                  )
                }}
                onChangeCommentaire={(critereId, elementId, value) => {
                  setEditFonc((prev) =>
                    prev.map((x) =>
                      x.critereId === critereId && x.elementId === elementId
                        ? { ...x, commentaire: value }
                        : x
                    )
                  )
                }}
              />
            </Tab.Pane>

            {/* ── Technique ── */}
            <Tab.Pane eventKey="technique">
              <TechniqueGroupedForm
                groups={groupedEditTech}
                mapTech={mapTech}
                etatsCouleur={ETATS_COULEUR}
                isEdit={isEdit}
                onChangeEtat={(critereId, elementId, value) => {
                  setEditTech((prev) =>
                    prev.map((x) =>
                      x.critereId === critereId && x.elementId === elementId
                        ? { ...x, etat: value }
                        : x
                    )
                  )
                }}
                // onChangeNature={(critereId, elementId, value) => {
                //   setEditTech((prev) =>
                //     prev.map((x) =>
                //       x.critereId === critereId && x.elementId === elementId
                //         ? { ...x, nature: value }
                //         : x
                //     )
                //   )
                // }}
                onChangeConstat={(critereId, elementId, value) => {
                  setEditTech((prev) =>
                    prev.map((x) =>
                      x.critereId === critereId && x.elementId === elementId
                        ? { ...x, constat: value }
                        : x
                    )
                  )
                }}
              />
            </Tab.Pane>
          </Tab.Content>
        </Tab.Container>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={onHide}>Annuler</Button>

        {/* Sauvegarder — visible uniquement en mode édition */}
        {isEdit && (
          <Button variant="primary" disabled={saving} onClick={handleSave}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
              : <><IconifyIcon icon="tabler:device-floppy" className="me-1" />Enregistrer</>}
          </Button>
        )}

        {/* Valider — visible si brouillon (peu importe le mode) */}
        {isBrouillon && (
          <Button
            variant="success"
            disabled={validating || hasNonEvalue}
            onClick={() => { onValider(recensement.id); onHide() }}
          >
            {validating
              ? <><span className="spinner-border spinner-border-sm me-1" />Validation...</>
              : <><IconifyIcon icon="tabler:circle-check" className="me-1" />Valider</>}
          </Button>
        )}

      </Modal.Footer>
    </Modal>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

export default function RecensementList({
  recensementsInit, batiments, criteresFonctionnels, criteresTechniques,
}: Props) {
   // enrichit les recensements avec les données de bâtiment pour affichage
  recensementsInit.forEach((r) => {r.batiment = batiments.find((b) => b.id === r.batimentId)})
  
  const [recensements, setRecensements] = useState<RecensementType[]>(recensementsInit)
  const [modal, setModal]               = useState<{ rec: RecensementType; mode: 'view' | 'edit' } | null>(null)
  const [validating, setValidating]     = useState<string | null>(null)
  const [deleting, setDeleting]         = useState<string | null>(null)

  const [sortCol, setSortCol] = useState<SortCol | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage]       = useState(1)

  const batimentMap = new Map(batiments.map((b) => [b.id, b]))

  const openModal = (rec: RecensementType, mode: 'view' | 'edit') => setModal({ rec, mode })

  const handleValider = async (id: string) => {
    setValidating(id)
    try {
      const updated = await validerRecensement(id)
      setRecensements((prev) => prev.map((r) => r.id === id ? { ...r, statut: updated.statut } : r))
    } finally {
      setValidating(null)
    }
  }

  const handleSaved = (updated: RecensementType) => {
    setRecensements((prev) => prev.map((r) => r.id === updated.id ? { ...r, ...updated } : r))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce recensement ? Cette action est irréversible.')) return
    setDeleting(id)
    try {
      await deleteRecensement(id)
      setRecensements((prev) => prev.filter((r) => r.id !== id))
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

  const sorted = [...recensements].sort((a, b) => {
    if (!sortCol) return 0
    const batA = batimentMap.get(a.batimentId) ?? a.batiment
    const batB = batimentMap.get(b.batimentId) ?? b.batiment
    let av: string
    let bv: string
    switch (sortCol) {
      case 'batiment':
        av = (batA?.denomination ?? a.batimentId).toLowerCase()
        bv = (batB?.denomination ?? b.batimentId).toLowerCase()
        break
      case 'date':
        av = a.date
        bv = b.date
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
  const paginated  = sorted.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const getPageNums = (): (number | null)[] => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1)
    const range = new Set([1, totalPages, page - 1, page, page + 1].filter((p) => p >= 1 && p <= totalPages))
    const nums  = [...range].sort((a, b) => a - b)
    const result: (number | null)[] = []
    for (let i = 0; i < nums.length; i++) {
      if (i > 0 && nums[i] - nums[i - 1] > 1) result.push(null)
      result.push(nums[i])
    }
    return result
  }

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
            <h5 className="card-title mb-0">Recensements</h5>
            <Badge bg="secondary" className="fw-normal">{recensements.length} recensement{recensements.length !== 1 ? 's' : ''}</Badge>
          </div>
          <Link href="/batiments/recensements/nouveau">
            <Button variant="primary" size="sm">
              <IconifyIcon icon="tabler:plus" className="me-1" />
              Nouveau recensement
            </Button>
          </Link>
        </CardHeader>
        <CardBody className="p-0">
          {recensements.length === 0 ? (
            <div className="text-center text-muted py-5">
              <i className="tabler-clipboard-x" style={{ fontSize: '2rem' }} />
              <p className="mt-2 mb-0">Aucun recensement enregistré.</p>
            </div>
          ) : (
            <Table hover responsive className="align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th style={{ width: '18%' }}>Code</th>
                  <th style={{ width: '32%', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('batiment')}>
                    Bâtiment{sortIcon('batiment')}
                  </th>
                  <th style={{ width: '10%', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('date')}>
                    Date{sortIcon('date')}
                  </th>
                  {/* <th style={{ width: '14%' }}>Évaluateur</th> */}
                  <th style={{ width: '10%' }}>Fonctionnel</th>
                  <th style={{ width: '10%' }}>Technique</th>
                  <th style={{ width: '9%', cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('statut')}>
                    Statut{sortIcon('statut')}
                  </th>
                  <th style={{ width: '11%' }} className="text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((r) => {
                  const bat        = batimentMap.get(r.batimentId) ?? r.batiment
                  const countsFonc = resumeEtats(r.criteresFonctionnels)
                  const countsTech = resumeEtats(r.criteresTechniques)
                  const isDeleting = deleting === r.id

                  return (
                    <tr key={r.id}>
                      <td>
                        <span className="font-monospace small fw-medium text-primary">{r.code}</span>
                      </td>
                      <td>
                        <div className="fw-medium" style={{ fontSize: '0.87rem' }}>
                          {bat?.denomination ?? r.batimentId}
                        </div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>{bat?.code}</div>
                        <div className="text-muted" style={{ fontSize: '0.75rem' }}>Recenseur : {r.evaluateur ?? '—'}</div>
                      </td>
                      <td className="small">{r.date}</td>
                      {/* <td className="small">{r.evaluateur ?? '—'}</td> */}
                      <td><EtatsBadges counts={countsFonc} /></td>
                      <td><EtatsBadges counts={countsTech} /></td>
                      <td>
                        <Badge bg={STATUT_BG[r.statut]} className="fw-normal text-capitalize">
                          {r.statut}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <div className="d-flex gap-1 justify-content-center">
                          {/* Consulter */}
                          <Button size="sm" variant="soft-info" title="Consulter"
                            className="btn-icon rounded-circle"
                            onClick={() => openModal(r, 'view')}
                          >
                            <IconifyIcon icon="tabler:eye" />
                          </Button>

                          {/* Modifier — seulement si brouillon */}
                          {r.statut === 'brouillon' && (
                            <Button size="sm" variant="soft-success" title="Modifier"
                              className="btn-icon rounded-circle"
                              onClick={() => openModal(r, 'edit')}
                            >
                              <IconifyIcon icon="tabler:edit" />
                            </Button>
                          )}

                          {/* Supprimer — désactivé si validé */}
                          {/* <Button size="sm" variant="soft-danger"
                            title={r.statut === 'validé' ? 'Impossible de supprimer un recensement validé' : 'Supprimer'}
                            disabled={r.statut === 'validé' || isDeleting}
                            className="btn-icon rounded-circle"
                            onClick={() => handleDelete(r.id)}
                          >
                            {isDeleting
                              ? <span className="spinner-border spinner-border-sm" />
                              : <IconifyIcon icon="tabler:trash" />}
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </Table>
          )}

          {totalPages > 1 && (
            <div className="d-flex justify-content-end px-3 py-2">
              <Pagination size="sm" className="mb-0">
                <Pagination.Prev disabled={page === 1} onClick={() => setPage((p) => p - 1)} />
                {getPageNums().map((n, i) =>
                  n === null
                    ? <Pagination.Ellipsis key={`e${i}`} disabled />
                    : <Pagination.Item key={n} active={n === page} onClick={() => setPage(n)}>{n}</Pagination.Item>
                )}
                <Pagination.Next disabled={page === totalPages} onClick={() => setPage((p) => p + 1)} />
              </Pagination>
            </div>
          )}
        </CardBody>
      </Card>

      {/* Modal consultation / édition / validation */}
      <RecensementModal
        show={!!modal}
        onHide={() => setModal(null)}
        recensement={modal?.rec ?? null}
        mode={modal?.mode ?? 'view'}
        criteresFonctionnels={criteresFonctionnels}
        criteresTechniques={criteresTechniques}
        onValider={handleValider}
        validating={modal ? validating === modal.rec.id : false}
        onSaved={handleSaved}
      />
    </>
  )
}
