/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import dynamic from 'next/dynamic'
import { useMemo, useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Col, Form, Row, Table } from 'react-bootstrap'
import { BatimentType, ZoneClimatiqueType } from '@/types/entretien-batiment'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { PAGE_SIZE, PageBar, usePagination } from '@/hooks/usePagination'

// Couleurs des zones climatiques (même ordre que zonesClimatiques.sort by ordre)
const ZONE_COLORS = ['#198754', '#fd7e14', '#dc3545']

// Import dynamique de la carte (Leaflet nécessite window)
const BatimentsMap = dynamic(() => import('./BatimentsMap'), {
  ssr: false,
  loading: () => (
    <div
      className="d-flex justify-content-center align-items-center bg-light"
      style={{ height: 520 }}
    >
      <div className="text-center text-muted">
        <div className="spinner-border text-primary mb-2" />
        <p className="mb-0 small">Chargement de la carte…</p>
      </div>
    </div>
  ),
})

// ─── Helpers ──────────────────────────────────────────────────────────────────

function pct(count: number, total: number): number {
  return total > 0 ? Math.round((count / total) * 100) : 0
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="d-flex align-items-center gap-2">
      <div className="flex-grow-1 bg-light rounded" style={{ height: 8, overflow: 'hidden' }}>
        <div
          className="bg-primary rounded"
          style={{ height: '100%', width: `${value}%`, transition: 'width 0.4s ease' }}
        />
      </div>
      <span className="text-muted small" style={{ minWidth: 38, textAlign: 'right' }}>{value}%</span>
    </div>
  )
}

function getZoneForDep(
  departement: string,
  zones: ZoneClimatiqueType[]
): { zone: ZoneClimatiqueType; idx: number } | null {
  const idx = zones.findIndex((z) => z.departements.some((d) => d.nom === departement))
  if (idx < 0) return null
  return { zone: zones[idx], idx }
}

// ─── Répartition par département ──────────────────────────────────────────────

function RepartitionTable({
  batiments,
  zones,
}: {
  batiments: BatimentType[]
  zones: ZoneClimatiqueType[]
}) {
  const grouped = useMemo(() => {
    const map = new Map<string, number>()
    for (const b of batiments) {
      map.set(b.departement, (map.get(b.departement) ?? 0) + 1)
    }
    return Array.from(map.entries())
      .map(([dep, count]) => ({ dep, count }))
      .sort((a, b) => b.count - a.count)
  }, [batiments])

  const total = batiments.length
  const pag = usePagination(grouped)

  if (grouped.length === 0) {
    return (
      <div className="text-center text-muted py-4">
        <IconifyIcon icon="tabler:database-off" className="me-2" />
        Aucun bâtiment correspondant aux filtres
      </div>
    )
  }

  return (
    <>
      <Table hover size="sm" className="align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th>Département</th>
            <th>Zone climatique</th>
            <th style={{ width: 90 }} className="text-center">Bâtiments</th>
            <th style={{ minWidth: 200 }}>Proportion</th>
          </tr>
        </thead>
        <tbody>
          {pag.pageData.map(({ dep, count }) => {
            const found = getZoneForDep(dep, zones)
            const color = found ? ZONE_COLORS[found.idx % ZONE_COLORS.length] : '#6c757d'
            return (
              <tr key={dep}>
                <td className="fw-medium">{dep}</td>
                <td>
                  {found ? (
                    <Badge style={{ backgroundColor: color }} className="fw-normal">
                      {found.zone.nom}
                    </Badge>
                  ) : (
                    <span className="text-muted small">—</span>
                  )}
                </td>
                <td className="text-center">
                  <Badge bg="primary" className="fw-normal">{count}</Badge>
                </td>
                <td>
                  <ProgressBar value={pct(count, total)} />
                </td>
              </tr>
            )
          })}
          <tr className="table-light fw-semibold">
            <td colSpan={2}>
              <IconifyIcon icon="tabler:sum" className="me-2 text-muted" />
              TOTAL
            </td>
            <td className="text-center">
              <Badge bg="secondary" className="fw-normal">{total}</Badge>
            </td>
            <td>
              <ProgressBar value={100} />
            </td>
          </tr>
        </tbody>
      </Table>
      {pag.show && <PageBar page={pag.page} total={pag.totalPages} onChange={pag.setPage} />}
    </>
  )
}

// ─── Tableau bâtiments sans GPS ────────────────────────────────────────────────

function NoGpsTable({ batiments }: { batiments: BatimentType[] }) {
  const pag = usePagination(batiments)

  return (
    <>
      <Table responsive hover size="sm" className="align-middle mb-0">
        <thead className="table-light">
          <tr>
            <th style={{ width: 50 }}>N°</th>
            <th style={{ width: 140 }}>Code bâtiment</th>
            <th>Dénomination / Section</th>
            <th>Département</th>
            <th>Commune</th>
            <th>Arrondissement</th>
          </tr>
        </thead>
        <tbody>
          {pag.pageData.map((b, idx) => (
            <tr key={b.id}>
              <td className="text-muted">{(pag.page - 1) * PAGE_SIZE + idx + 1}</td>
              <td className="text-muted small">{b.codeBatiment || b.code || '—'}</td>
              <td className="fw-medium">{b.organisme || b.denomination || '—'}</td>
              <td>{b.departement || '—'}</td>
              <td>{b.commune || '—'}</td>
              <td>{b.arrondissement || '—'}</td>
            </tr>
          ))}
        </tbody>
      </Table>
      {pag.show && <PageBar page={pag.page} total={pag.totalPages} onChange={pag.setPage} />}
    </>
  )
}

// ─── Composant principal ──────────────────────────────────────────────────────

type Props = {
  batiments: BatimentType[]
  zonesClimatiques: ZoneClimatiqueType[]
}

export default function CartographieManager({ batiments, zonesClimatiques }: Props) {
  // Filtres administratifs (cascadés)
  const [selDep,  setSelDep]  = useState('')
  const [selCom,  setSelCom]  = useState('')
  const [selArr,  setSelArr]  = useState('')
  // Filtre zone climatique
  const [selZone, setSelZone] = useState('')

  // Listes déroulantes cascadées (valeurs uniques triées)
  const departements = useMemo(
    () => [...new Set(batiments.map((b) => b.departement).filter(Boolean))].sort(),
    [batiments]
  )

  const communes = useMemo(() => {
    if (!selDep) return []
    return [...new Set(
      batiments.filter((b) => b.departement === selDep).map((b) => b.commune).filter(Boolean)
    )].sort()
  }, [batiments, selDep])

  const arrondissements = useMemo(() => {
    if (!selCom) return []
    return [...new Set(
      batiments
        .filter((b) => b.departement === selDep && b.commune === selCom)
        .map((b) => b.arrondissement)
        .filter((a): a is string => Boolean(a))
    )].sort()
  }, [batiments, selDep, selCom])

  // Application des filtres (logique AND)
  const filtered = useMemo(() => {
    let result = batiments
    if (selDep)  result = result.filter((b) => b.departement === selDep)
    if (selCom)  result = result.filter((b) => b.commune === selCom)
    if (selArr)  result = result.filter((b) => b.arrondissement === selArr)
    if (selZone) {
      const zone = zonesClimatiques.find((z) => z.id === selZone)
      if (zone) {
        const nomsDeps = new Set(zone.departements.map((d) => d.nom))
        result = result.filter((b) => nomsDeps.has(b.departement))
      }
    }
    return result
  }, [batiments, selDep, selCom, selArr, selZone, zonesClimatiques])

  const withGps    = useMemo(() => filtered.filter((b) => b.latitude != null && b.longitude != null), [filtered])
  const withoutGps = useMemo(() => filtered.filter((b) => b.latitude == null || b.longitude == null), [filtered])

  const hasFilter = Boolean(selDep || selCom || selArr || selZone)

  function resetFilters() {
    setSelDep('')
    setSelCom('')
    setSelArr('')
    setSelZone('')
  }

  function handleDepChange(val: string) {
    setSelDep(val)
    setSelCom('')
    setSelArr('')
  }

  function handleComChange(val: string) {
    setSelCom(val)
    setSelArr('')
  }

  // Zone active sélectionnée (pour affichage badge)
  const zoneSelectionnee = selZone ? zonesClimatiques.find((z) => z.id === selZone) : null

  return (
    <>
      {/* ── Filtres ──────────────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:filter" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Filtres
          </h5>
        </CardHeader>
        <CardBody>
          <Row className="g-3">
            {/* ── Filtre administratif ── */}
            <Col xs={12}>
              <p className="text-muted small mb-2 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                <IconifyIcon icon="tabler:building-community" className="me-1" />
                Zone administrative
              </p>
              <Row className="g-2">
                <Col xs={12} sm={4}>
                  <Form.Label className="small text-muted mb-1">Département</Form.Label>
                  <Form.Select size="sm" value={selDep} onChange={(e) => handleDepChange(e.target.value)}>
                    <option value="">— Tous les départements —</option>
                    {departements.map((d) => <option key={d} value={d}>{d}</option>)}
                  </Form.Select>
                </Col>
                <Col xs={12} sm={4}>
                  <Form.Label className="small text-muted mb-1">Commune</Form.Label>
                  <Form.Select size="sm" value={selCom} disabled={!selDep} onChange={(e) => handleComChange(e.target.value)}>
                    <option value="">— Toutes les communes —</option>
                    {communes.map((c) => <option key={c} value={c}>{c}</option>)}
                  </Form.Select>
                </Col>
                <Col xs={12} sm={4}>
                  <Form.Label className="small text-muted mb-1">Arrondissement</Form.Label>
                  <Form.Select size="sm" value={selArr} disabled={!selCom} onChange={(e) => setSelArr(e.target.value)}>
                    <option value="">— Tous les arrondissements —</option>
                    {arrondissements.map((a) => <option key={a} value={a}>{a}</option>)}
                  </Form.Select>
                </Col>
              </Row>
            </Col>

            {/* ── Filtre zone climatique ── */}
            <Col xs={12} sm={6} lg={4}>
              <p className="text-muted small mb-2 fw-semibold text-uppercase" style={{ letterSpacing: '0.05em' }}>
                <IconifyIcon icon="tabler:sun-wind" className="me-1" />
                Zone climatique
              </p>
              <Form.Select size="sm" value={selZone} onChange={(e) => setSelZone(e.target.value)}>
                <option value="">— Toutes les zones —</option>
                {zonesClimatiques.map((z, i) => (
                  <option key={z.id} value={z.id}>{z.nom}</option>
                ))}
              </Form.Select>
            </Col>
          </Row>

          {/* Filtres actifs + reset */}
          {hasFilter && (
            <div className="mt-3 d-flex align-items-center gap-2 flex-wrap">
              <span className="text-muted small">Filtres actifs :</span>
              {selDep  && <Badge bg="primary"   className="fw-normal">Dép. : {selDep}</Badge>}
              {selCom  && <Badge bg="info"      className="fw-normal">Commune : {selCom}</Badge>}
              {selArr  && <Badge bg="secondary" className="fw-normal">Arr. : {selArr}</Badge>}
              {zoneSelectionnee && (
                <Badge
                  style={{
                    backgroundColor: ZONE_COLORS[
                      zonesClimatiques.findIndex((z) => z.id === selZone) % ZONE_COLORS.length
                    ],
                  }}
                  className="fw-normal"
                >
                  {zoneSelectionnee.nom}
                </Badge>
              )}
              <Button variant="outline-secondary" size="sm" className="py-0" onClick={resetFilters}>
                <IconifyIcon icon="tabler:x" className="me-1" />
                Réinitialiser
              </Button>
            </div>
          )}
        </CardBody>
      </Card>

      {/* ── Carte ────────────────────────────────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:map-pin-2" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Distribution des bâtiments sur la carte du Bénin
          </h5>

          {/* Légende + résumé */}
          <div className="d-flex align-items-center gap-3 flex-wrap">
            {zonesClimatiques.map((z, i) => (
              <div key={z.id} className="d-flex align-items-center gap-1">
                <span
                  className="d-inline-block rounded-circle"
                  style={{ width: 11, height: 11, backgroundColor: ZONE_COLORS[i % ZONE_COLORS.length], flexShrink: 0 }}
                />
                <span className="small text-muted">{z.nom}</span>
              </div>
            ))}
            <span className="small text-muted">|</span>
            <Badge bg="secondary" className="fw-normal">
              {withGps.length} / {filtered.length} géolocalisé{filtered.length !== 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardBody className="p-0" style={{ borderRadius: '0 0 0.375rem 0.375rem', overflow: 'hidden' }}>
          <BatimentsMap batiments={withGps} zonesClimatiques={zonesClimatiques} />
        </CardBody>
      </Card>

      {/* ── Répartition par département ──────────────────────────────────────── */}
      <Card className="mb-4">
        <CardHeader>
          <h5 className="card-title mb-0">
            <IconifyIcon icon="tabler:chart-bar" className="me-1" style={{ fontSize: '1.1rem' }} />
            {' '}Répartition des bâtiments par département
            <Badge bg="secondary" className="fw-normal ms-2 fs-6">
              {filtered.length} bâtiment{filtered.length !== 1 ? 's' : ''}
            </Badge>
          </h5>
        </CardHeader>
        <CardBody className={filtered.length > 0 ? 'p-0' : undefined}>
          <RepartitionTable batiments={filtered} zones={zonesClimatiques} />
        </CardBody>
      </Card>

      {/* ── Bâtiments sans coordonnées GPS ──────────────────────────────────── */}
      {withoutGps.length > 0 && (
        <Card className="mb-4">
          <CardHeader>
            <h5 className="card-title mb-0">
              <IconifyIcon icon="tabler:map-pin-off" className="me-1" style={{ fontSize: '1.1rem', color: '#fd7e14' }} />
              {' '}Bâtiments non géolocalisés
              <Badge bg="warning" text="dark" className="fw-normal ms-2">
                {withoutGps.length} bâtiment{withoutGps.length !== 1 ? 's' : ''}
              </Badge>
            </h5>
          </CardHeader>
          <CardBody className="pb-0">
            <p className="text-muted small mb-3">
              Ces bâtiments ne disposent pas de coordonnées GPS et ne peuvent donc pas être
              positionnés sur la carte.
            </p>
            <NoGpsTable batiments={withoutGps} />
          </CardBody>
        </Card>
      )}
    </>
  )
}
