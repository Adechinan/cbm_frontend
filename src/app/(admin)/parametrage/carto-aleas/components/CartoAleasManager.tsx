/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import {
  Badge, Button, Card, CardBody, CardHeader,
  Col, Row, Table,
} from 'react-bootstrap'
import {
  AleaClimatiqueType, CartoAleaType, NiveauRisque, NiveauRisqueDisponible, ZoneClimatiqueType,
} from '@/types/entretien-batiment'
import {
  deleteAleaClimatique, deleteZoneClimatique,
  saveCartoAlea, updateAleaClimatique,
} from '@/services/batimentService'
import ZoneModal from './ZoneModal'
import AleaModal from './AleaModal'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

// ─── Couleurs des niveaux ─────────────────────────────────────────────────────

const NIVEAU_CONFIG: Record<NiveauRisque, { bg: string; text: string; label: string }> = {
  Faible: { bg: 'success',  text: 'white', label: 'F' },
  Moyen:  { bg: 'warning',  text: 'dark',  label: 'M' },
  Elevé:  { bg: 'danger',   text: 'white', label: 'E' },
}
const NIVEAUX: NiveauRisque[] = ['Faible', 'Moyen', 'Elevé']

function nextNiveau(n: NiveauRisque): NiveauRisque {
  return NIVEAUX[(NIVEAUX.indexOf(n) + 1) % NIVEAUX.length]
}

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  zonesInit: ZoneClimatiqueType[]
  aleasInit: AleaClimatiqueType[]
  cartoInit: CartoAleaType[]
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function CartoAleasManager({ zonesInit, aleasInit, cartoInit }: Props) {
  const [zones, setZones]   = useState<ZoneClimatiqueType[]>(zonesInit)
  const [aleas, setAleas]   = useState<AleaClimatiqueType[]>(aleasInit)

  // cartoMap[departementClimatiqueId][aleaId] = NiveauRisque (string interne pour le cycling)
  const [cartoMap, setCartoMap] = useState<Record<string, Record<string, NiveauRisque>>>(() => {
    const map: Record<string, Record<string, NiveauRisque>> = {}
    for (const c of cartoInit) {
      if (!map[c.departementClimatiqueId]) map[c.departementClimatiqueId] = {}
      map[c.departementClimatiqueId][c.aleaId] = c.niveau.etat
    }
    return map
  })

  const [cartoDirty, setCartoDirty] = useState(false)
  const [cartoSaving, setCartoSaving] = useState(false)

  // Modals
  const [zoneModal, setZoneModal]     = useState(false)
  const [editZone, setEditZone]       = useState<ZoneClimatiqueType | null>(null)
  const [aleaModal, setAleaModal]     = useState(false)
  const [editAlea, setEditAlea]       = useState<AleaClimatiqueType | null>(null)

  const aleasActifs = aleas.filter((a) => a.actif).sort((a, b) => a.ordre - b.ordre)

  // ── CRUD Zones ──────────────────────────────────────────────────────────────

  const handleZoneSaved = (saved: ZoneClimatiqueType) => {
    setZones((p) => {
      const exists = p.find((z) => z.id === saved.id)
      return exists ? p.map((z) => (z.id === saved.id ? saved : z)) : [...p, saved]
    })
    setZoneModal(false)
    setEditZone(null)
  }

  const handleDeleteZone = async (id: string) => {
    if (!confirm('Supprimer cette zone ? Les données de cartographie associées seront perdues.')) return
    await deleteZoneClimatique(id)
    const zone = zones.find((z) => z.id === id)
    if (zone) {
      setCartoMap((prev) => {
        const next = { ...prev }
        zone.departements.forEach((d) => { delete next[d.id] })
        return next
      })
    }
    setZones((p) => p.filter((z) => z.id !== id))
  }

  // ── CRUD Aléas ──────────────────────────────────────────────────────────────

  const handleAleaSaved = (saved: AleaClimatiqueType) => {
    setAleas((p) => {
      const exists = p.find((a) => a.id === saved.id)
      return exists ? p.map((a) => (a.id === saved.id ? saved : a)) : [...p, saved]
    })
    setAleaModal(false)
    setEditAlea(null)
  }

  const handleToggleAlea = async (alea: AleaClimatiqueType) => {
    const updated = await updateAleaClimatique(alea.id, { actif: !alea.actif })
    setAleas((p) => p.map((a) => (a.id === updated.id ? updated : a)))
  }

  const handleDeleteAlea = async (id: string) => {
    if (!confirm('Supprimer cet aléa ? Les colonnes associées disparaîtront de la cartographie.')) return
    await deleteAleaClimatique(id)
    setAleas((p) => p.filter((a) => a.id !== id))
    setCartoMap((prev) => {
      const next: typeof prev = {}
      for (const deptId in prev) {
        next[deptId] = { ...prev[deptId] }
        delete next[deptId][id]
      }
      return next
    })
  }

  // ── Cartographie ────────────────────────────────────────────────────────────

  const getNiveau = (deptId: string, aleaId: string): NiveauRisque =>
    cartoMap[deptId]?.[aleaId] ?? 'Faible'

  const cycleCellule = (deptId: string, aleaId: string) => {
    setCartoMap((prev) => ({
      ...prev,
      [deptId]: { ...(prev[deptId] ?? {}), [aleaId]: nextNiveau(getNiveau(deptId, aleaId)) },
    }))
    setCartoDirty(true)
  }

  const NIVEAU_OBJ: Record<NiveauRisque, NiveauRisqueDisponible> = {
    Faible: { etat: 'Faible', note: 0 },
    Moyen:  { etat: 'Moyen',  note: 50 },
    Elevé:  { etat: 'Elevé',  note: 100 },
  }

  const handleSaveCarto = async () => {
    setCartoSaving(true)
    try {
      const flat: CartoAleaType[] = []
      for (const deptId in cartoMap) {
        for (const aleaId in cartoMap[deptId]) {
          flat.push({ departementClimatiqueId: deptId, aleaId, niveau: NIVEAU_OBJ[cartoMap[deptId][aleaId]] })
        }
      }
      await saveCartoAlea(flat)
      setCartoDirty(false)
    } finally {
      setCartoSaving(false)
    }
  }

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Ligne 1 : Zones + Aléas ─────────────────────────────────────── */}
      <Row className="g-3 mb-3">

        {/* Zones climatiques */}
        <Col lg={7}>
          <Card className="h-100">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title mb-0">Zones climatiques</h5>
                <p className="text-muted small mb-0 mt-1">
                  Définissez les zones et les départements qu&apos;elles couvrent.
                </p>
              </div>
              <Button variant="success" size="sm" onClick={() => { setEditZone(null); setZoneModal(true) }}>
                <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <Table hover className="align-middle mb-0 table-sm">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3">Zone</th>
                    <th>Départements</th>
                    <th className="text-center pe-3" style={{ width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {zones.sort((a, b) => a.ordre - b.ordre).map((zone) => (
                    <tr key={zone.id}>
                      <td className="ps-3 fw-medium">{zone.nom}</td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {zone.departements.map((d) => (
                            <Badge key={d.id} bg="light" text="dark" className="border fw-normal">
                              {d.nom}
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-center pe-3">
                        <div className="hstack gap-1 justify-content-center">
                          <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                            onClick={() => { setEditZone(zone); setZoneModal(true) }} title="Modifier">
                            <IconifyIcon icon="tabler:edit" />
                          </Button>
                          {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle"
                            onClick={() => handleDeleteZone(zone.id)} title="Supprimer">
                            <IconifyIcon icon="tabler:trash" />
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>

        {/* Aléas climatiques */}
        <Col lg={5}>
          <Card className="h-100">
            <CardHeader className="d-flex align-items-center justify-content-between">
              <div>
                <h5 className="card-title mb-0">Aléas climatiques</h5>
                <p className="text-muted small mb-0 mt-1">Types de risques évalués.</p>
              </div>
              <Button variant="success" size="sm" onClick={() => { setEditAlea(null); setAleaModal(true) }}>
                <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter
              </Button>
            </CardHeader>
            <CardBody className="p-0">
              <Table hover className="align-middle mb-0 table-sm">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3" style={{ width: 40 }}>#</th>
                    <th>Aléa</th>
                    {/* <th className="text-center" style={{ width: 70 }}>Statut</th> */}
                    <th className="text-center pe-3" style={{ width: 90 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {aleas.sort((a, b) => a.ordre - b.ordre).map((alea) => (
                    <tr key={alea.id} className={!alea.actif ? 'opacity-50' : ''}>
                      <td className="ps-3 text-muted">{alea.ordre}</td>
                      <td className="fw-medium">{alea.nom}</td>
                      {/* <td className="text-center">
                        <Badge bg={alea.actif ? 'success' : 'secondary'}>
                          {alea.actif ? 'Actif' : 'Inactif'}
                        </Badge>
                      </td> */}
                      <td className="text-center pe-3">
                        <div className="hstack gap-1 justify-content-center">
                          {/* <Button variant={alea.actif ? 'soft-warning' : 'soft-success'} size="sm"
                            className="btn-icon rounded-circle" onClick={() => handleToggleAlea(alea)}
                            title={alea.actif ? 'Désactiver' : 'Activer'}>
                            <IconifyIcon icon={alea.actif ? 'tabler:eye-off' : 'tabler:eye'} />
                          </Button> */}
                          <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                            onClick={() => { setEditAlea(alea); setAleaModal(true) }} title="Modifier">
                            <IconifyIcon icon="tabler:edit" />
                          </Button>
                          {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle"
                            onClick={() => handleDeleteAlea(alea.id)} title="Supprimer">
                            <IconifyIcon icon="tabler:trash" />
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </CardBody>
          </Card>
        </Col>
      </Row>

      {/* ── Ligne 2 : Grande table Cartographie ────────────────────────── */}
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0">Cartographie des aléas climatiques</h5>
            <p className="text-muted small mb-0 mt-1">
              Cliquez sur une cellule pour faire tourner le niveau de risque&nbsp;:
              <Badge bg="success" className="ms-2 me-1">Faible : 0%</Badge>→
              <Badge bg="warning" text="dark" className="mx-1">Moyen : 50%</Badge>→
              <Badge bg="danger" className="mx-1">Elevé : 100%</Badge>
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleSaveCarto}
            disabled={!cartoDirty || cartoSaving}>
            {cartoSaving
              ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
              : <><IconifyIcon icon="tabler:device-floppy" className="me-1" />Enregistrer</>}
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div style={{ overflowX: 'auto' }}>
            <Table bordered hover className="align-middle mb-0 table-sm" style={{ minWidth: 900 }}>
              <thead className="table-dark">
                <tr>
                  <th className="ps-3" style={{ minWidth: 160 }}>Zone climatique</th>
                  <th style={{ minWidth: 170 }}>Département</th>
                  {aleasActifs.map((a) => (
                    <th key={a.id} className="text-center" style={{ minWidth: 80, fontSize: '0.75rem', lineHeight: 1.2 }}>
                      {a.nom}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {zones.sort((a, b) => a.ordre - b.ordre).map((zone) =>
                  zone.departements.map((dept, di) => (
                    <tr key={`${zone.id}-${dept.id}`}>
                      {di === 0 && (
                        <td
                          rowSpan={zone.departements.length}
                          className="fw-semibold ps-3 align-middle"
                          style={{ background: '#f8f9fa', fontSize: '0.82rem' }}
                        >
                          {zone.nom}
                        </td>
                      )}
                      <td className="ps-2">{dept.nom}</td>
                      {aleasActifs.map((alea) => {
                        const niv = getNiveau(dept.id, alea.id)
                        const cfg = NIVEAU_CONFIG[niv]
                        return (
                          <td key={alea.id} className="text-center p-1">
                            <button
                              type="button"
                              title={`${dept.nom} / ${alea.nom} : ${niv} — cliquer pour changer`}
                              onClick={() => cycleCellule(dept.id, alea.id)}
                              className={`btn btn-sm btn-${cfg.bg} fw-bold`}
                              style={{ minWidth: 40, fontSize: '0.75rem', cursor: 'pointer' }}
                            >
                              {cfg.label}
                            </button>
                          </td>
                        )
                      })}
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>

          {/* Légende */}
          <div className="d-flex gap-3 px-3 py-2 border-top">
            {NIVEAUX.map((n) => (
              <span key={n} className="d-flex align-items-center gap-1 small text-muted">
                <Badge bg={NIVEAU_CONFIG[n].bg} text={NIVEAU_CONFIG[n].bg === 'warning' ? 'dark' : undefined}>
                  {NIVEAU_CONFIG[n].label}
                </Badge>
                {n}
              </span>
            ))}
          </div>
        </CardBody>
      </Card>

      {/* Modals */}
      <ZoneModal show={zoneModal} onHide={() => { setZoneModal(false); setEditZone(null) }}
        zone={editZone} onSaved={handleZoneSaved} />
      <AleaModal show={aleaModal} onHide={() => { setAleaModal(false); setEditAlea(null) }}
        alea={editAlea} onSaved={handleAleaSaved} />
    </>
  )
}
