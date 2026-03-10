/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useRef, useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Col, Form, Row, Table } from 'react-bootstrap'
import { BatimentType } from '@/types/entretien-batiment'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { PAGE_SIZE, PageBar, usePagination } from '@/hooks/usePagination'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function etageLabel(etages: number): string {
  return etages === 0 ? 'RDC' : `R+${etages}`
}

function pct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

function groupByMateriau(
  batiments: BatimentType[]
): Array<{ materiau: string; count: number; items: BatimentType[] }> {
  const map = new Map<string, BatimentType[]>()
  for (const b of batiments) {
    for (const mat of (Array.isArray(b.typeMateriau) ? b.typeMateriau : [])) {
      map.set(mat, [...(map.get(mat) ?? []), b])
    }
  }
  return Array.from(map.entries())
    .map(([materiau, items]) => ({ materiau, count: items.length, items }))
    .sort((a, b) => b.count - a.count)
}

// ─── Barre de progression ─────────────────────────────────────────────────────

function ProgressBar({ value, color = 'primary' }: { value: number; color?: string }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="flex-grow-1 bg-light rounded" style={{ height: 8, overflow: 'hidden' }}>
        <div
          className={`bg-${color} rounded`}
          style={{ height: '100%', width: `${value}%`, transition: 'width 0.4s ease' }}
        />
      </div>
      <span className="text-muted small" style={{ minWidth: 38, textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

// ─── Tableau listing détaillé (avec pagination interne) ───────────────────────

function BatimentsTable({ batiments }: { batiments: BatimentType[] }) {
  const { page, setPage, totalPages, pageData, show } = usePagination(batiments)

  if (batiments.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <IconifyIcon icon="tabler:database-off" className="me-2" />
        Aucun bâtiment correspondant aux critères
      </div>
    )
  }
  return (
    <>
      <Table responsive hover size="sm" className="align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: 60 }}>N° ordre</th>
            <th style={{ width: 140 }}>Code bâtiment</th>
            <th>Section (ministère, institution d&apos;appartenance)</th>
            <th>Structure occupante</th>
            <th>Département</th>
            <th style={{ width: 160 }}>Type de construction</th>
            <th>Usage(s)</th>
          </tr>
        </thead>
        <tbody>
          {pageData.map((b, idx) => (
            <tr key={b.id}>
              <td className="text-muted">{(page - 1) * PAGE_SIZE + idx + 1}</td>
              <td className="text-muted small">{b.codeBatiment || b.code || '—'}</td>
              <td className="fw-medium">{b.organisme || '—'}</td>
              <td>{b.organisme || '—'}</td>
              <td>{b.departement || '—'}</td>
              <td>
                <span className="badge text-bg-secondary fw-normal">{etageLabel(b.nombreEtages ?? 0)}</span>
              </td>
              <td className="small">{b.usages?.length ? b.usages.join(', ') : '—'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {show && <PageBar page={page} total={totalPages} onChange={setPage} />}
    </>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

type FilterMode = 'periode' | 'annee'

type Props = { batiments: BatimentType[] }

export default function ConstructionManager({ batiments }: Props) {
  const total = batiments.length

  // ── Section 1 : filtre par année / période ──
  const [filterMode, setFilterMode] = useState<FilterMode>('annee')
  const [anneeSeule, setAnneeSeule]     = useState('')
  const [anneeDebut, setAnneeDebut]     = useState('')
  const [anneeFin,   setAnneeFin]       = useState('')
  const [yearFilter, setYearFilter]     = useState<{ mode: FilterMode; annee: string; debut: string; fin: string } | null>(null)

  // ── Section 2 & 3 : matériaux ──
  const [selectedMaterial, setSelectedMaterial] = useState<string | null>(null)
  const materiauListRef = useRef<HTMLDivElement>(null)

  // ── Données dérivées ──
  const filteredByYear: BatimentType[] = (() => {
    if (!yearFilter) return []
    if (yearFilter.mode === 'annee') {
      const y = parseInt(yearFilter.annee)
      return isNaN(y) ? [] : batiments.filter((b) => b.anneeConstruction === y)
    }
    const debut = yearFilter.debut ? parseInt(yearFilter.debut) : -Infinity
    const fin   = yearFilter.fin   ? parseInt(yearFilter.fin)   :  Infinity
    return batiments.filter((b) => b.anneeConstruction >= debut && b.anneeConstruction <= fin)
  })()

  const materiauxData = groupByMateriau(batiments)
  const batimentsByMateriau = selectedMaterial
    ? batiments.filter((b) => Array.isArray(b.typeMateriau) && b.typeMateriau.includes(selectedMaterial))
    : []

  // ── Pagination matériaux (card 2) ──
  const matPag = usePagination(materiauxData)

  function applyFilter() {
    setYearFilter({ mode: filterMode, annee: anneeSeule, debut: anneeDebut, fin: anneeFin })
  }

  function resetFilter() {
    setAnneeSeule('')
    setAnneeDebut('')
    setAnneeFin('')
    setYearFilter(null)
  }

  function handleSelectMaterial(mat: string) {
    setSelectedMaterial(mat)
    setTimeout(() => {
      materiauListRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 50)
  }

  function filterLabel(): string {
    if (!yearFilter) return ''
    if (yearFilter.mode === 'annee') return `Année : ${yearFilter.annee}`
    const parts: string[] = []
    if (yearFilter.debut) parts.push(`à partir de ${yearFilter.debut}`)
    if (yearFilter.fin)   parts.push(`jusqu'en ${yearFilter.fin}`)
    return `Période : ${parts.join(' — ')}`
  }

  return (
    <>
      {/* ── Carte 1 : Répartition par année / période ───────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:calendar-stats" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Répartition des bâtiments selon l&apos;année ou la période de construction
          </h5>
        </CardHeader>
        <CardBody>
          <div className="d-flex gap-3 mb-3">
            <Form.Check
              type="radio"
              id="mode-annee"
              label="Par année"
              checked={filterMode === 'annee'}
              onChange={() => setFilterMode('annee')}
            />
            <Form.Check
              type="radio"
              id="mode-periode"
              label="Par période"
              checked={filterMode === 'periode'}
              onChange={() => setFilterMode('periode')}
            />
          </div>

          <Row className="g-2 align-items-end mb-3">
            {filterMode === 'annee' ? (
              <Col xs="auto">
                <Form.Label className="small text-muted mb-1">Année</Form.Label>
                <Form.Control
                  type="number"
                  placeholder="aaaa"
                  style={{ width: 110 }}
                  value={anneeSeule}
                  min={1900}
                  max={new Date().getFullYear()}
                  onChange={(e) => setAnneeSeule(e.target.value)}
                />
              </Col>
            ) : (
              <>
                <Col xs="auto">
                  <Form.Label className="small text-muted mb-1">Année début</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="aaaa"
                    style={{ width: 110 }}
                    value={anneeDebut}
                    min={1900}
                    max={new Date().getFullYear()}
                    onChange={(e) => setAnneeDebut(e.target.value)}
                  />
                </Col>
                <Col xs="auto" className="pb-1 text-muted small">à</Col>
                <Col xs="auto">
                  <Form.Label className="small text-muted mb-1">Année fin</Form.Label>
                  <Form.Control
                    type="number"
                    placeholder="aaaa"
                    style={{ width: 110 }}
                    value={anneeFin}
                    min={1900}
                    max={new Date().getFullYear()}
                    onChange={(e) => setAnneeFin(e.target.value)}
                  />
                </Col>
              </>
            )}
            <Col xs="auto">
              <Button variant="primary" size="sm" onClick={applyFilter}>
                <IconifyIcon icon="tabler:search" className="me-1" />
                Filtrer
              </Button>
            </Col>
            {yearFilter && (
              <Col xs="auto">
                <Button variant="outline-secondary" size="sm" onClick={resetFilter}>
                  <IconifyIcon icon="tabler:x" className="me-1" />
                  Réinitialiser
                </Button>
              </Col>
            )}
          </Row>

          {yearFilter ? (
            <>
              <p className="text-muted small mb-3">
                <IconifyIcon icon="tabler:filter" className="me-1" />
                {filterLabel()} —{' '}
                <strong>{filteredByYear.length}</strong> bâtiment{filteredByYear.length !== 1 ? 's' : ''} trouvé{filteredByYear.length !== 1 ? 's' : ''}
              </p>
              <BatimentsTable batiments={filteredByYear} />
            </>
          ) : (
            <div className="text-center text-muted py-4 border rounded">
              <IconifyIcon icon="tabler:calendar-search" style={{ fontSize: '2rem' }} />
              <p className="mt-2 mb-0 small">Saisissez une année ou une période puis cliquez sur <strong>Filtrer</strong>.</p>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Carte 2 : Par type de matériaux ────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:layers-subtract" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Nombre de bâtiments par type de matériaux de construction
            <span className="text-muted fw-normal fs-6 ms-2">(béton armé, maçonnerie-bois, terre stabilisée, etc.)</span>
          </h5>
        </CardHeader>
        <CardBody>
          <p className="text-muted small mb-3">
            Effectif total :{' '}
            <strong>{total}</strong> bâtiment{total !== 1 ? 's' : ''} recensé{total !== 1 ? 's' : ''}
            {' '}— un bâtiment peut comporter plusieurs types de matériaux.
          </p>

          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Type de matériaux</th>
                  <th style={{ width: 100 }} className="text-center">Nombre</th>
                  <th style={{ minWidth: 240 }}>Proportion par rapport à l&apos;effectif total</th>
                  <th style={{ width: 210 }}>Détail</th>
                </tr>
              </thead>
              <tbody>
                {materiauxData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      <IconifyIcon icon="tabler:database-off" className="me-2" />
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : matPag.pageData.map((row) => (
                  <tr key={row.materiau}>
                    <td className="fw-medium">{row.materiau}</td>
                    <td className="text-center">
                      <Badge bg="primary" className="fw-normal">{row.count}</Badge>
                    </td>
                    <td>
                      <ProgressBar value={pct(row.count, total)} color="primary" />
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className={`p-0 text-decoration-none ${selectedMaterial === row.materiau ? 'fw-semibold' : ''}`}
                        onClick={() => handleSelectMaterial(row.materiau)}
                      >
                        <IconifyIcon icon="tabler:list-details" className="me-1" />
                        Afficher liste des bâtiments concernés
                      </Button>
                    </td>
                  </tr>
                ))}
                {materiauxData.length > 0 && (
                  <tr className="table-light fw-semibold">
                    <td>
                      <IconifyIcon icon="tabler:sum" className="me-2 text-muted" />
                      TOTAL
                    </td>
                    <td className="text-center">
                      <Badge bg="secondary" className="fw-normal">{total}</Badge>
                    </td>
                    <td>
                      <ProgressBar value={100} color="secondary" />
                    </td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          {matPag.show && <PageBar page={matPag.page} total={matPag.totalPages} onChange={matPag.setPage} />}
        </CardBody>
      </Card>

      {/* ── Carte 3 : Liste par type de matériaux ──────────────────────────── */}
      <div ref={materiauListRef}>
        <Card className="mb-4">
          <CardHeader>
            <h5 className="card-title mb-0">
              <IconifyIcon icon="tabler:list-check" className="me-1" style={{ fontSize: '1.1rem' }} />
              {' '}Liste des bâtiments par type de matériaux de construction
              <span className="text-muted fw-normal fs-6 ms-2">(béton armé, maçonnerie-bois, terre stabilisée, etc.)</span>
            </h5>
          </CardHeader>
          <CardBody className={selectedMaterial ? 'p-0' : undefined}>
            {!selectedMaterial ? (
              <div className="text-center text-muted py-4">
                <IconifyIcon icon="tabler:hand-finger" style={{ fontSize: '2rem' }} />
                <p className="mt-2 mb-0 small">
                  Cliquez sur <strong>Afficher liste des bâtiments concernés</strong> dans le tableau ci-dessus
                  pour afficher la liste ici.
                </p>
              </div>
            ) : (
              <>
                <div className="px-3 pt-3 pb-2 d-flex align-items-center gap-2">
                  <span className="text-muted small">Type de matériaux :</span>
                  <Badge bg="primary" className="fw-normal fs-6">{selectedMaterial}</Badge>
                  <Badge bg="secondary" className="fw-normal ms-1">{batimentsByMateriau.length} bâtiment{batimentsByMateriau.length !== 1 ? 's' : ''}</Badge>
                  <Button
                    variant="link"
                    size="sm"
                    className="p-0 ms-auto text-muted"
                    onClick={() => setSelectedMaterial(null)}
                  >
                    <IconifyIcon icon="tabler:x" />
                  </Button>
                </div>
                <BatimentsTable batiments={batimentsByMateriau} />
              </>
            )}
          </CardBody>
        </Card>
      </div>
    </>
  )
}
