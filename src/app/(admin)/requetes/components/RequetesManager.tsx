/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Modal, Table } from 'react-bootstrap'
import { BatimentType } from '@/types/entretien-batiment'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { PAGE_SIZE, PageBar, usePagination } from '@/hooks/usePagination'

// ─── Helpers ──────────────────────────────────────────────────────────────────

type ZoneMode = 'national' | 'departement' | 'commune' | 'arrondissement'

const ZONE_LABELS: Record<ZoneMode, string> = {
  national:      'National',
  departement:   'Département',
  commune:       'Commune',
  arrondissement:'Arrondissement',
}

function groupByZone(
  batiments: BatimentType[],
  mode: ZoneMode
): Array<{ zone: string; count: number; items: BatimentType[] }> {
  if (mode === 'national') {
    return [{ zone: 'Bénin (plan national)', count: batiments.length, items: batiments }]
  }
  const map = new Map<string, BatimentType[]>()
  for (const b of batiments) {
    const key =
      mode === 'departement'    ? (b.departement    || '(non renseigné)') :
      mode === 'commune'        ? (b.commune        || '(non renseigné)') :
                                  (b.arrondissement  || '(non renseigné)')
    map.set(key, [...(map.get(key) ?? []), b])
  }
  return Array.from(map.entries())
    .map(([zone, items]) => ({ zone, count: items.length, items }))
    .sort((a, b) => b.count - a.count)
}

function etageLabel(etages: number): string {
  return etages === 0 ? 'RDC' : `R+${etages}`
}

function groupByTypeConstruction(
  batiments: BatimentType[]
): Array<{ label: string; etages: number; count: number; items: BatimentType[] }> {
  const map = new Map<number, BatimentType[]>()
  for (const b of batiments) {
    const key = b.nombreEtages ?? 0
    map.set(key, [...(map.get(key) ?? []), b])
  }
  return Array.from(map.entries())
    .map(([etages, items]) => ({ etages, label: etageLabel(etages), count: items.length, items }))
    .sort((a, b) => a.etages - b.etages)
}

function pct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

function groupByUsage(
  batiments: BatimentType[]
): Array<{ usage: string; count: number; items: BatimentType[] }> {
  const map = new Map<string, BatimentType[]>()
  for (const b of batiments) {
    for (const usage of b.usages ?? []) {
      map.set(usage, [...(map.get(usage) ?? []), b])
    }
  }
  return Array.from(map.entries())
    .map(([usage, items]) => ({ usage, count: items.length, items }))
    .sort((a, b) => b.count - a.count)
}

function getExtra(b: BatimentType, key: string): string | undefined {
  const val = b.extra?.[key]
  return Array.isArray(val) ? val[0] : val
}

const CATEGORIES_REGLEMENTAIRES = [
  { key: 'erp', label: 'ERP', full: 'Établissement Recevant du Public' },
  { key: 'ert', label: 'ERT', full: 'Établissement Recevant des Travailleurs' },
  { key: 'igh', label: 'IGH', full: 'Immeuble de Grande Hauteur' },
] as const

// ─── Barre de progression inline ─────────────────────────────────────────────

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

// ─── Modal Détail bâtiments ───────────────────────────────────────────────────

type DetailModal = { label: string; items: BatimentType[] } | null

function BatimentsDetailModal({ modal, onClose }: { modal: DetailModal; onClose: () => void }) {
  const items = modal?.items ?? []
  const { page, setPage, totalPages, pageData, show } = usePagination(items)

  return (
    <Modal show={!!modal} onHide={onClose} size="lg" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title className="fs-5">
          <IconifyIcon icon="tabler:building" className="me-2" />
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

// ─── Tableau listing détaillé ─────────────────────────────────────────────────

function BatimentsTable({ batiments }: { batiments: BatimentType[] }) {
  const { page, setPage, totalPages, pageData, show } = usePagination(batiments)

  if (batiments.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <IconifyIcon icon="tabler:database-off" className="me-2" />
        Aucun bâtiment correspondant
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
            <th>Section (ministère / institution d&apos;appartenance)</th>
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

type Props = { batiments: BatimentType[] }

export default function RequetesManager({ batiments }: Props) {
  const [zoneMode, setZoneMode]       = useState<ZoneMode>('departement')
  const [detailModal, setDetailModal] = useState<DetailModal>(null)

  const total     = batiments.length
  const zoneData  = groupByZone(batiments, zoneMode)
  const typeData  = groupByTypeConstruction(batiments)
  const usageData = groupByUsage(batiments)

  const categoriesData = CATEGORIES_REGLEMENTAIRES.map(({ key, label, full }) => {
    const items = batiments.filter((b) => getExtra(b, key) === 'Oui')
    return { key, label, full, count: items.length, items }
  })
  const batimentsCategories = batiments.filter((b) =>
    CATEGORIES_REGLEMENTAIRES.some(({ key }) => getExtra(b, key) === 'Oui')
  )
  const totalCategories = batimentsCategories.length
  const batimentsPMR = batiments.filter((b) => getExtra(b, 'accesPMR') === 'Oui')

  // ── Pagination par tableau ──
  const zone  = usePagination(zoneData, zoneMode)
  const type_ = usePagination(typeData)
  const usage = usePagination(usageData)

  return (
    <>
      {/* ── Carte 1 : Densité par zone administrative ──────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:map-pin-2" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Densité de bâtiments par zone administrative ou fonctionnelle
          </h5>
        </CardHeader>
        <CardBody>
          <div className="d-flex gap-2 mb-4 flex-wrap align-items-center">
            <span className="text-muted small me-1">Afficher par :</span>
            {(Object.keys(ZONE_LABELS) as ZoneMode[]).map((mode) => (
              <button
                key={mode}
                className={`btn btn-sm ${zoneMode === mode ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setZoneMode(mode)}
              >
                {ZONE_LABELS[mode]}
              </button>
            ))}
          </div>

          <p className="text-muted small mb-3">
            Effectif total :{' '}
            <strong>{total}</strong> bâtiment{total !== 1 ? 's' : ''} recensé{total !== 1 ? 's' : ''}
            {zone.show && <span className="ms-2 text-muted">— {zoneData.length} zones, page {zone.page}/{zone.totalPages}</span>}
          </p>

          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>{ZONE_LABELS[zoneMode]}</th>
                  <th style={{ width: 110 }} className="text-center">Bâtiments</th>
                  <th style={{ minWidth: 220 }}>Proportion</th>
                  <th style={{ width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {zoneData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      <IconifyIcon icon="tabler:database-off" className="me-2" />
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : zone.pageData.map((row, idx) => (
                  <tr key={row.zone}>
                    <td className="text-muted">{(zone.page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="fw-medium">{row.zone}</td>
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
                        className="p-0 text-primary text-decoration-none"
                        onClick={() => setDetailModal({ label: row.zone, items: row.items })}
                      >
                        <IconifyIcon icon="tabler:eye" className="me-1" />
                        Détail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {zone.show && <PageBar page={zone.page} total={zone.totalPages} onChange={zone.setPage} />}
        </CardBody>
      </Card>

      {/* ── Carte 2 : Par type de construction ────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:building-skyscraper" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Nombre de bâtiments par type de construction
          </h5>
        </CardHeader>
        <CardBody>
          <p className="text-muted small mb-3">
            Effectif total :{' '}
            <strong>{total}</strong> bâtiment{total !== 1 ? 's' : ''} recensé{total !== 1 ? 's' : ''}
          </p>

          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 160 }}>Type de construction</th>
                  <th style={{ width: 100 }} className="text-center">Nombre</th>
                  <th style={{ minWidth: 260 }}>Proportion par rapport à l&apos;effectif total</th>
                  <th>Détail</th>
                </tr>
              </thead>
              <tbody>
                {typeData.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center text-muted py-4">
                      <IconifyIcon icon="tabler:database-off" className="me-2" />
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : type_.pageData.map((row) => (
                  <tr key={row.label}>
                    <td>
                      <span className="badge text-bg-secondary me-2 fw-normal">{row.label}</span>
                      <span className="fw-medium">
                        {row.etages === 0 ? 'Rez-de-chaussée' : `${row.etages} étage${row.etages > 1 ? 's' : ''}`}
                      </span>
                    </td>
                    <td className="text-center">
                      <Badge bg="success" className="fw-normal">{row.count}</Badge>
                    </td>
                    <td>
                      <ProgressBar value={pct(row.count, total)} color="success" />
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-primary text-decoration-none"
                        onClick={() => setDetailModal({ label: `Type ${row.label}`, items: row.items })}
                      >
                        <IconifyIcon icon="tabler:list-details" className="me-1" />
                        Afficher liste des bâtiments concernés
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {type_.show && <PageBar page={type_.page} total={type_.totalPages} onChange={type_.setPage} />}
        </CardBody>
      </Card>

      {/* ── Carte 3 : Par type d'usage ──────────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:layout-grid" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Nombre de bâtiments par type d&apos;usage
          </h5>
        </CardHeader>
        <CardBody>
          <p className="text-muted small mb-3">
            Effectif total :{' '}
            <strong>{total}</strong> bâtiment{total !== 1 ? 's' : ''} recensé{total !== 1 ? 's' : ''}
            {' '}— un bâtiment peut appartenir à plusieurs usages.
          </p>

          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Type d&apos;usage</th>
                  <th style={{ width: 110 }} className="text-center">Bâtiments</th>
                  <th style={{ minWidth: 220 }}>Proportion</th>
                  <th style={{ width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {usageData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center text-muted py-4">
                      <IconifyIcon icon="tabler:database-off" className="me-2" />
                      Aucune donnée disponible
                    </td>
                  </tr>
                ) : usage.pageData.map((row, idx) => (
                  <tr key={row.usage}>
                    <td className="text-muted">{(usage.page - 1) * PAGE_SIZE + idx + 1}</td>
                    <td className="fw-medium">{row.usage}</td>
                    <td className="text-center">
                      <Badge bg="info" className="fw-normal">{row.count}</Badge>
                    </td>
                    <td>
                      <ProgressBar value={pct(row.count, total)} color="info" />
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-primary text-decoration-none"
                        onClick={() => setDetailModal({ label: row.usage, items: row.items })}
                      >
                        <IconifyIcon icon="tabler:eye" className="me-1" />
                        Détail
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
          {usage.show && <PageBar page={usage.page} total={usage.totalPages} onChange={usage.setPage} />}
        </CardBody>
      </Card>

      {/* ── Carte 4 : Par catégorie réglementaire ───────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:certificate" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Nombre de bâtiments par catégorie réglementaire
          </h5>
        </CardHeader>
        <CardBody>
          <p className="text-muted small mb-3">
            Effectif total :{' '}
            <strong>{total}</strong> bâtiment{total !== 1 ? 's' : ''} recensé{total !== 1 ? 's' : ''}
            {' '}— classement ERP / ERT / IGH (plusieurs catégories possibles).
          </p>

          <div className="table-responsive">
            <Table hover size="sm" className="align-middle">
              <thead className="table-light">
                <tr>
                  <th>Cadre réglementaire</th>
                  <th style={{ width: 110 }} className="text-center">Nombre</th>
                  <th style={{ minWidth: 220 }}>Proportion</th>
                  <th style={{ width: 90 }}></th>
                </tr>
              </thead>
              <tbody>
                {categoriesData.map((row) => (
                  <tr key={row.key}>
                    <td>
                      <Badge bg="warning" text="dark" className="me-2 fw-normal">{row.label}</Badge>
                      <span className="fw-medium">{row.full}</span>
                    </td>
                    <td className="text-center">
                      <Badge bg="warning" text="dark" className="fw-normal">{row.count}</Badge>
                    </td>
                    <td>
                      <ProgressBar value={pct(row.count, total)} color="warning" />
                    </td>
                    <td>
                      <Button
                        variant="link"
                        size="sm"
                        className="p-0 text-primary text-decoration-none"
                        onClick={() => setDetailModal({ label: `${row.label} — ${row.full}`, items: row.items })}
                      >
                        <IconifyIcon icon="tabler:eye" className="me-1" />
                        Détail
                      </Button>
                    </td>
                  </tr>
                ))}
                <tr className="table-light fw-semibold">
                  <td>
                    <IconifyIcon icon="tabler:sum" className="me-2 text-muted" />
                    TOTAL (bâtiments classés)
                  </td>
                  <td className="text-center">
                    <Badge bg="secondary" className="fw-normal">{totalCategories}</Badge>
                  </td>
                  <td>
                    <ProgressBar value={pct(totalCategories, total)} color="secondary" />
                  </td>
                  <td></td>
                </tr>
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── Carte 5 : Liste par catégorie réglementaire ─────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:list-check" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Liste des bâtiments par catégorie réglementaire
            {totalCategories > 0 && (
              <Badge bg="secondary" className="ms-2 fw-normal">{totalCategories}</Badge>
            )}
          </h5>
        </CardHeader>
        <CardBody className="p-0">
          {batimentsCategories.length === 0 ? (
            <div className="text-center text-muted py-4">
              <IconifyIcon icon="tabler:database-off" className="me-2" />
              Aucun bâtiment classé ERP / ERT / IGH
            </div>
          ) : (
            <BatimentsTable batiments={batimentsCategories} />
          )}
        </CardBody>
      </Card>

      {/* ── Carte 6 : Liste des bâtiments PMR ───────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:accessible" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Liste des bâtiments disposant d&apos;aménagements pour personnes à mobilité réduite (PMR)
            {batimentsPMR.length > 0 && (
              <Badge bg="success" className="ms-2 fw-normal">{batimentsPMR.length}</Badge>
            )}
          </h5>
        </CardHeader>
        <CardBody className="p-0">
          {batimentsPMR.length === 0 ? (
            <div className="text-center text-muted py-4">
              <IconifyIcon icon="tabler:database-off" className="me-2" />
              Aucun bâtiment disposant d&apos;aménagements PMR renseigné
            </div>
          ) : (
            <BatimentsTable batiments={batimentsPMR} />
          )}
        </CardBody>
      </Card>

      {/* ── Modal détail ───────────────────────────────────────────────────── */}
      <BatimentsDetailModal modal={detailModal} onClose={() => setDetailModal(null)} />
    </>
  )
}
