/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import {
  Badge, Button, Card, CardBody, CardHeader, Table,
} from 'react-bootstrap'
import {
  AleaClimatiqueType, CritereEvalPonderationType, PartieOuvrageType, PonderationAleaType,
} from '@/types/entretien-batiment'
import { savePonderationsAlea } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

// ─── Types internes ───────────────────────────────────────────────────────────

type ScoreCell = { expo: number; sens: number; imp: number }

type Props = {
  partiesInit:  PartieOuvrageType[]
  aleasInit:    AleaClimatiqueType[]
  ponderInit:   PonderationAleaType[]
  criteresInit: CritereEvalPonderationType[]
}

// ─── Composant ────────────────────────────────────────────────────────────────

export default function CalcPonderationManager({
  partiesInit, aleasInit, ponderInit, criteresInit,
}: Props) {
  const parties = [...partiesInit].sort((a, b) => a.ordre - b.ordre)
  const aleas   = aleasInit.filter((a) => a.actif).sort((a, b) => a.ordre - b.ordre)

  // Poids depuis les critères configurés
  const pExp  = criteresInit.find((c) => c.nom === 'Exposition')?.poids            ?? 0.45
  const pSens = criteresInit.find((c) => c.nom === 'Sensibilité')?.poids           ?? 0.35
  const pImp  = criteresInit.find((c) => c.nom === 'Importance fonctionnelle')?.poids ?? 0.20

  // scoreMap[partieId][aleaId] = { expo, sens, imp }
  const [scoreMap, setScoreMap] = useState<Record<string, Record<string, ScoreCell>>>(() => {
    const map: Record<string, Record<string, ScoreCell>> = {}
    for (const p of ponderInit) {
      if (!map[p.partieOuvrageId]) map[p.partieOuvrageId] = {}
      map[p.partieOuvrageId][p.aleaId] = {
        expo: p.exposition              ?? 1,
        sens: p.sensibilite             ?? 1,
        imp:  p.importanceFonctionnelle ?? 1,
      }
    }
    return map
  })

  const [dirty,  setDirty]  = useState(false)
  const [saving, setSaving] = useState(false)

  // ── Calculs ────────────────────────────────────────────────────────────────

  const getScore = (partieId: string, aleaId: string): ScoreCell =>
    scoreMap[partieId]?.[aleaId] ?? { expo: 1, sens: 1, imp: 1 }

  const noteTotal = (cell: ScoreCell) =>
    Number((cell.expo * pExp + cell.sens * pSens + cell.imp * pImp).toFixed(2))

  const sumNotes = (aleaId: string) =>
    parties.reduce((sum, p) => Number((sum + noteTotal(getScore(p.id, aleaId))).toFixed(2)), 0)

  const ponderPct = (partieId: string, aleaId: string) => {
    const sum = sumNotes(aleaId)
    return Math.round(sum > 0 ? (noteTotal(getScore(partieId, aleaId)) / sum) * 100 : 0)
  }

  const totalPonder = (aleaId: string) =>
    parties.reduce((sum, p) => sum + ponderPct(p.id, aleaId), 0)

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleChange = (
    partieId: string, aleaId: string, field: keyof ScoreCell, val: number,
  ) => {
    setScoreMap((prev) => ({
      ...prev,
      [partieId]: {
        ...(prev[partieId] ?? {}),
        [aleaId]: { ...getScore(partieId, aleaId), [field]: val },
      },
    }))
    setDirty(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const flat: PonderationAleaType[] = parties.flatMap((partie) =>
        aleas.map((alea) => {
          const cell = getScore(partie.id, alea.id)
          return {
            partieOuvrageId:         partie.id,
            aleaId:                  alea.id,
            exposition:              cell.expo,
            sensibilite:             cell.sens,
            importanceFonctionnelle: cell.imp,
            note:                    ponderPct(partie.id, alea.id),
          }
        })
      )
      await savePonderationsAlea(flat)
      setDirty(false)
    } finally {
      setSaving(false)
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <>
      {/* En-tête */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <h5 className="mb-0">Calcul de pondération par aléa climatique</h5>
          <p className="text-muted small mb-0 mt-1">
            Saisissez les scores (1 = faible · 2 = moyen · 3 = fort) pour chaque lot et chaque aléa.
            La pondération est calculée automatiquement.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={handleSave} disabled={!dirty || saving}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
            : <><IconifyIcon icon="tabler:device-floppy" className="me-1" />Enregistrer</>}
        </Button>
      </div>

      {/* Une carte par aléa */}
      {aleas.map((alea) => {
        const total = totalPonder(alea.id)
        const isOk  = Math.abs(total - 100) < 0.5
        return (
          <Card key={alea.id} className="mb-3">
            <CardHeader className="py-2 d-flex align-items-center gap-2">
              <span className="fw-semibold text-uppercase" style={{ fontSize: '0.78rem', letterSpacing: 0.8 }}>
                {alea.nom}
              </span>
              <Badge bg={isOk ? 'success' : 'warning'} className="fw-normal" style={{ fontSize: '0.72rem' }}>
                Total : {total.toFixed(1)} %
              </Badge>
            </CardHeader>
            <CardBody className="p-0">
              <div style={{ overflowX: 'auto' }}>
                <Table hover bordered className="align-middle mb-0 table-sm" style={{ minWidth: 680 }}>
                  <thead className="table-light">
                    <tr>
                      <th className="ps-3" style={{ minWidth: 230 }}>Lot / Partie d&apos;ouvrage</th>
                      <th className="text-center" style={{ width: 90 }}>Exposition</th>
                      <th className="text-center" style={{ width: 90 }}>Sensibilité</th>
                      <th className="text-center" style={{ width: 120 }}>Imp. Fonct.</th>
                      <th className="text-center" style={{ width: 100 }}>Note totale</th>
                      <th className="text-center" style={{ width: 110 }}>Pondération (%)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {parties.map((partie) => {
                      const cell = getScore(partie.id, alea.id)
                      const note = noteTotal(cell)
                      const pond = ponderPct(partie.id, alea.id)
                      return (
                        <tr key={partie.id}>
                          <td className="ps-3 fw-medium" style={{ fontSize: '0.82rem' }}>{partie.nom}</td>
                          {(['expo', 'sens', 'imp'] as const).map((field) => (
                            <td key={field} className="text-center p-1">
                              <select
                                value={cell[field]}
                                onChange={(e) =>
                                  handleChange(partie.id, alea.id, field, Number(e.target.value))
                                }
                                className="form-select form-select-sm text-center px-1"
                                style={{ width: 68, margin: '0 auto' }}
                                aria-label={`${field} — ${partie.nom}`}
                              >
                                <option value={1}>1</option>
                                <option value={2}>2</option>
                                <option value={3}>3</option>
                              </select>
                            </td>
                          ))}
                          <td className="text-center">
                            <Badge bg="secondary" className="fw-normal">{note.toFixed(2)}</Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg="info" className="fw-normal">{(pond)} %</Badge>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                  <tfoot className="table-light fw-semibold">
                    <tr>
                      <td colSpan={4} className="ps-3" style={{ fontSize: '0.82rem' }}>Total pondération</td>
                      <td className="text-center">
                        <Badge bg="info"className="fw-semibold">
                          {sumNotes(alea.id)}
                        </Badge>
                      </td>
                      <td className="text-center">
                        <Badge bg={isOk ? 'success' : 'danger'} className="fw-semibold">
                          {total.toFixed(0)} %
                        </Badge>
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </CardBody>
          </Card>
        )
      })}

      {aleas.length === 0 && (
        <div className="text-center text-muted py-5 fst-italic">
          Aucun aléa climatique actif configuré.
        </div>
      )}
    </>
  )
}
