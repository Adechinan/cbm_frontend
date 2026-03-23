/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import {
  Badge, Button, Card, CardBody, CardHeader, Table,
} from 'react-bootstrap'
import {
  AleaClimatiqueType, CritereEvalPonderationType, PartieOuvrageType, PonderationAleaType,
} from '@/types/entretien-batiment'
import {
  deleteCritereEvalPonderation, savePonderationsAlea,
} from '@/services/batimentService'
import CritereEvalModal from './CritereEvalModal'
import CalcPonderationManager from './CalcPonderationManager'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

// ─── Types ────────────────────────────────────────────────────────────────────

type Props = {
  partiesInit:  PartieOuvrageType[]
  aleasInit:    AleaClimatiqueType[]
  ponderInit:   PonderationAleaType[]
  criteresInit: CritereEvalPonderationType[]
}

// ─── Composant ───────────────────────────────────────────────────────────────

export default function PonderationManager({
  partiesInit, aleasInit, ponderInit, criteresInit,
}: Props) {
  const [criteres, setCriteres] = useState<CritereEvalPonderationType[]>(criteresInit)

  // ponderMap[partieId][aleaId] = valeur (%)
  const [ponderMap, setPonderMap] = useState<Record<string, Record<string, number>>>(() => {
    const map: Record<string, Record<string, number>> = {}
    for (const p of ponderInit) {
      if (!map[p.partieOuvrageId]) map[p.partieOuvrageId] = {}
      map[p.partieOuvrageId][p.aleaId] = p.note
    }
    return map
  })

  const [ponderDirty,  setPonderDirty]  = useState(false)
  const [ponderSaving, setPonderSaving] = useState(false)

  // Critères modal
  const [critereModal, setCritereModal] = useState(false)
  const [editCritere,  setEditCritere]  = useState<CritereEvalPonderationType | null>(null)

  const parties     = [...partiesInit].sort((a, b) => a.ordre - b.ordre)
  const aleasActifs = aleasInit.filter((a) => a.actif).sort((a, b) => a.ordre - b.ordre)

  // ── CRUD Critères d'évaluation ───────────────────────────────────────────────

  const handleCritereSaved = (saved: CritereEvalPonderationType) => {
    setCriteres((c) => {
      const exists = c.find((x) => x.id === saved.id)
      return exists ? c.map((x) => (x.id === saved.id ? saved : x)) : [...c, saved]
    })
    setCritereModal(false)
    setEditCritere(null)
  }

  const handleDeleteCritere = async (id: string) => {
    if (!confirm('Supprimer ce critère ?')) return
    await deleteCritereEvalPonderation(id)
    setCriteres((c) => c.filter((x) => x.id !== id))
  }

  // ── Matrice de pondération ───────────────────────────────────────────────────

  const getValeur = (partieId: string, aleaId: string): number =>
    ponderMap[partieId]?.[aleaId] ?? 0

  const handleCellChange = (partieId: string, aleaId: string, val: number) => {
    setPonderMap((prev) => ({
      ...prev,
      [partieId]: { ...(prev[partieId] ?? {}), [aleaId]: val },
    }))
    setPonderDirty(true)
  }

  const handleSavePonder = async () => {
    setPonderSaving(true)
    try {
      const flat: PonderationAleaType[] = []
      for (const partieId in ponderMap) {
        for (const aleaId in ponderMap[partieId]) {
          flat.push({ partieOuvrageId: partieId, aleaId, note: ponderMap[partieId][aleaId] })
        }
      }
      await savePonderationsAlea(flat)
      setPonderDirty(false)
    } finally {
      setPonderSaving(false)
    }
  }

  const totalParAlea = (aleaId: string): number =>
    parties.reduce((sum, p) => sum + (ponderMap[p.id]?.[aleaId] ?? 0), 0)

  const totalPoids = criteres.reduce((s, c) => s + c.poids, 0)

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <>
      {/* ── Matrice de pondération des aléas ─────────────────────────────── */}
      <Card className="mb-3">
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0">Pondération des aléas climatiques</h5>
            <p className="text-muted small mb-0 mt-1">
              Saisissez le pourcentage de pondération pour chaque partie d&apos;ouvrage par aléa.
              Le total de chaque colonne doit être égal à&nbsp;100&nbsp;%.
              Gérez les parties dans <strong>Paramétrage → Bâtiment</strong>.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={handleSavePonder}
            disabled={!ponderDirty || ponderSaving}>
            {ponderSaving
              ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
              : <><IconifyIcon icon="tabler:device-floppy" className="me-1" />Enregistrer</>}
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <div style={{ overflowX: 'auto' }}>
            <Table bordered hover className="align-middle mb-0 table-sm" style={{ minWidth: 900 }}>
              <thead className="table-dark">
                <tr>
                  <th className="ps-3" style={{ minWidth: 260 }}>Parties d&apos;ouvrage</th>
                  {aleasActifs.map((a) => (
                    <th key={a.id} className="text-center"
                      style={{ minWidth: 90, fontSize: '0.73rem', lineHeight: 1.2 }}>
                      {a.nom}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {parties.map((partie) => (
                  <tr key={partie.id}>
                    <td className="ps-3 fw-medium" style={{ fontSize: '0.82rem' }}>{partie.nom}</td>
                    {aleasActifs.map((alea) => {
                      const val = getValeur(partie.id, alea.id).toFixed(0)
                      return (
                        <td key={alea.id} className="text-center p-1">
                          <input
                            type="number"
                            min={0}
                            max={100}
                            step={1}
                            value={val}
                            onChange={(e) =>
                              handleCellChange(partie.id, alea.id, Number(e.target.value))
                            }
                            className="form-control form-control-sm text-center px-1"
                            style={{ width: 58, fontSize: '0.78rem', margin: '0 auto' }}
                            aria-label={`${partie.nom} / ${alea.nom}`}
                          />
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
              <tfoot className="table-light fw-semibold">
                <tr>
                  <td className="ps-3" style={{ fontSize: '0.82rem' }}>Total (%)</td>
                  {aleasActifs.map((alea) => {
                    const total = totalParAlea(alea.id).toFixed(0)
                    return (
                      <td key={alea.id} className="text-center"
                        style={{ fontSize: '0.82rem', color: Number(total) === 100 ? '#198754' : '#dc3545' }}>
                        {total}
                      </td>
                    )
                  })}
                </tr>
              </tfoot>
            </Table>
          </div>
        </CardBody>
      </Card>

      {/* ── Critères d'évaluation des pondérations ───────────────────────── */}
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0">Critères pour évaluation des pondérations climatiques</h5>
            <p className="text-muted small mb-0 mt-1">
              La somme des poids doit être égale à&nbsp;1.
            </p>
          </div>
          <Button variant="primary" size="sm" onClick={() => { setEditCritere(null); setCritereModal(true) }}>
            <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter
          </Button>
        </CardHeader>
        <CardBody className="p-0">
          <Table hover className="align-middle mb-0 table-sm">
            <thead className="table-light">
              <tr>
                <th className="ps-3" style={{ width: 40 }}>#</th>
                <th style={{ minWidth: 160 }}>Critère</th>
                <th>Définition</th>
                <th className="text-center" style={{ width: 90 }}>Poids</th>
                <th className="text-center pe-3" style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {[...criteres].sort((a, b) => a.ordre - b.ordre).map((c) => (
                <tr key={c.id}>
                  <td className="ps-3 text-muted">{c.ordre}</td>
                  <td className="fw-medium">{c.nom}</td>
                  <td className="text-muted small">{c.definition}</td>
                  <td className="text-center">
                    <Badge bg="primary">{c.poids.toFixed(2)}</Badge>
                  </td>
                  <td className="text-center pe-3">
                    <div className="hstack gap-1 justify-content-center">
                      <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                        onClick={() => { setEditCritere(c); setCritereModal(true) }} title="Modifier">
                        <IconifyIcon icon="tabler:edit" />
                      </Button>
                      {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle"
                        onClick={() => handleDeleteCritere(c.id)} title="Supprimer">
                        <IconifyIcon icon="tabler:trash" />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="table-light fw-semibold">
              <tr>
                <td colSpan={3} className="ps-3" style={{ fontSize: '0.82rem' }}>Total poids</td>
                <td className="text-center"
                  style={{ color: Math.abs(totalPoids - 1) < 0.001 ? '#198754' : '#dc3545' }}>
                  {totalPoids.toFixed(2)}
                </td>
                <td />
              </tr>
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <CritereEvalModal
        show={critereModal}
        onHide={() => { setCritereModal(false); setEditCritere(null) }}
        critere={editCritere}
        onSaved={handleCritereSaved}
      />

      {/* ── Calcul de pondération par scores ─────────────────────────────── */}
      <hr className="my-4" />
      <CalcPonderationManager
        partiesInit={partiesInit}
        aleasInit={aleasInit}
        ponderInit={ponderInit}
        criteresInit={criteres}
      />
    </>
  )
}
