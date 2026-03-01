/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Col, Form, Modal, Row, Table } from 'react-bootstrap'
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

function groupByToiture(
  batiments: BatimentType[]
): Array<{ toiture: string; count: number; items: BatimentType[] }> {
  const map = new Map<string, BatimentType[]>()
  for (const b of batiments) {
    for (const t of b.typeToiture ?? []) {
      map.set(t, [...(map.get(t) ?? []), b])
    }
  }
  return Array.from(map.entries())
    .map(([toiture, items]) => ({ toiture, count: items.length, items }))
    .sort((a, b) => b.count - a.count)
}

function surfaceUtile(b: BatimentType): number {
  return (b.surfaceTotale ?? 0) - (b.surfaceSallesHumides ?? 0)
}

function applyRange(
  batiments: BatimentType[],
  getValue: (b: BatimentType) => number,
  min: string,
  max: string
): BatimentType[] {
  const minN = min !== '' ? parseFloat(min) : -Infinity
  const maxN = max !== '' ? parseFloat(max) : Infinity
  if (isNaN(minN) && isNaN(maxN)) return batiments
  return batiments.filter((b) => {
    const v = getValue(b)
    return v >= minN && v <= maxN
  })
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

// ─── Modal détail toiture (avec pagination) ───────────────────────────────────

type DetailModal = { label: string; items: BatimentType[] } | null

function ToitureDetailModal({ modal, onClose }: { modal: DetailModal; onClose: () => void }) {
  const items = modal?.items ?? []
  const { page, setPage, totalPages, pageData, show } = usePagination(items)

  return (
    <Modal show={!!modal} onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          <IconifyIcon icon="tabler:home-check" className="me-2" />
          {modal?.label} —{' '}
          <span className="text-muted fw-normal">
            {items.length} bâtiment{items.length > 1 ? 's' : ''}
          </span>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body className="p-0">
        <Table responsive hover size="sm" className="mb-0">
          <thead className="table-light">
            <tr>
              <th className="px-3">#</th>
              <th className="px-3">Code</th>
              <th>Dénomination</th>
              <th>Département</th>
              <th>Commune</th>
              <th>Niveaux</th>
            </tr>
          </thead>
          <tbody>
            {pageData.map((b, idx) => (
              <tr key={b.id}>
                <td className="px-3 text-muted small">{(page - 1) * PAGE_SIZE + idx + 1}</td>
                <td className="px-3 text-muted small">{b.codeBatiment || b.code || '—'}</td>
                <td className="fw-medium">{b.denomination}</td>
                <td>{b.departement || '—'}</td>
                <td>{b.commune || '—'}</td>
                <td>
                  <span className="badge text-bg-secondary fw-normal">{etageLabel(b.nombreEtages ?? 0)}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
        {show && <PageBar page={page} total={totalPages} onChange={setPage} />}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>Fermer</Button>
      </Modal.Footer>
    </Modal>
  )
}

// ─── Tableau classement (avec pagination interne) ─────────────────────────────

type ClassementRow = BatimentType & { _valeur: number }

function ClassementTable({
  batiments,
  valueLabel,
  valueUnit,
  footerNote,
}: {
  batiments: ClassementRow[]
  valueLabel: string
  valueUnit: string
  footerNote: string
}) {
  const { page, setPage, totalPages, pageData, show } = usePagination(batiments)
  const empty = batiments.length === 0

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
            <th style={{ width: 110 }} className="text-end">{valueLabel}</th>
          </tr>
        </thead>
        <tbody>
          {empty ? (
            <tr>
              <td colSpan={8} className="text-center text-muted py-3">
                <IconifyIcon icon="tabler:database-off" className="me-2" />
                Aucun bâtiment correspondant aux critères
              </td>
            </tr>
          ) : pageData.map((b, idx) => (
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
              <td className="text-end fw-medium">
                {b._valeur.toLocaleString('fr-FR')}{' '}
                <span className="text-muted small">{valueUnit}</span>
              </td>
            </tr>
          ))}
          {!empty && (
            <tr className="table-light">
              <td colSpan={7} className="text-muted small fst-italic ps-3">
                <IconifyIcon icon="tabler:info-circle" className="me-1" />
                {footerNote}
              </td>
              <td className="text-end fw-semibold">
                <Badge bg="secondary" className="fw-normal">{batiments.length}</Badge>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
      {show && <PageBar page={page} total={totalPages} onChange={setPage} />}
    </>
  )
}

// ─── Filtre de plage ──────────────────────────────────────────────────────────

type RangeState = { min: string; max: string; applied: boolean }

function RangeFilter({
  label,
  unit,
  state,
  onChange,
  onApply,
  onReset,
}: {
  label: string
  unit: string
  state: RangeState
  onChange: (field: 'min' | 'max', val: string) => void
  onApply: () => void
  onReset: () => void
}) {
  return (
    <Row className="g-2 align-items-end mb-3">
      <Col xs="auto">
        <span className="text-muted small">{label} entre :</span>
      </Col>
      <Col xs="auto">
        <Form.Control
          type="number"
          placeholder="min"
          style={{ width: 100 }}
          value={state.min}
          min={0}
          onChange={(e) => onChange('min', e.target.value)}
        />
      </Col>
      <Col xs="auto" className="pb-1 text-muted small">et</Col>
      <Col xs="auto">
        <Form.Control
          type="number"
          placeholder="max"
          style={{ width: 100 }}
          value={state.max}
          min={0}
          onChange={(e) => onChange('max', e.target.value)}
        />
      </Col>
      {unit && <Col xs="auto" className="pb-1 text-muted small">{unit}</Col>}
      <Col xs="auto">
        <Button variant="primary" size="sm" onClick={onApply}>
          <IconifyIcon icon="tabler:filter" className="me-1" />
          Filtrer
        </Button>
      </Col>
      {state.applied && (
        <Col xs="auto">
          <Button variant="outline-secondary" size="sm" onClick={onReset}>
            <IconifyIcon icon="tabler:x" className="me-1" />
            Tout afficher
          </Button>
        </Col>
      )}
    </Row>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

const INIT_RANGE: RangeState = { min: '', max: '', applied: false }

type Props = { batiments: BatimentType[] }

export default function ToituresSurfacesManager({ batiments }: Props) {
  const total = batiments.length

  // ── Toitures ──
  const [toitureModal, setToitureModal] = useState<DetailModal>(null)
  const toitureData = groupByToiture(batiments)
  const toiturePag  = usePagination(toitureData)

  // ── Filtres classement ──
  const [piecesRange,  setPiecesRange]  = useState<RangeState>(INIT_RANGE)
  const [surfaceRange, setSurfaceRange] = useState<RangeState>(INIT_RANGE)
  const [humideRange,  setHumideRange]  = useState<RangeState>(INIT_RANGE)
  const [utileRange,   setUtileRange]   = useState<RangeState>(INIT_RANGE)

  // ── Données classement (triées décroissant, filtrage optionnel) ──
  function makeRows(
    getValue: (b: BatimentType) => number,
    range: RangeState
  ): ClassementRow[] {
    const filtered = range.applied
      ? applyRange(batiments, getValue, range.min, range.max)
      : batiments
    return filtered
      .map((b) => ({ ...b, _valeur: getValue(b) }))
      .sort((a, b) => b._valeur - a._valeur)
  }

  const piecesRows  = makeRows((b) => b.nombrePieces ?? 0,        piecesRange)
  const surfaceRows = makeRows((b) => b.surfaceTotale ?? 0,       surfaceRange)
  const humideRows  = makeRows((b) => b.surfaceSallesHumides ?? 0, humideRange)
  const utileRows   = makeRows(surfaceUtile,                       utileRange)

  function updateRange(
    setter: React.Dispatch<React.SetStateAction<RangeState>>,
    field: 'min' | 'max',
    val: string
  ) {
    setter((prev) => ({ ...prev, [field]: val }))
  }

  function applyRange_(setter: React.Dispatch<React.SetStateAction<RangeState>>) {
    setter((prev) => ({ ...prev, applied: true }))
  }

  function resetRange(setter: React.Dispatch<React.SetStateAction<RangeState>>) {
    setter(INIT_RANGE)
  }

  return (
    <>
      {/* ── Carte 1 : Type de toiture ─────────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:home-2" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Répartition des bâtiments selon le type de toiture
            <span className="text-muted fw-normal fs-6 ms-2">(tôle, dalle béton, tuile, fibrociment, etc.)</span>
          </h5>
        </CardHeader>
        <CardBody>
          <p className="text-muted small mb-3">
            Effectif total :{' '}
            <strong>{total}</strong> bâtiment{total !== 1 ? 's' : ''} recensé{total !== 1 ? 's' : ''}
            {' '}— un bâtiment peut avoir plusieurs types de toiture.
          </p>

          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Type de toiture</th>
                  <th style={{ width: 100 }} className="text-center">Nombre</th>
                  <th style={{ minWidth: 240 }}>Proportion par rapport à l&apos;effectif total</th>
                  <th style={{ width: 210 }}>Détail</th>
                </tr>
              </thead>
              <tbody>
                {toitureData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      <IconifyIcon icon="tabler:database-off" className="me-2" />
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : toiturePag.pageData.map((row) => (
                  <tr key={row.toiture}>
                    <td className="fw-medium">{row.toiture}</td>
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
                        className="p-0 text-decoration-none"
                        onClick={() => setToitureModal({ label: row.toiture, items: row.items })}
                      >
                        <IconifyIcon icon="tabler:list-details" className="me-1" />
                        Afficher liste des bâtiments concernés
                      </Button>
                    </td>
                  </tr>
                ))}
                {toitureData.length > 0 && (
                  <tr className="table-light fw-semibold">
                    <td>
                      <IconifyIcon icon="tabler:sum" className="me-2 text-muted" />
                      TOTAL
                    </td>
                    <td className="text-center">
                      <Badge bg="secondary" className="fw-normal">{total}</Badge>
                    </td>
                    <td><ProgressBar value={100} color="secondary" /></td>
                    <td></td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          {toiturePag.show && <PageBar page={toiturePag.page} total={toiturePag.totalPages} onChange={toiturePag.setPage} />}
        </CardBody>
      </Card>

      {/* ── Titre section classement ────────────────────────────────────────── */}
      <Card className="mb-3 border-0 bg-light">
        <CardBody className="py-2">
          <h6 className="mb-1 fw-semibold">
            <IconifyIcon icon="tabler:sort-descending" className="me-2 text-primary" />
            Classement des bâtiments selon :
          </h6>
          <ol className="mb-0 ps-4 small text-muted">
            <li>Nombre de pièces</li>
            <li>Surface bâtie totale</li>
            <li>Surface utile (= surface totale – surface humide)</li>
            <li>Surface des locaux humides (sanitaires, cuisines, etc.)</li>
          </ol>
        </CardBody>
      </Card>

      {/* ── Carte 2 : Nombre de pièces ──────────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:door" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}1. Classement par nombre de pièces
          </h5>
        </CardHeader>
        <CardBody className="pb-0">
          <RangeFilter
            label="Nombre de pièces"
            unit="pièces"
            state={piecesRange}
            onChange={(f, v) => updateRange(setPiecesRange, f, v)}
            onApply={() => applyRange_(setPiecesRange)}
            onReset={() => resetRange(setPiecesRange)}
          />
        </CardBody>
        <ClassementTable
          batiments={piecesRows}
          valueLabel="Nb pièces"
          valueUnit=""
          footerNote="Bâtiments listés par ordre décroissant de nombre de pièces"
        />
      </Card>

      {/* ── Carte 3 : Surface bâtie totale ──────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:ruler-measure" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}2. Classement par surface bâtie totale
          </h5>
        </CardHeader>
        <CardBody className="pb-0">
          <RangeFilter
            label="Surface bâtie totale"
            unit="m²"
            state={surfaceRange}
            onChange={(f, v) => updateRange(setSurfaceRange, f, v)}
            onApply={() => applyRange_(setSurfaceRange)}
            onReset={() => resetRange(setSurfaceRange)}
          />
        </CardBody>
        <ClassementTable
          batiments={surfaceRows}
          valueLabel="Surface (m²)"
          valueUnit="m²"
          footerNote="Bâtiments listés par ordre décroissant de surface"
        />
      </Card>

      {/* ── Carte 4 : Surface utile ──────────────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:square-rotated" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}3. Classement par surface utile
            <span className="text-muted fw-normal fs-6 ms-2">= surface totale – surface des locaux humides</span>
          </h5>
        </CardHeader>
        <CardBody className="pb-0">
          <RangeFilter
            label="Surface utile"
            unit="m²"
            state={utileRange}
            onChange={(f, v) => updateRange(setUtileRange, f, v)}
            onApply={() => applyRange_(setUtileRange)}
            onReset={() => resetRange(setUtileRange)}
          />
        </CardBody>
        <ClassementTable
          batiments={utileRows}
          valueLabel="S. utile (m²)"
          valueUnit="m²"
          footerNote="Bâtiments listés par ordre décroissant de surface utile"
        />
      </Card>

      {/* ── Carte 5 : Surface locaux humides ────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:droplet" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}4. Classement par surface des locaux humides
            <span className="text-muted fw-normal fs-6 ms-2">(sanitaires, cuisines, etc.)</span>
          </h5>
        </CardHeader>
        <CardBody className="pb-0">
          <RangeFilter
            label="Surface locaux humides"
            unit="m²"
            state={humideRange}
            onChange={(f, v) => updateRange(setHumideRange, f, v)}
            onApply={() => applyRange_(setHumideRange)}
            onReset={() => resetRange(setHumideRange)}
          />
        </CardBody>
        <ClassementTable
          batiments={humideRows}
          valueLabel="S. humides (m²)"
          valueUnit="m²"
          footerNote="Bâtiments listés par ordre décroissant de surface des locaux humides"
        />
      </Card>

      {/* ── Modal toiture ──────────────────────────────────────────────────── */}
      <ToitureDetailModal modal={toitureModal} onClose={() => setToitureModal(null)} />
    </>
  )
}
