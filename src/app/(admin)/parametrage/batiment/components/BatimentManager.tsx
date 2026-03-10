/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Accordion, Badge, Button, Card, CardBody, CardHeader, Col, Modal, Pagination, Row, Table } from 'react-bootstrap'
import { BatimentType, SectionFicheType, ZoneClimatiqueType } from '@/types/entretien-batiment'
import { deleteBatiment } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import BatimentModal from './BatimentModal'

const PAGE_SIZE = 10
type SortCol = 'denomination' | 'organisme' | 'departement' | 'commune' | 'type' | 'statut'
type SortDir = 'asc' | 'desc'

const STATUT_BG: Record<string, string> = {
  'Actif':      'success',
  'En travaux': 'warning',
  'Fermé':      'danger',
  'Inactif':    'secondary',
}

const TYPE_LABEL: Record<string, string> = {
  villa_rdc:      'Villa / RDC',
  batiment_etage: 'Immeuble',
  autre:          'Autre',
}

type Props = {
  batimentsInit: BatimentType[]
  sections: SectionFicheType[]
  zonesClimatiques: ZoneClimatiqueType[]
}

export default function BatimentManager({ batimentsInit, sections, zonesClimatiques }: Props) {
  const [batiments, setBatiments]       = useState<BatimentType[]>(batimentsInit)
  const [showModal,    setShowModal]    = useState(false)
  const [editBatiment, setEditBatiment] = useState<BatimentType | null>(null)
  const [viewBatiment, setViewBatiment] = useState<BatimentType | null>(null)

  const [sortCol, setSortCol] = useState<SortCol | null>(null)
  const [sortDir, setSortDir] = useState<SortDir>('asc')
  const [page, setPage]       = useState(1)

  const handleSort = (col: SortCol) => {
    if (sortCol === col) {
      setSortDir((d) => d === 'asc' ? 'desc' : 'asc')
    } else {
      setSortCol(col)
      setSortDir('asc')
    }
    setPage(1)
  }

  const sorted = [...batiments].sort((a, b) => {
    if (!sortCol) return 0
    let av: string
    let bv: string
    switch (sortCol) {
      case 'denomination': av = (a.denomination ?? '').toLowerCase(); bv = (b.denomination ?? '').toLowerCase(); break
      case 'organisme':    av = (a.organisme ?? '').toLowerCase();    bv = (b.organisme ?? '').toLowerCase();    break
      case 'departement':  av = (a.departement ?? '').toLowerCase();  bv = (b.departement ?? '').toLowerCase();  break
      case 'commune':      av = (a.commune ?? '').toLowerCase();      bv = (b.commune ?? '').toLowerCase();      break
      case 'type':         av = (TYPE_LABEL[a.typeConstruction] ?? a.typeConstruction ?? '').toLowerCase(); bv = (TYPE_LABEL[b.typeConstruction] ?? b.typeConstruction ?? '').toLowerCase(); break
      case 'statut':       av = (a.statutConstruction ?? '').toLowerCase(); bv = (b.statutConstruction ?? '').toLowerCase(); break
      default:             return 0
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

  const openAdd  = () => { setEditBatiment(null); setShowModal(true) }
  const openEdit = (b: BatimentType) => { setEditBatiment(b); setShowModal(true) }
  const openView = (b: BatimentType) => setViewBatiment(b)

  const handleSaved = (saved: BatimentType) => {
    setBatiments((prev) => {
      const exists = prev.find((b) => b.id === saved.id)
      return exists ? prev.map((b) => (b.id === saved.id ? saved : b)) : [...prev, saved]
    })
    setShowModal(false)
    setEditBatiment(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce bâtiment et toutes ses évaluations ?')) return
    await deleteBatiment(id)
    setBatiments((prev) => prev.filter((b) => b.id !== id))
  }

  return (
    <>
      <Card className="mb-3">
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0">Liste des bâtiments</h5>
            <p className="text-muted small mb-0 mt-1">
              {batiments.length} bâtiment{batiments.length !== 1 ? 's' : ''} enregistré{batiments.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="success" size="sm" onClick={openAdd}>
            <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter un bâtiment
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div style={{ overflowX: 'auto' }}>
            <Table hover className="align-middle mb-0 table-sm" style={{ minWidth: 860 }}>
              <thead className="table-light">
                <tr>
                  <th className="ps-3" style={{ width: 130 }}>Code</th>
                  <th style={{ minWidth: 210, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('denomination')}>
                    Dénomination{sortIcon('denomination')}
                  </th>
                  <th style={{ minWidth: 160, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('organisme')}>
                    Organisme{sortIcon('organisme')}
                  </th>
                  <th style={{ width: 120, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('departement')}>
                    Département{sortIcon('departement')}
                  </th>
                  <th style={{ width: 120, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('commune')}>
                    Commune{sortIcon('commune')}
                  </th>
                  <th className="text-center" style={{ width: 110, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('type')}>
                    Type constr.{sortIcon('type')}
                  </th>
                  <th className="text-center" style={{ width: 90, cursor: 'pointer', userSelect: 'none' }} onClick={() => handleSort('statut')}>
                    Statut{sortIcon('statut')}
                  </th>
                  <th className="text-center pe-3" style={{ width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((b) => (
                  <tr key={b.id}>
                    <td className="ps-3">
                      {/* <span className="fw-semibold text-primary" style={{ fontSize: '0.82rem' }}>{b.codeBatiment || '—'}</span> */}
                      <div className="text-muted font-monospace" style={{ fontSize: '0.72rem' }}>{b.code}</div>
                    </td>
                    <td>
                      <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{b.denomination}</span>
                    </td>
                    <td className="text-muted small">{b.organisme}</td>
                    <td className="text-muted small">{b.departement}</td>
                    <td className="text-muted small">{b.commune}</td>
                    <td className="text-center">
                      <Badge bg="light" text="dark" className="fw-normal" style={{ fontSize: '0.72rem' }}>
                        {TYPE_LABEL[b.typeConstruction] ?? b.typeConstruction}
                      </Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg={STATUT_BG[b.statutConstruction] ?? 'secondary'} className="fw-normal" style={{ fontSize: '0.72rem' }}>
                        {b.statutConstruction}
                      </Badge>
                    </td>
                    <td className="text-center pe-3">
                      <div className="hstack gap-1 justify-content-center">
                        <Button variant="soft-info" size="sm" className="btn-icon rounded-circle"
                          onClick={() => openView(b)} title="Consulter">
                          <IconifyIcon icon="tabler:eye" />
                        </Button>
                        <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                          onClick={() => openEdit(b)} title="Modifier">
                          <IconifyIcon icon="tabler:edit" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {batiments.length === 0 && (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4 fst-italic">
                      Aucun bâtiment enregistré —{' '}
                      <button className="btn btn-link btn-sm p-0" type="button" onClick={openAdd}>
                        Ajouter le premier
                      </button>
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

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

      <BatimentModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditBatiment(null) }}
        batiment={editBatiment}
        onSaved={handleSaved}
        sections={sections}
        zonesClimatiques={zonesClimatiques}
      />

      {/* ── Modal Consulter (lecture seule) ───────────────────────────── */}
      <Modal
        show={!!viewBatiment}
        onHide={() => setViewBatiment(null)}
        size="xl"
        centered
        scrollable
      >
        <Modal.Header closeButton>
          <Modal.Title>
            <span className="text-primary fw-bold me-2">{viewBatiment?.code}</span>
            {viewBatiment?.denomination}
          </Modal.Title>
        </Modal.Header>

        <Modal.Body>
          {viewBatiment && (() => {
            const b = viewBatiment
            const field = (label: string, value: React.ReactNode) => (
              <Col md={4} className="mb-3">
                <div className="text-muted small mb-1">{label}</div>
                <div className="fw-medium" style={{ fontSize: '0.88rem' }}>{value || <span className="text-muted fst-italic">—</span>}</div>
              </Col>
            )
            const chips = (values: string[]) => values.length
              ? <div className="d-flex flex-wrap gap-1">{values.map((v) => <Badge key={v} bg="light" text="dark" className="fw-normal">{v}</Badge>)}</div>
              : <span className="text-muted fst-italic small">—</span>

            return (
              <Accordion defaultActiveKey={['0','1','2','3','4','5','6']} alwaysOpen>

                {/* Dénomination */}
                <Accordion.Item eventKey="0">
                  <Accordion.Header>Dénomination</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {field('Code bâtiment', <span className="text-primary fw-bold">{b.codeBatiment || '—'}</span>)}
                      {field('Référence système', <span className="font-monospace text-muted" style={{ fontSize: '0.85rem' }}>{b.code}</span>)}
                      {field('Dénomination', b.denomination)}
                      {field('Organisme', b.organisme)}
                      {field("Mode d'acquisition", b.modeAcquisition)}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Données historiques */}
                <Accordion.Item eventKey="1">
                  <Accordion.Header>Données historiques</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {field('Année de construction', b.anneeConstruction)}
                      {field('Années de restructuration', (b.anneesRestructuration ?? []).join(', '))}
                      {field('Coût de construction (FCFA)', b.coutConstruction?.toLocaleString('fr-FR'))}
                      {field('Statut', <Badge bg={STATUT_BG[b.statutConstruction] ?? 'secondary'} className="fw-normal">{b.statutConstruction}</Badge>)}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Localisation */}
                <Accordion.Item eventKey="2">
                  <Accordion.Header>Localisation</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {field('Département', b.departement)}
                      {field('Commune', b.commune)}
                      {field('Arrondissement', b.arrondissement)}
                      <Col xs={12} className="mb-3">
                        <div className="text-muted small mb-1">Adresse</div>
                        <div className="fw-medium" style={{ fontSize: '0.88rem' }}>{b.adresse || <span className="text-muted fst-italic">—</span>}</div>
                      </Col>
                      {field('Latitude', b.latitude)}
                      {field('Longitude', b.longitude)}
                      {field('Zone climatique', (() => {
                        if (!b.departementClimatique) return undefined
                        for (const z of zonesClimatiques) {
                          const d = z.departements.find((dep) => String(dep.id) === String(b.departementClimatique))
                          if (d) return `${d.nom} — ${z.nom}`
                        }
                        return b.departementClimatique
                      })())}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Type de construction */}
                <Accordion.Item eventKey="3">
                  <Accordion.Header>Type de construction</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {field('Type', TYPE_LABEL[b.typeConstruction] ?? b.typeConstruction)}
                      {field('Niveaux de sous-sol', b.niveauxSousSol)}
                      {field("Nombre d'étages", b.nombreEtages)}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Usage / Matériaux / Toiture / Énergies */}
                <Accordion.Item eventKey="4">
                  <Accordion.Header>Usage — Matériaux — Toiture — Énergies</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      <Col md={6} className="mb-3">
                        <div className="text-muted small mb-1">Usage</div>
                        {chips(b.usages)}
                      </Col>
                      <Col md={6} className="mb-3">
                        <div className="text-muted small mb-1">Type de matériau</div>
                        {chips(b.typeMateriau)}
                      </Col>
                      <Col md={8} className="mb-3">
                        <div className="text-muted small mb-1">Type de toiture</div>
                        {chips(b.typeToiture)}
                      </Col>
                      <Col md={4} className="mb-3">
                        <div className="text-muted small mb-1">Énergies utilisées</div>
                        {chips(b.energies)}
                      </Col>
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Superficie */}
                <Accordion.Item eventKey="5">
                  <Accordion.Header>Superficie</Accordion.Header>
                  <Accordion.Body>
                    <Row>
                      {field('Surface totale (m²)', b.surfaceTotale)}
                      {field('Surface salles humides (m²)', b.surfaceSallesHumides)}
                      {field('Nombre de pièces', b.nombrePieces)}
                    </Row>
                  </Accordion.Body>
                </Accordion.Item>

                {/* Acte d'affectation */}
                <Accordion.Item eventKey="6">
                  <Accordion.Header>Acte d&apos;affectation ou de mise à disposition</Accordion.Header>
                  <Accordion.Body>
                    {b.acteAffectation ? (
                      <Row>
                        {field('Nature', b.acteAffectation.nature)}
                        {field("Date d'effet", b.acteAffectation.dateEffet)}
                        {field('Durée', b.acteAffectation.duree)}
                        {field('Référence', b.acteAffectation.reference)}
                        {b.acteAffectation.commentaire && (
                          <Col xs={12} className="mb-3">
                            <div className="text-muted small mb-1">Commentaire</div>
                            <div className="fw-medium" style={{ fontSize: '0.88rem' }}>{b.acteAffectation.commentaire}</div>
                          </Col>
                        )}
                      </Row>
                    ) : (
                      <p className="text-muted fst-italic mb-0 small">Aucun acte d&apos;affectation renseigné.</p>
                    )}
                  </Accordion.Body>
                </Accordion.Item>

              </Accordion>
            )
          })()}
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={() => setViewBatiment(null)}>Fermer</Button>
          {/* <Button variant="primary" onClick={() => { openEdit(viewBatiment!); setViewBatiment(null) }}>
            <IconifyIcon icon="tabler:edit" className="me-1" />Modifier
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  )
}
