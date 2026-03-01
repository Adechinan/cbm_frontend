/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import {
  Badge, Button, Card, CardBody, CardHeader,
  Col, Form, Nav, Row, Tab, Table,
} from 'react-bootstrap'
import {
  AleaClimatiqueType, BatimentType, CartoAleaType, CritereEtatBatimentType,
  CritereEvaluationType, EtatDisponible, EvaluationType, NiveauRisque, PartieOuvrageType,
  PonderationAleaType, RecensementType, TypeBatimentType, ZoneClimatiqueType,
} from '@/types/entretien-batiment'
import { saveEvaluation, updateEvaluation } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { useRouter } from 'next/navigation'

type EvalFonc = { critereId: string; elementId: string; etat: string; commentaire: string }
type EvalTech = { critereId: string; elementId: string; nature: string; constat: string; etat: string }

type Props = {
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
  // Mode édition (depuis EvaluationList)
  initialData?: EvaluationType
  editId?: string
  onSaved?: (e: EvaluationType) => void
  onCancel?: () => void
  onSavingChange?: (saving: boolean) => void
}

export type EvaluationFormHandle = {
  save: () => Promise<void>
}

const NIVEAU_POND: Record<NiveauRisque, number> = { Faible: 0, Moyen: 50, Elevé: 100 }
const NIVEAU_BG: Record<NiveauRisque, string> = { Faible: 'secondary', Moyen: 'warning', Elevé: 'danger' }

export const ETATS_COULEUR: Record<string, string> = {
  Bon: 'success', Passable: 'warning', Mauvais: 'danger', Dangereux: 'dark', 'Non évalué': 'secondary',
}

const getNote = (etats: EtatDisponible[], selected: string): number =>
  etats.find((e) => e.etat === selected)?.note ?? 0

const getMaxNote = (etats: EtatDisponible[]): number =>
  etats.reduce((max, e) => Math.max(max, e.note), 1)

/** Note d'âge : 3 si < 10 ans, 2 si 10–20 ans, 1 si > 20 ans */
const getNoteAge = (age: number): number => {
  if (age < 0) return 0
  if (age < 10) return 3
  if (age <= 20) return 2
  return 1
}

/** Boutons-onglets pour sélectionner un état */
// function EtatSelector({
//   etats,
//   value,
//   onChange,
// }: {
//   etats: EtatDisponible[]
//   value: string
//   onChange: (v: string) => void
// }) {
//   const hasNonEvalue = etats.some((e) => e.etat === 'Non évalué')
//   const allEtats: EtatDisponible[] = hasNonEvalue
//     ? etats
//     : [...etats, { etat: 'Non évalué', note: 0 }]

//   return (
//     <div className="d-flex flex-wrap gap-1">
//       {allEtats.map(({ etat }) => {
//         const bg = ETATS_COULEUR[etat] ?? 'secondary'
//         const active = value === etat
//         return (
//           <button
//             key={etat}
//             type="button"
//             onClick={() => onChange(etat)}
//             className={`btn btn-sm ${active ? `btn-${bg}` : `btn-outline-${bg}`}`}
//             style={{ fontSize: '0.72rem', fontWeight: active ? 600 : 400, padding: '0.18rem 0.5rem' }}
//           >
//             {etat}
//           </button>
//         )
//       })}
//     </div>
//   )
// }

const EvaluationForm = forwardRef<EvaluationFormHandle, Props>(function EvaluationForm({
  batiments, recensements, criteresFonctionnels, criteresTechniques, typesBatiment, criteresEtatBatiment,
  zonesClimatiques, aleasClimatiques, cartoAlea, partiesOuvrage, ponderationsAlea,
  initialData, editId, onSaved, onCancel, onSavingChange,
}, ref) {
  const { data: session } = useSession()

  const [batimentId, setBatimentId] = useState(initialData?.batimentId ?? '')
  const [recensementId, setRecensementId] = useState(initialData?.recencementId ?? '')
  const [date, setDate] = useState(initialData?.date ?? new Date().toISOString().split('T')[0])
  const [evaluateur, setEvaluateur] = useState(initialData?.evaluateur ?? '')
  const [activeTab, setActiveTab] = useState('physique')
  const [showRecapFonc, setShowRecapFonc] = useState(true)
  const [showRecapTech, setShowRecapTech] = useState(true)
  const [saving, setSaving] = useState(false)

  // Pré-remplir l'évaluateur depuis la session si création (pas d'initialData)
  useEffect(() => {
    if (!initialData?.evaluateur && session?.user?.name) {
      const sessionName = session.user.name + (session.user.email ? ` (${session.user.email})` : '')
      setEvaluateur(sessionName)
    }
  }, [session?.user?.name])  // eslint-disable-line react-hooks/exhaustive-deps

  // ── Effets climatiques ──
  const [selectedDept, setSelectedDept] = useState(
    initialData?.departementClimatique ?? ''
  )

  // Recensements validés uniquement, pour le bâtiment sélectionné
  const recensementsValidsDuBatiment = recensements.filter(
    (r) => r.batimentId === batimentId && r.statut === 'validé'
  )

  // Bâtiments ayant au moins un recensement validé
  const batimentsAvecRecensementValide = batiments.filter((b) =>
    recensements.some((r) => r.batimentId === b.id && r.statut === 'validé')
  )

  // Pré-remplir la zone et auto-sélectionner le recensement validé le plus récent
  useEffect(() => {
    const dept = initialData?.departementClimatique //batiments.find((b) => b.id === batimentId)?.departement
    if (dept) setSelectedDept(dept)
    // Sélectionner automatiquement le recensement validé le plus récent du bâtiment
    const latest = recensements
      .filter((r) => r.batimentId === batimentId && r.statut === 'validé')
      .sort((a, b) => b.date.localeCompare(a.date))[0]
    setRecensementId(latest?.id ?? '')
  }, [batimentId, batiments, recensements])

  const getDeptIdFromName = (deptName: string): string | undefined => {
    for (const zone of zonesClimatiques) {
      const found = zone.departements.find((d) => d.nom === deptName)
      if (found) return found.id
    }
    return undefined
  }

  // ── État Physique ──
  const [typeBatimentId, setTypeBatimentId] = useState(
    () => initialData?.typeBatimentId ?? typesBatiment[0]?.id ?? ''
  )
  const [anneeRef, setAnneeRef] = useState(initialData?.anneeRef ?? new Date().getFullYear())
  const [anneeRehab, setAnneeRehab] = useState(initialData?.anneeRehab ?? '')

  const [evalsFonc, setEvalsFonc] = useState<Record<string, EvalFonc>>(() => {
    const init: Record<string, EvalFonc> = {}
    for (const sec of criteresFonctionnels) {
      for (const el of sec.elements.filter((e) => e.actif)) {
        const existing = initialData?.recencement.criteresFonctionnels.find((c) => c.elementId === el.id)
        init[el.id] = {
          critereId: sec.id,
          elementId: el.id,
          etat: existing?.etat ?? 'Non évalué',
          commentaire: existing?.commentaire ?? '',
        }
      }
    }
    return init
  })

  const [evalsTech, setEvalsTech] = useState<Record<string, EvalTech>>(() => {
    const init: Record<string, EvalTech> = {}
    for (const sec of criteresTechniques) {
      for (const el of sec.elements.filter((e) => e.actif)) {
        const existing = initialData?.recencement.criteresTechniques.find((c) => c.elementId === el.id)
        init[el.id] = {
          critereId: sec.id,
          elementId: el.id,
          nature: existing?.nature ?? '',
          constat: existing?.constat ?? '',
          etat: existing?.etat ?? 'Non évalué',
        }
      }
    }
    return init
  })

  // Pré-remplir fonctionnel et technique depuis le recensement sélectionné
  useEffect(() => {
    if (!recensementId) return
    const rec = recensements.find((r) => r.id === recensementId)
    if (!rec) return

    setEvalsFonc((prev) => {
      const updated = { ...prev }
      for (const cf of rec.criteresFonctionnels) {
        if (updated[cf.elementId]) {
          updated[cf.elementId] = { ...updated[cf.elementId], etat: cf.etat, commentaire: cf.commentaire ?? '' }
        }
      }
      return updated
    })

    setEvalsTech((prev) => {
      const updated = { ...prev }
      for (const ct of rec.criteresTechniques) {
        if (updated[ct.elementId]) {
          updated[ct.elementId] = { ...updated[ct.elementId], etat: ct.etat, nature: ct.nature, constat: ct.constat }
        }
      }
      return updated
    })
  }, [recensementId, recensements])

  // ── Ref exposé au parent (Modal.Footer) ──────────────────────────────────
  const handleSaveRef = useRef<() => Promise<void>>(async () => { })
  useImperativeHandle(ref, () => ({ save: () => handleSaveRef.current() }))


  const router = useRouter()

  const handleSave = async () => {
    if (!batimentId) { alert('Veuillez sélectionner un bâtiment.'); return }
    setSaving(true)
    onSavingChange?.(true)
    try {
      // ── Calcul des valeurs résumées ──────────────────────────────────────
      const bat = batiments.find((b) => b.id === batimentId)
      const typeBat = typesBatiment.find((t) => t.id === typeBatimentId)

      const noteConst = bat ? getNoteAge(anneeRef - bat.anneeConstruction) : 0
      const noteRehab = anneeRehab ? getNoteAge(anneeRef - Number(anneeRehab)) : 0
      const pondConst = typeBat?.ponderationAnneeConstruction ?? 0
      const pondRehab = typeBat?.ponderationAnneeRehabilitation ?? 0
      const scoreAge = noteConst * (pondConst / 100) + noteRehab * (pondRehab / 100)

      const scoreFonc = criteresFonctionnels.reduce((gt, sec) => {
        const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
          const note = getNote(el.etatsDisponibles, evalsFonc[el.id]?.etat ?? 'Non évalué')
          return s + note * (el.ponderation / 100)
        }, 0)
        return gt + totalNP * (sec.ponderation / 100)
      }, 0)

      const scoreTech = criteresTechniques.reduce((gt, sec) => {
        const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
          const note = getNote(el.etatsDisponibles, evalsTech[el.id]?.etat ?? 'Non évalué')
          return s + note * (el.ponderation / 100)
        }, 0)
        return gt + totalNP * (sec.ponderation / 100)
      }, 0)

      const getScoreForCritere = (nom: string): number => {
        const n = nom.toLowerCase()
        if (n.includes('age') || n.includes('âge') || n.includes('physique')) return scoreAge
        if (n.includes('technique')) return scoreTech
        if (n.includes('fonctionnel')) return scoreFonc
        return 0
      }
      const cuRows = [...criteresEtatBatiment].sort((a, b) => a.ordre - b.ordre)
        .map((c) => ({ pondéré: getScoreForCritere(c.nom) * (c.ponderation / 100) }))
      const icb = cuRows.reduce((s, r) => s + r.pondéré, 0) / 3
      const cu = (1 - icb) * 100

      const aleasActifs = aleasClimatiques.filter((a) => a.actif).sort((a, b) => a.ordre - b.ordre)
      const getNiveau = (deptName: string, aleaId: string): NiveauRisque => {
        const deptId = getDeptIdFromName(deptName)
        if (!deptId) return 'Faible'
        return cartoAlea.find((c) => c.departementClimatiqueId === deptId && c.aleaId === aleaId)?.niveau.etat ?? 'Faible'
      }
      const getCoefClimatique = (partieId: string): number => {
        if (!selectedDept || aleasActifs.length === 0) return 0
        const vals = aleasActifs.map((a) => {
          const pondZone = NIVEAU_POND[getNiveau(selectedDept, a.id)]
          const valeur = ponderationsAlea.find(
            (p) => p.partieOuvrageId === partieId && p.aleaId === a.id
          )?.note ?? 0
          return valeur * (pondZone / 100)
        })
        return vals.reduce((s, v) => s + v, 0) / aleasActifs.length
      }

      const superficie = bat?.surfaceTotale ?? 0
      const coutGlobal = [...partiesOuvrage].sort((a, b) => a.ordre - b.ordre).reduce((total, p) => {
        const coefClim = getCoefClimatique(p.id)
        const coutEstimatif = superficie * p.prixUnitaire * (1 + cu / 100)
        const surcout = coutEstimatif * (coefClim / 100)
        return total + coutEstimatif + surcout
      }, 0)

      const payload = {
        batimentId,
        recencementId: recensementId || undefined,
        date,
        evaluateur,
        typeBatimentId,
        anneeConstruction: bat?.anneeConstruction,
        anneeRef: anneeRef || new Date().getFullYear(),
        anneeRehab: anneeRehab || undefined,
        departementClimatique: selectedDept || undefined,
        notePhysique: scoreAge,
        noteFonctionnelle: scoreFonc,
        noteTechnique: scoreTech,
        coefficientUsure: cu,
        coutGlobal,
        criteresFonctionnels: Object.values(evalsFonc),
        criteresTechniques: Object.values(evalsTech),
      }

      console.log('Batiment sélectionné :', batiments.find((b) => b.id === batimentId))
      console.log('Payload à sauvegarder :', payload)

      const result = editId
        ? await updateEvaluation(editId, payload)
        : await saveEvaluation(payload)

      if (onSaved) {
        onSaved(result)
      } else {
        router.push('/evaluations')
      }
    } finally {
      setSaving(false)
      onSavingChange?.(false)
    }
  }

  // Sync ref avec la version la plus récente de handleSave
  handleSaveRef.current = handleSave

  return (
    <>
      {/* En-tête */}
      <Card className="mb-3">
        <CardHeader className="d-flex align-items-center justify-content-between">
          <h5 className="card-title mb-0">Informations générales</h5>
          {editId ? (
            <Link href="/evaluations" className="d-flex align-items-center gap-1 small">
              —
            </Link>
          ) : (
            <Link href="/evaluations" className="d-flex align-items-center gap-1 small">
              <IconifyIcon icon="tabler:arrow-back-up" />
              Retour à la liste
            </Link>
          )}

        </CardHeader>
        <CardBody>
          <Row className="g-3">
            <Col md={5}>
              <Form.Label className="fw-medium">Bâtiment <span className="text-danger">*</span></Form.Label>
              <Form.Select value={batimentId} onChange={(e) => setBatimentId(e.target.value)} disabled={editId != null}>
                <option value="">— Sélectionner un bâtiment —</option>
                {batimentsAvecRecensementValide.map((b) => (
                  <option key={b.id} value={b.id}>[{b.code}] {b.denomination}</option>
                ))}
              </Form.Select>
              {batimentsAvecRecensementValide.length === 0 && (
                <div className="text-warning small mt-1">
                  <IconifyIcon icon="tabler:alert-triangle" className="me-1" />
                  Aucun bâtiment ne possède de recensement validé.
                </div>
              )}
            </Col>
            <Col md={3}>
              <Form.Label className="fw-medium">Date d&apos;évaluation</Form.Label>
              <Form.Control type="date" value={date} max={new Date().toISOString().split('T')[0]} onChange={(e) => setDate(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-medium">Évaluateur</Form.Label>
              <Form.Control type="text" value={evaluateur} disabled />
            </Col>
            {batimentId && (
              <Col md={6}>
                <Form.Label className="fw-medium">Recensement validé</Form.Label>
                <Form.Select value={recensementId} onChange={(e) => setRecensementId(e.target.value)}>
                  <option value="">— Aucun recensement —</option>
                  {recensementsValidsDuBatiment.map((r) => (
                    <option key={r.id} value={r.id}>
                      [{r.code}] {r.date}{r.evaluateur ? ` — ${r.evaluateur}` : ''}
                    </option>
                  ))}
                </Form.Select>
                {recensementId && (
                  <div className="text-muted small mt-1">
                    <IconifyIcon icon="tabler:info-circle" className="me-1" />
                    États fonctionnels et techniques pré-remplis depuis ce recensement.
                  </div>
                )}
              </Col>
            )}
          </Row>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k ?? 'fonctionnel')}>
            <Nav variant="tabs" className="px-3 pt-3">
              <Nav.Item><Nav.Link eventKey="physique">État Physique</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="fonctionnel">État Fonctionnel</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="technique">État Technique</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="cu">Coefficient d&apos;usure (CU)</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="climatique">Coefficient effets climatiques</Nav.Link></Nav.Item>
              <Nav.Item><Nav.Link eventKey="entretien">Besoin d&apos;entretien</Nav.Link></Nav.Item>
            </Nav>

            <Tab.Content className="p-3">

              {/* ── Physique ── */}
              <Tab.Pane eventKey="physique">
                {(() => {
                  const bat = batiments.find((b) => b.id === batimentId)
                  const typeBat = typesBatiment.find((t) => t.id === typeBatimentId)

                  // Notes calculées
                  const noteConst = bat ? getNoteAge(anneeRef - bat.anneeConstruction) : 0
                  const noteRehab = anneeRehab ? getNoteAge(anneeRef - Number(anneeRehab)) : 0

                  const pondConst = typeBat?.ponderationAnneeConstruction ?? 0
                  const pondRehab = typeBat?.ponderationAnneeRehabilitation ?? 0

                  const npConst = noteConst * (pondConst / 100)
                  const npRehab = noteRehab * (pondRehab / 100)
                  const totalNP = npConst + npRehab
                  const maxNP = 3 * (pondConst / 100) + 3 * (pondRehab / 100)
                  const ratio = maxNP > 0 ? totalNP / maxNP : 0
                  const totalPond = pondConst + pondRehab

                  const MAX_NOTE = 3

                  return (
                    <>
                      {/* Sélecteur Type de bâtiment */}
                      <Row className="g-3 mb-4">
                        <Col md={5}>
                          <Form.Label className="fw-medium">Type de bâtiment</Form.Label>
                          <Form.Select
                            value={typeBatimentId}
                            onChange={(e) => setTypeBatimentId(e.target.value)}
                            disabled={true}
                          >
                            {typesBatiment.map((t) => (
                              <option key={t.id} value={t.id}>{t.nom}</option>
                            ))}
                          </Form.Select>
                        </Col>
                      </Row>

                      {!bat && (
                        <div className="text-center text-muted py-4 fst-italic small">
                          Sélectionnez un bâtiment pour afficher le formulaire.
                        </div>
                      )}

                      {bat && (
                        <Table bordered responsive className="align-middle table-sm">
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '30%' }}>Élément</th>
                              <th className="text-center" style={{ width: '18%' }}>Année</th>
                              <th className="text-center" style={{ width: '12%' }}>Note</th>
                              <th className="text-center" style={{ width: '15%' }}>Pondération (%)</th>
                              <th className="text-center" style={{ width: '15%' }}>Note Pondérée</th>
                            </tr>
                          </thead>
                          <tbody>
                            {/* Année de référence */}
                            <tr className="table-primary">
                              <td className="fw-medium">Année de référence</td>
                              <td className="text-center">
                                <Form.Control
                                  type="number"
                                  size="sm"
                                  value={anneeRef}
                                  onChange={(e) => setAnneeRef(Number(e.target.value))}
                                  style={{ maxWidth: 90, margin: '0 auto' }}
                                />
                              </td>
                              <td className="text-center text-muted">—</td>
                              <td className="text-center text-muted">—</td>
                              <td className="text-center text-muted">—</td>
                            </tr>

                            {/* Année de construction */}
                            <tr>
                              <td className="fw-medium">Année de construction</td>
                              <td className="text-center fw-semibold">{bat.anneeConstruction}</td>
                              <td className="text-center">
                                <Badge
                                  bg={noteConst === 3 ? 'success' : noteConst === 2 ? 'warning' : 'danger'}
                                  className="fw-semibold"
                                >
                                  {noteConst}
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge bg="primary" className="fw-normal">{pondConst} %</Badge>
                              </td>
                              <td className="text-center">
                                <Badge
                                  bg={noteConst === 3 ? 'success' : noteConst === 2 ? 'warning' : 'danger'}
                                  className="fw-semibold"
                                >
                                  {npConst.toFixed(2)}
                                </Badge>
                              </td>
                            </tr>

                            {/* Année de réhabilitation */}
                            <tr>
                              <td className="fw-medium">Année de réhabilitation</td>
                              <td className="text-center">
                                <Form.Control
                                  type="number"
                                  size="sm"
                                  placeholder="(facultatif)"
                                  value={anneeRehab}
                                  onChange={(e) => setAnneeRehab(e.target.value)}
                                  style={{ maxWidth: 110, margin: '0 auto' }}
                                />
                              </td>
                              <td className="text-center">
                                {anneeRehab ? (
                                  <Badge
                                    bg={noteRehab === 3 ? 'success' : noteRehab === 2 ? 'warning' : 'danger'}
                                    className="fw-semibold"
                                  >
                                    {noteRehab}
                                  </Badge>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                              <td className="text-center">
                                <Badge bg="primary" className="fw-normal">{pondRehab} %</Badge>
                              </td>
                              <td className="text-center">
                                {anneeRehab ? (
                                  <Badge
                                    bg={noteRehab === 3 ? 'success' : noteRehab === 2 ? 'warning' : 'danger'}
                                    className="fw-semibold"
                                  >
                                    {npRehab.toFixed(2)}
                                  </Badge>
                                ) : (
                                  <span className="text-muted">—</span>
                                )}
                              </td>
                            </tr>
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td colSpan={3} className="text-end pe-3 text-muted fw-semibold small">
                                Total
                              </td>
                              <td className="text-center">
                                <Badge
                                  bg={totalPond === 100 ? 'success' : 'danger'}
                                  className="fw-bold"
                                >
                                  {totalPond} %
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge
                                  bg={ratio >= 0.7 ? 'success' : ratio >= 0.4 ? 'warning' : 'danger'}
                                  className="fw-bold"
                                >
                                  {totalNP.toFixed(2)}
                                </Badge>
                              </td>
                            </tr>
                          </tfoot>
                        </Table>
                      )}
                    </>
                  )
                })()}
              </Tab.Pane>

              {/* ── Fonctionnel ── */}
              <Tab.Pane eventKey="fonctionnel">

                {/* Récapitulatif collapsible */}
                {(() => {
                  const rows = criteresFonctionnels.map((sec) => {
                    const els = sec.elements.filter((e) => e.actif)
                    const totalNP = els.reduce((s, el) => {
                      const note = getNote(el.etatsDisponibles, evalsFonc[el.id]?.etat ?? 'Non évalué')
                      return s + note * (el.ponderation / 100)
                    }, 0)
                    const maxNP = els.reduce(
                      (s, el) => s + getMaxNote(el.etatsDisponibles) * (el.ponderation / 100), 0
                    )
                    const notePond = totalNP * (sec.ponderation / 100)
                    const maxNotePondSec = maxNP * (sec.ponderation / 100)
                    return { sec, totalNP, maxNP, notePond, maxNotePondSec }
                  })
                  const grandTotal = rows.reduce((s, r) => s + r.notePond, 0)
                  const grandTotalMax = rows.reduce((s, r) => s + r.maxNotePondSec, 0)
                  const grandRatio = grandTotalMax > 0 ? grandTotal / grandTotalMax : 0
                  const totalPondSec = rows.reduce((s, r) => s + r.sec.ponderation, 0)

                  return (
                    <div className="mb-4 border rounded overflow-hidden">
                      <button
                        type="button"
                        className="w-100 d-flex align-items-center justify-content-between px-3 py-2 bg-light border-0 text-start"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowRecapFonc((v) => !v)}
                      >
                        <span className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: 1 }}>
                          Récapitulatif — État Fonctionnel
                        </span>
                        <div className="d-flex align-items-center gap-2">
                          <Badge
                            bg={grandRatio >= 0.7 ? 'success' : grandRatio >= 0.4 ? 'warning' : 'danger'}
                            className="fw-bold"
                            style={{ fontSize: '0.78rem' }}
                          >
                            {grandTotal.toFixed(2)}
                          </Badge>
                          <i className={`tabler-chevron-${showRecapFonc ? 'up' : 'down'} text-muted`} style={{ fontSize: '0.9rem' }} />
                        </div>
                      </button>

                      {showRecapFonc && (
                        <Table bordered size="sm" className="align-middle mb-0" style={{ fontSize: '0.83rem' }}>
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '40%' }}>Élément</th>
                              <th className="text-center" style={{ width: '22%' }}>Note</th>
                              <th className="text-center" style={{ width: '15%' }}>Pondération (%)</th>
                              <th className="text-center" style={{ width: '23%' }}>Note Pondérée</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(({ sec, totalNP, maxNP, notePond }) => {
                              const r = maxNP > 0 ? totalNP / maxNP : 0
                              return (
                                <tr key={sec.id}>
                                  <td className="fw-medium">{sec.section}</td>
                                  <td className="text-center">
                                    <Badge bg={r >= 0.7 ? 'success' : r >= 0.4 ? 'warning' : 'danger'} className="fw-normal">
                                      {totalNP.toFixed(2)}
                                    </Badge>
                                  </td>
                                  <td className="text-center">
                                    <Badge bg="primary" className="fw-normal">{sec.ponderation} %</Badge>
                                  </td>
                                  <td className="text-center">
                                    <Badge bg={r >= 0.7 ? 'success' : r >= 0.4 ? 'warning' : 'danger'} className="fw-semibold">
                                      {notePond.toFixed(2)}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td className="text-end pe-2 text-muted fw-semibold small">Total général</td>
                              <td className="text-center text-muted fw-semibold small">—</td>
                              <td className="text-center">
                                <Badge
                                  bg={totalPondSec === 100 ? 'success' : 'danger'}
                                  className="fw-bold"
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  {totalPondSec} %
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge
                                  bg={grandRatio >= 0.7 ? 'success' : grandRatio >= 0.4 ? 'warning' : 'danger'}
                                  className="fw-bold"
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  {grandTotal.toFixed(2)}
                                </Badge>
                              </td>
                            </tr>
                          </tfoot>
                        </Table>
                      )}
                    </div>
                  )
                })()}

                {!batimentId ? (
                  <div className="text-center text-muted py-4 fst-italic small">
                    Sélectionnez un bâtiment pour afficher le formulaire.
                  </div>
                ) : criteresFonctionnels.map((sec) => {
                  const elementsActifs = sec.elements.filter((e) => e.actif).sort((a, b) => a.ordre - b.ordre)
                  if (!elementsActifs.length) return null

                  /* Note Pondérée totale de la section = Σ(note × pondération/100) */
                  const totalNotePond = elementsActifs.reduce((s, el) => {
                    const ev = evalsFonc[el.id]
                    const note = getNote(el.etatsDisponibles, ev?.etat ?? 'Non évalué')
                    return s + note * (el.ponderation / 100)
                  }, 0)
                  const maxNotePond = elementsActifs.reduce(
                    (s, el) => s + getMaxNote(el.etatsDisponibles) * (el.ponderation / 100), 0
                  )
                  const ratio = maxNotePond > 0 ? totalNotePond / maxNotePond : 0

                  return (
                    <div key={sec.id} className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-semibold text-muted text-uppercase mb-0" style={{ fontSize: '0.75rem', letterSpacing: 1 }}>
                          {sec.section}
                        </h6>
                        <Badge bg="primary" className="fw-normal" style={{ fontSize: '0.68rem' }}>
                          Pondération section : {sec.ponderation} %
                        </Badge>
                        <Badge
                          bg={ratio >= 0.7 ? 'success' : ratio >= 0.4 ? 'warning' : 'danger'}
                          className="fw-semibold ms-auto"
                          style={{ fontSize: '0.68rem' }}
                        >
                          Total : {totalNotePond.toFixed(2)}
                          {/* Total : {totalNotePond.toFixed(2)} / {maxNotePond.toFixed(2)} */}
                        </Badge>
                      </div>

                      <Table hover responsive className="align-middle table-sm">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '40%' }}>Critère</th>
                            <th style={{ width: '28%' }}>État</th>
                            <th className="text-center" style={{ width: '10%' }}>Note</th>
                            <th className="text-center" style={{ width: '9%' }}>Pond. (%)</th>
                            <th className="text-center" style={{ width: '13%' }}>Note Pondérée</th>
                          </tr>
                        </thead>
                        <tbody>
                          {elementsActifs.map((el) => {
                            const ev = evalsFonc[el.id]
                            const note = getNote(el.etatsDisponibles, ev.etat)
                            const maxNote = getMaxNote(el.etatsDisponibles)
                            const notePond = note * (el.ponderation / 100)
                            const isEval = ev.etat !== 'Non évalué'
                            return (
                              <tr key={el.id}>
                                <td className="fw-medium" style={{ fontSize: '0.85rem' }}>{el.libelle}</td>
                                <td>

                                  <Badge bg={ETATS_COULEUR[ev.etat] ?? 'secondary'} className="fw-normal">
                                    {ev.etat}
                                  </Badge>
                                  {/* <EtatSelector
                                      etats={el.etatsDisponibles}
                                      value={ev.etat}
                                      onChange={(v) =>
                                        setEvalsFonc((p) => ({ ...p, [el.id]: { ...p[el.id], etat: v } }))
                                      }
                                    />  */}
                                </td>
                                <td className="text-center">
                                  {isEval ? (
                                    <Badge
                                      bg={ETATS_COULEUR[ev.etat] ?? 'secondary'}
                                      className="fw-normal"
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      {note}
                                      {/* {note}/{maxNote} */}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <Badge bg="secondary" className="fw-normal">{el.ponderation} %</Badge>
                                </td>
                                <td className="text-center">
                                  {isEval ? (
                                    <Badge
                                      bg={ETATS_COULEUR[ev.etat] ?? 'secondary'}
                                      className="fw-semibold"
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      {notePond.toFixed(2)}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={4} className="ps-3 text-end text-muted fw-medium small">
                              Total Note Pondérée
                            </td>
                            <td className="text-center">
                              <Badge
                                bg={ratio >= 0.7 ? 'success' : ratio >= 0.4 ? 'warning' : 'danger'}
                                className="fw-bold"
                                style={{ fontSize: '0.8rem' }}
                              >
                                {totalNotePond.toFixed(2)}
                              </Badge>
                            </td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  )
                })}

              </Tab.Pane>

              {/* ── Technique ── */}
              <Tab.Pane eventKey="technique">

                {/* Récapitulatif collapsible */}
                {(() => {
                  const rows = criteresTechniques.map((sec) => {
                    const els = sec.elements.filter((e) => e.actif)
                    const totalNP = els.reduce((s, el) => {
                      const note = getNote(el.etatsDisponibles, evalsTech[el.id]?.etat ?? 'Non évalué')
                      return s + note * (el.ponderation / 100)
                    }, 0)
                    const maxNP = els.reduce(
                      (s, el) => s + getMaxNote(el.etatsDisponibles) * (el.ponderation / 100), 0
                    )
                    const notePond = totalNP * (sec.ponderation / 100)
                    const maxNotePondSec = maxNP * (sec.ponderation / 100)
                    return { sec, totalNP, maxNP, notePond, maxNotePondSec }
                  })
                  const grandTotal = rows.reduce((s, r) => s + r.notePond, 0)
                  const grandTotalMax = rows.reduce((s, r) => s + r.maxNotePondSec, 0)
                  const grandRatio = grandTotalMax > 0 ? grandTotal / grandTotalMax : 0
                  const totalPondSec = rows.reduce((s, r) => s + r.sec.ponderation, 0)

                  return (
                    <div className="mb-4 border rounded overflow-hidden">
                      {/* En-tête cliquable */}
                      <button
                        type="button"
                        className="w-100 d-flex align-items-center justify-content-between px-3 py-2 bg-light border-0 text-start"
                        style={{ cursor: 'pointer' }}
                        onClick={() => setShowRecapTech((v) => !v)}
                      >
                        <span className="fw-semibold text-muted text-uppercase" style={{ fontSize: '0.72rem', letterSpacing: 1 }}>
                          Récapitulatif — État Technique
                        </span>
                        <div className="d-flex align-items-center gap-2">
                          <Badge
                            bg={grandRatio >= 0.7 ? 'success' : grandRatio >= 0.4 ? 'warning' : 'danger'}
                            className="fw-bold"
                            style={{ fontSize: '0.78rem' }}
                          >
                            {grandTotal.toFixed(2)}
                            {/* {grandTotal.toFixed(2)} / {grandTotalMax.toFixed(2)} */}
                          </Badge>
                          <i className={`tabler-chevron-${showRecapTech ? 'up' : 'down'} text-muted`} style={{ fontSize: '0.9rem' }} />
                        </div>
                      </button>

                      {/* Contenu collapsible */}
                      {showRecapTech && (
                        <Table bordered size="sm" className="align-middle mb-0" style={{ fontSize: '0.83rem' }}>
                          <thead className="table-light">
                            <tr>
                              <th style={{ width: '40%' }}>Élément</th>
                              <th className="text-center" style={{ width: '22%' }}>Note</th>
                              <th className="text-center" style={{ width: '15%' }}>Pondération (%)</th>
                              <th className="text-center" style={{ width: '23%' }}>Note Pondérée</th>
                            </tr>
                          </thead>
                          <tbody>
                            {rows.map(({ sec, totalNP, maxNP, notePond, maxNotePondSec }) => {
                              const r = maxNP > 0 ? totalNP / maxNP : 0
                              return (
                                <tr key={sec.id}>
                                  <td className="fw-medium">{sec.section}</td>
                                  <td className="text-center">
                                    <Badge bg={r >= 0.7 ? 'success' : r >= 0.4 ? 'warning' : 'danger'} className="fw-normal">
                                      {totalNP.toFixed(2)}
                                      {/* {totalNP.toFixed(2)} / {maxNP.toFixed(2)} */}
                                    </Badge>
                                  </td>
                                  <td className="text-center">
                                    <Badge bg="primary" className="fw-normal">{sec.ponderation} %</Badge>
                                  </td>
                                  <td className="text-center">
                                    <Badge bg={r >= 0.7 ? 'success' : r >= 0.4 ? 'warning' : 'danger'} className="fw-semibold">
                                      {notePond.toFixed(2)}
                                      {/* {notePond.toFixed(2)} / {maxNotePondSec.toFixed(2)} */}
                                    </Badge>
                                  </td>
                                </tr>
                              )
                            })}
                          </tbody>
                          <tfoot className="table-light">
                            <tr>
                              <td className="text-end pe-2 text-muted fw-semibold small">Total général</td>
                              <td className="text-center text-muted fw-semibold small">—</td>
                              <td className="text-center">
                                <Badge
                                  bg={totalPondSec === 100 ? 'success' : 'danger'}
                                  className="fw-bold"
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  {totalPondSec} %
                                </Badge>
                              </td>
                              <td className="text-center">
                                <Badge
                                  bg={grandRatio >= 0.7 ? 'success' : grandRatio >= 0.4 ? 'warning' : 'danger'}
                                  className="fw-bold"
                                  style={{ fontSize: '0.82rem' }}
                                >
                                  {grandTotal.toFixed(2)}
                                </Badge>
                              </td>
                            </tr>
                          </tfoot>
                        </Table>
                      )}
                    </div>
                  )
                })()}

                {!batimentId ? (
                  <div className="text-center text-muted py-4 fst-italic small">
                    Sélectionnez un bâtiment pour afficher le formulaire.
                  </div>
                ) : criteresTechniques.map((sec) => {
                  const elementsActifs = sec.elements.filter((e) => e.actif).sort((a, b) => a.ordre - b.ordre)
                  if (!elementsActifs.length) return null

                  /* Note Pondérée totale de la section = Σ(note × pondération/100) */
                  const totalNotePond = elementsActifs.reduce((s, el) => {
                    const ev = evalsTech[el.id]
                    const note = getNote(el.etatsDisponibles, ev?.etat ?? 'Non évalué')
                    return s + note * (el.ponderation / 100)
                  }, 0)
                  const maxNotePond = elementsActifs.reduce(
                    (s, el) => s + getMaxNote(el.etatsDisponibles) * (el.ponderation / 100), 0
                  )
                  const ratio = maxNotePond > 0 ? totalNotePond / maxNotePond : 0

                  return (
                    <div key={sec.id} className="mb-4">
                      <div className="d-flex align-items-center gap-2 mb-2">
                        <h6 className="fw-semibold text-muted text-uppercase mb-0" style={{ fontSize: '0.75rem', letterSpacing: 1 }}>
                          {sec.section}
                        </h6>
                        <Badge bg="primary" className="fw-normal" style={{ fontSize: '0.68rem' }}>
                          Pondération section : {sec.ponderation} %
                        </Badge>
                        <Badge
                          bg={ratio >= 0.7 ? 'success' : ratio >= 0.4 ? 'warning' : 'danger'}
                          className="fw-semibold ms-auto"
                          style={{ fontSize: '0.68rem' }}
                        >
                          Total : {totalNotePond.toFixed(2)}
                        </Badge>
                      </div>

                      <Table hover responsive className="align-middle table-sm">
                        <thead className="table-light">
                          <tr>
                            <th style={{ width: '40%' }}>Élément</th>
                            <th style={{ width: '28%' }}>État</th>
                            <th className="text-center" style={{ width: '10%' }}>Note</th>
                            <th className="text-center" style={{ width: '9%' }}>Pond. (%)</th>
                            <th className="text-center" style={{ width: '13%' }}>Note Pondérée</th>
                          </tr>
                        </thead>
                        <tbody>
                          {elementsActifs.map((el) => {
                            const ev = evalsTech[el.id]
                            const note = getNote(el.etatsDisponibles, ev.etat)
                            const maxNote = getMaxNote(el.etatsDisponibles)
                            const notePond = note * (el.ponderation / 100)
                            const isEval = ev.etat !== 'Non évalué'
                            return (
                              <tr key={el.id}>
                                <td className="fw-medium" style={{ fontSize: '0.85rem' }}>
                                  {el.libelle}
                                  {el.description && <div className="text-muted small">{el.description}</div>}
                                </td>
                                <td>
                                  <Badge bg={ETATS_COULEUR[ev.etat] ?? 'secondary'} className="fw-normal">
                                    {ev.etat}
                                  </Badge>
                                  {/* <EtatSelector
                                    etats={el.etatsDisponibles}
                                    value={ev.etat}
                                    onChange={(v) =>
                                      setEvalsTech((p) => ({ ...p, [el.id]: { ...p[el.id], etat: v } }))
                                    }
                                  /> */}
                                </td>
                                <td className="text-center">
                                  {isEval ? (
                                    <Badge
                                      bg={ETATS_COULEUR[ev.etat] ?? 'secondary'}
                                      className="fw-normal"
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      {note}
                                      {/* {note}/{maxNote} */}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                  )}
                                </td>
                                <td className="text-center">
                                  <Badge bg="secondary" className="fw-normal">{el.ponderation} %</Badge>
                                </td>
                                <td className="text-center">
                                  {isEval ? (
                                    <Badge
                                      bg={ETATS_COULEUR[ev.etat] ?? 'secondary'}
                                      className="fw-semibold"
                                      style={{ fontSize: '0.78rem' }}
                                    >
                                      {notePond.toFixed(2)}
                                    </Badge>
                                  ) : (
                                    <span className="text-muted" style={{ fontSize: '0.8rem' }}>—</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                        <tfoot className="table-light">
                          <tr>
                            <td colSpan={4} className="ps-3 text-end text-muted fw-medium small">
                              Total Note Pondérée
                            </td>
                            <td className="text-center">
                              <Badge
                                bg={ratio >= 0.7 ? 'success' : ratio >= 0.4 ? 'warning' : 'danger'}
                                className="fw-bold"
                                style={{ fontSize: '0.8rem' }}
                              >
                                {totalNotePond.toFixed(2)}
                              </Badge>
                            </td>
                          </tr>
                        </tfoot>
                      </Table>
                    </div>
                  )
                })}

              </Tab.Pane>

              {/* ── Coefficient d'usure ── */}
              <Tab.Pane eventKey="cu">
                {(() => {
                  // ── Recalcul des scores depuis chaque onglet ──────────────

                  // Score Age du bâtiment (État Physique)
                  const bat = batiments.find((b) => b.id === batimentId)
                  const typeBat = typesBatiment.find((t) => t.id === typeBatimentId)
                  const noteConst = bat ? getNoteAge(anneeRef - bat.anneeConstruction) : 0
                  const noteRehab = anneeRehab ? getNoteAge(anneeRef - Number(anneeRehab)) : 0
                  const pondConst = typeBat?.ponderationAnneeConstruction ?? 0
                  const pondRehab = typeBat?.ponderationAnneeRehabilitation ?? 0
                  const scoreAge = noteConst * (pondConst / 100) + noteRehab * (pondRehab / 100)

                  // Score État Fonctionnel (grand total pondéré)
                  const scoreFonc = criteresFonctionnels.reduce((gt, sec) => {
                    const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
                      const note = getNote(el.etatsDisponibles, evalsFonc[el.id]?.etat ?? 'Non évalué')
                      return s + note * (el.ponderation / 100)
                    }, 0)
                    return gt + totalNP * (sec.ponderation / 100)
                  }, 0)

                  // Score État Technique (grand total pondéré)
                  const scoreTech = criteresTechniques.reduce((gt, sec) => {
                    const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
                      const note = getNote(el.etatsDisponibles, evalsTech[el.id]?.etat ?? 'Non évalué')
                      return s + note * (el.ponderation / 100)
                    }, 0)
                    return gt + totalNP * (sec.ponderation / 100)
                  }, 0)

                  // Correspondance nom → score
                  const getScoreForCritere = (nom: string): number => {
                    const n = nom.toLowerCase()
                    if (n.includes('age') || n.includes('âge') || n.includes('physique')) return scoreAge
                    if (n.includes('technique')) return scoreTech
                    if (n.includes('fonctionnel')) return scoreFonc
                    return 0
                  }

                  const MAX_SCORE = 3
                  const rows = [...criteresEtatBatiment]
                    .sort((a, b) => a.ordre - b.ordre)
                    .map((c) => {
                      const score = getScoreForCritere(c.nom)
                      const pondéré = score * (c.ponderation / 100)
                      return { c, score, pondéré }
                    })

                  const icbRaw = rows.reduce((s, r) => s + r.pondéré, 0)
                  const icb = icbRaw / MAX_SCORE
                  const cu = (1 - icb) * 100
                  const totalPond = rows.reduce((s, r) => s + r.c.ponderation, 0)

                  return (
                    <>
                      {/* Légende */}
                      {/* <div className="d-flex flex-wrap gap-3 mb-3" style={{ fontSize: '0.8rem' }}>
                        <span className="text-muted">
                          <span className="badge me-1" style={{ background: '#ffc107', color: '#000' }}>■</span>
                          Données à rentrer
                        </span>
                        <span className="text-muted">
                          <span className="badge bg-info me-1">■</span>
                          Calculs intermédiaires
                        </span>
                        <span className="text-muted">
                          <span className="badge bg-primary me-1">■</span>
                          Résultats
                        </span>
                      </div> */}

                      {!batimentId ? (
                        <div className="text-center text-muted py-4 fst-italic small">
                          Sélectionnez un bâtiment pour afficher le calcul.
                        </div>
                      ) : (
                        <>
                          {/* Récap Coefficient d'usure calculé */}
                          {cu && (
                            <div className={`alert ${cu < 20 ? 'alert-success' : cu < 45 ? 'alert-warning' : 'alert-danger'} d-flex align-items-center gap-2 mb-3`} role="alert">
                              <i className="tabler-alert-triangle-filled fs-5" />
                              <div>
                                <strong>Coefficient d&apos;Usure (CU) </strong> = {cu.toFixed(2)}&nbsp;%
                              </div>
                            </div>
                          )}

                          {/* Niveaux d'urgence */}
                          <h6
                            className="fw-semibold text-muted text-uppercase mt-2 mb-2"
                            style={{ fontSize: '0.75rem', letterSpacing: 1 }}
                          >
                            Seuils et Niveau d&apos;urgence
                          </h6>
                          <div className="d-flex gap-2 mb-4">
                            <div
                              className={`flex-fill text-center py-3 rounded border ${cu >= 45 ? 'border-danger bg-danger bg-opacity-10' : 'border-light bg-light'}`}
                              style={{ fontSize: '0.82rem' }}
                            >
                              <div className="fw-semibold text-danger">Entretien urgent</div>
                              <div className="text-muted small">CU ≥ 45 %</div>
                            </div>
                            <div
                              className={`flex-fill text-center py-3 rounded border ${cu >= 20 && cu < 45 ? 'border-warning bg-warning bg-opacity-10' : 'border-light bg-light'}`}
                              style={{ fontSize: '0.82rem' }}
                            >
                              <div className="fw-semibold text-warning">Entretien à planifier</div>
                              <div className="text-muted small">20 % ≤ CU &lt; 45 %</div>
                            </div>
                            <div
                              className={`flex-fill text-center py-3 rounded border ${cu < 20 ? 'border-success bg-success bg-opacity-10' : 'border-light bg-light'}`}
                              style={{ fontSize: '0.82rem' }}
                            >
                              <div className="fw-semibold text-success">Entretien pas urgent</div>
                              <div className="text-muted small">CU &lt; 20 %</div>
                            </div>
                          </div>

                          <Table bordered responsive className="align-middle" style={{ fontSize: '0.88rem' }}>
                            <thead className="table-light">
                              <tr>
                                <th style={{ width: '35%' }}>Critère</th>
                                <th className="text-center" style={{ width: '20%' }}>Pondération (%)</th>
                                <th className="text-center" style={{ width: '22%' }}>Score</th>
                                <th className="text-center" style={{ width: '23%' }}>Pondéré</th>
                              </tr>
                            </thead>
                            <tbody>
                              {rows.map(({ c, score, pondéré }) => (
                                <tr key={c.id} className="table-warning">
                                  <td className="fw-medium">{c.nom}</td>
                                  <td className="text-center">
                                    <Badge bg="secondary" className="fw-normal">{c.ponderation} %</Badge>
                                  </td>
                                  <td className="text-center">
                                    <Badge
                                      bg={score >= 2 ? 'success' : score >= 1 ? 'warning' : 'danger'}
                                      className="fw-semibold"
                                    >
                                      {score.toFixed(2)}
                                    </Badge>
                                  </td>
                                  <td className="text-center">
                                    <Badge
                                      bg={score >= 2 ? 'success' : score >= 1 ? 'warning' : 'danger'}
                                      className="fw-normal"
                                    >
                                      {pondéré.toFixed(2)}
                                    </Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                            <tfoot>
                              {/* Ligne total pondération */}
                              <tr className="table-light">
                                <td colSpan={2} className="text-end pe-3 text-muted fw-medium small">
                                  Total pondération
                                </td>
                                <td />
                                <td className="text-center">
                                  <Badge
                                    bg={totalPond === 100 ? 'success' : 'danger'}
                                    className="fw-bold"
                                  >
                                    {totalPond} %
                                  </Badge>
                                </td>
                              </tr>
                              {/* ICB — calcul intermédiaire */}
                              <tr className="table-info">
                                <td colSpan={3} className="text-end pe-3 fw-semibold">
                                  Indice de Condition du Bâtiment (ICB)
                                </td>
                                <td className="text-center">
                                  <Badge
                                    bg={icb >= 0.7 ? 'success' : icb >= 0.4 ? 'warning' : 'danger'}
                                    className="fw-bold"
                                    style={{ fontSize: '0.85rem' }}
                                  >
                                    {icb.toFixed(2)}
                                  </Badge>
                                </td>
                              </tr>
                              {/* CU — résultat final */}
                              <tr className="table-primary">
                                <td colSpan={3} className="text-end pe-3 fw-bold">
                                  Coefficient d&apos;Usure (CU)
                                </td>
                                <td className="text-center">
                                  <Badge
                                    bg={cu < 20 ? 'success' : cu < 45 ? 'warning' : 'danger'}
                                    className="fw-bold"
                                    style={{ fontSize: '0.95rem' }}
                                  >
                                    {cu.toFixed(2)} %
                                  </Badge>
                                </td>
                              </tr>
                            </tfoot>
                          </Table>

                        </>
                      )}
                    </>
                  )
                })()}
              </Tab.Pane>

              {/* ── Effets climatiques ── */}
              <Tab.Pane eventKey="climatique">
                {(() => {
                  const aleasActifs = aleasClimatiques
                    .filter((a) => a.actif)
                    .sort((a, b) => a.ordre - b.ordre)

                  const getNiveau = (dept: string, aleaId: string): NiveauRisque => {
                    const deptId = getDeptIdFromName(dept)
                    if (!deptId) return 'Faible'
                    return cartoAlea.find((c) => c.departementClimatiqueId === deptId && c.aleaId === aleaId)?.niveau.etat ?? 'Faible'
                  }

                  const getCellValue = (partieId: string, aleaId: string): number => {
                    const niveau = getNiveau(selectedDept, aleaId)
                    const pondZone = NIVEAU_POND[niveau]
                    const valeur = ponderationsAlea.find(
                      (p) => p.partieOuvrageId === partieId && p.aleaId === aleaId
                    )?.note ?? 0
                    return valeur * (pondZone / 100)
                  }

                  const partiesSorted = [...partiesOuvrage].sort((a, b) => a.ordre - b.ordre)

                  return (
                    <>
                      {/* Légende */}
                      {/* <div className="d-flex flex-wrap gap-3 mb-3" style={{ fontSize: '0.8rem' }}>
                        <span className="text-muted">
                          <span className="badge me-1" style={{ background: '#ffc107', color: '#000' }}>■</span>
                          Données à rentrer
                        </span>
                        <span className="text-muted">
                          <span className="badge me-1" style={{ background: '#fd7e14', color: '#fff' }}>■</span>
                          Calculs intermédiaires
                        </span>
                        <span className="text-muted">
                          <span className="badge me-1" style={{ background: '#ffd700', color: '#000' }}>■</span>
                          Résultats
                        </span>
                      </div> */}

                      {/* Sélecteur de zone */}
                      <Row className="g-3 mb-3">
                        <Col md={4}>
                          <Form.Label className="fw-medium">Zone climatique (Département)</Form.Label>
                          <Form.Select value={selectedDept} onChange={(e) => setSelectedDept(e.target.value)}>
                            <option value="">— Sélectionner une zone —</option>
                            {zonesClimatiques
                              .slice()
                              .sort((a, b) => a.ordre - b.ordre)
                              .map((z) => (
                                <optgroup key={z.id} label={z.nom}>
                                  {z.departements.map((d) => (
                                    <option key={d.id} value={d.nom}>{d.nom}</option>
                                  ))}
                                </optgroup>
                              ))}
                          </Form.Select>
                        </Col>
                      </Row>

                      {!selectedDept ? (
                        <div className="text-center text-muted py-4 fst-italic small">
                          Sélectionnez une zone pour afficher le calcul.
                        </div>
                      ) : (
                        <div className="overflow-auto">
                          <table
                            className="table table-bordered align-middle mb-0"
                            style={{ fontSize: '0.76rem', minWidth: 900 + aleasActifs.length * 80 }}
                          >
                            <thead>
                              {/* Ligne 1 — groupes de colonnes */}
                              <tr className="table-light">
                                <th rowSpan={3} style={{ verticalAlign: 'middle', width: '9%' }}>
                                  Éléments
                                </th>
                                <th rowSpan={3} style={{ verticalAlign: 'middle', width: '22%' }}>
                                  Parties d&apos;ouvrage
                                </th>
                                <th
                                  colSpan={aleasActifs.length}
                                  className="text-center"
                                  style={{ background: '#f0f4ff' }}
                                >
                                  Aléas Climatiques
                                </th>
                                <th
                                  rowSpan={3}
                                  className="text-center"
                                  style={{ verticalAlign: 'middle', background: '#ffd700', width: '9%' }}
                                >
                                  Moyenne Coef<br />effets clim.
                                </th>
                              </tr>

                              {/* Ligne 2 — noms des aléas */}
                              <tr>
                                {aleasActifs.map((a) => (
                                  <th
                                    key={a.id}
                                    className="text-center"
                                    style={{ background: '#f0f4ff', fontSize: '0.7rem', minWidth: 78 }}
                                  >
                                    {a.nom}
                                  </th>
                                ))}
                              </tr>

                              {/* Ligne 3 — "Niveau d'impact" */}
                              <tr>
                                <td
                                  colSpan={aleasActifs.length}
                                  className="text-center text-muted fst-italic"
                                  style={{ background: '#f0f4ff', fontSize: '0.72rem' }}
                                >
                                  Niveau d&apos;impact
                                </td>
                              </tr>
                            </thead>

                            <tbody>
                              {/* Ligne Zone */}
                              <tr style={{ background: '#fff9c4' }}>
                                <td className="fw-semibold">Zone</td>
                                <td className="fw-medium">{selectedDept}</td>
                                {aleasActifs.map((a) => {
                                  const niveau = getNiveau(selectedDept, a.id)
                                  return (
                                    <td key={a.id} className="text-center">
                                      <span className={`badge bg-${NIVEAU_BG[niveau]}`} style={{ fontSize: '0.68rem' }}>
                                        {niveau}
                                      </span>
                                    </td>
                                  )
                                })}
                                <td />
                              </tr>

                              {/* Ligne Pondération % */}
                              <tr style={{ background: '#fff9c4' }}>
                                <td className="fw-semibold">Pondération %</td>
                                <td />
                                {aleasActifs.map((a) => {
                                  const pond = NIVEAU_POND[getNiveau(selectedDept, a.id)]
                                  return (
                                    <td key={a.id} className="text-center fw-semibold">
                                      {pond}&nbsp;%
                                    </td>
                                  )
                                })}
                                <td />
                              </tr>

                              {/* Séparateur — Données Bâtiments */}
                              <tr className="table-light">
                                <td className="fw-semibold text-muted" style={{ fontSize: '0.72rem' }}>
                                  Données Bâtiments
                                </td>
                                <td className="fw-semibold text-muted" style={{ fontSize: '0.72rem' }}>
                                  Parties d&apos;ouvrage
                                </td>
                                {aleasActifs.map((a) => <td key={a.id} />)}
                                <td />
                              </tr>

                              {/* Lignes parties d'ouvrage */}
                              {partiesSorted.map((p) => {
                                const cellValues = aleasActifs.map((a) => getCellValue(p.id, a.id))
                                const moyenne = cellValues.reduce((s, v) => s + v, 0) / aleasActifs.length

                                return (
                                  <tr key={p.id}>
                                    <td />
                                    <td className="fw-medium">{p.nom}</td>
                                    {cellValues.map((v, i) => (
                                      <td key={aleasActifs[i].id} className="text-center">
                                        {v > 0
                                          ? <span style={{ color: '#0d6efd' }}>{v.toFixed(1)}&nbsp;%</span>
                                          : <span className="text-muted">0,0&nbsp;%</span>}
                                      </td>
                                    ))}
                                    <td
                                      className="text-center fw-bold"
                                      style={{ background: '#ffd700' }}
                                    >
                                      {moyenne.toFixed(1)}&nbsp;%
                                    </td>
                                  </tr>
                                )
                              })}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </>
                  )
                })()}
              </Tab.Pane>

              {/* ── Besoin d'entretien ── */}
              <Tab.Pane eventKey="entretien">
                {(() => {
                  // ── Recalcul CU ──────────────────────────────────────────
                  const bat = batiments.find((b) => b.id === batimentId)
                  const typeBat = typesBatiment.find((t) => t.id === typeBatimentId)
                  const noteConst = bat ? getNoteAge(anneeRef - bat.anneeConstruction) : 0
                  const noteRehab = anneeRehab ? getNoteAge(anneeRef - Number(anneeRehab)) : 0
                  const pondConst = typeBat?.ponderationAnneeConstruction ?? 0
                  const pondRehab = typeBat?.ponderationAnneeRehabilitation ?? 0
                  const scoreAge = noteConst * (pondConst / 100) + noteRehab * (pondRehab / 100)

                  const scoreFonc = criteresFonctionnels.reduce((gt, sec) => {
                    const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
                      const note = getNote(el.etatsDisponibles, evalsFonc[el.id]?.etat ?? 'Non évalué')
                      return s + note * (el.ponderation / 100)
                    }, 0)
                    return gt + totalNP * (sec.ponderation / 100)
                  }, 0)

                  const scoreTech = criteresTechniques.reduce((gt, sec) => {
                    const totalNP = sec.elements.filter((e) => e.actif).reduce((s, el) => {
                      const note = getNote(el.etatsDisponibles, evalsTech[el.id]?.etat ?? 'Non évalué')
                      return s + note * (el.ponderation / 100)
                    }, 0)
                    return gt + totalNP * (sec.ponderation / 100)
                  }, 0)

                  const getScoreForCritere = (nom: string): number => {
                    const n = nom.toLowerCase()
                    if (n.includes('age') || n.includes('âge') || n.includes('physique')) return scoreAge
                    if (n.includes('technique')) return scoreTech
                    if (n.includes('fonctionnel')) return scoreFonc
                    return 0
                  }

                  const cuRows = [...criteresEtatBatiment]
                    .sort((a, b) => a.ordre - b.ordre)
                    .map((c) => ({ c, pondéré: getScoreForCritere(c.nom) * (c.ponderation / 100) }))
                  const icb = cuRows.reduce((s, r) => s + r.pondéré, 0) / 3
                  const cu = (1 - icb) * 100

                  // ── Recalcul Coef Climatique par partie ──────────────────
                  const aleasActifs = aleasClimatiques
                    .filter((a) => a.actif)
                    .sort((a, b) => a.ordre - b.ordre)

                  const getNiveau = (dept: string, aleaId: string): NiveauRisque => {
                    const deptId = getDeptIdFromName(dept)
                    if (!deptId) return 'Faible'
                    return cartoAlea.find((c) => c.departementClimatiqueId === deptId && c.aleaId === aleaId)?.niveau.etat ?? 'Faible'
                  }

                  const getCellValue = (partieId: string, aleaId: string): number => {
                    const pondZone = NIVEAU_POND[getNiveau(selectedDept, aleaId)]
                    const valeur = ponderationsAlea.find(
                      (p) => p.partieOuvrageId === partieId && p.aleaId === aleaId
                    )?.note ?? 0
                    return valeur * (pondZone / 100)
                  }

                  const getCoefClimatique = (partieId: string): number => {
                    if (!selectedDept || aleasActifs.length === 0) return 0
                    const vals = aleasActifs.map((a) => getCellValue(partieId, a.id))
                    return vals.reduce((s, v) => s + v, 0) / aleasActifs.length
                  }

                  // ── Calculs entretien ────────────────────────────────────
                  const superficie = bat?.surfaceTotale ?? 0
                  const partiesSorted = [...partiesOuvrage].sort((a, b) => a.ordre - b.ordre)

                  const lignes = partiesSorted.map((p) => {
                    const coefClim = getCoefClimatique(p.id)
                    const coutEstimatif = superficie * p.prixUnitaire * (1 + cu / 100)
                    const surcout = coutEstimatif * (coefClim / 100)
                    const coutGlobal = coutEstimatif + surcout
                    return { p, coefClim, coutEstimatif, surcout, coutGlobal }
                  })

                  const totalEstimatif = lignes.reduce((s, l) => s + l.coutEstimatif, 0)
                  const totalSurcout = lignes.reduce((s, l) => s + l.surcout, 0)
                  const totalGlobal = lignes.reduce((s, l) => s + l.coutGlobal, 0)

                  const urgence = cu >= 45 ? 'urgent' : cu >= 20 ? 'planifier' : 'ok'

                  const fmt = (n: number) =>
                    n.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })

                  return (
                    <>
                      {!batimentId ? (
                        <div className="text-center text-muted py-4 fst-italic small">
                          Sélectionnez un bâtiment pour afficher le calcul.
                        </div>
                      ) : (
                        <>
                          {/* Bannière recommandation */}
                          {urgence === 'urgent' && (
                            <div className="alert alert-danger d-flex align-items-center gap-2 mb-3" role="alert">
                              <i className="tabler-alert-triangle-filled fs-5" />
                              <div>
                                <strong>URGENT</strong> — Entretien immédiat requis (CU = {cu.toFixed(1)}&nbsp;%)
                              </div>
                            </div>
                          )}
                          {urgence === 'planifier' && (
                            <div className="alert alert-warning d-flex align-items-center gap-2 mb-3" role="alert">
                              <i className="tabler-clock-exclamation fs-5" />
                              <div>
                                <strong>À PLANIFIER</strong> — Entretien à programmer (CU = {cu.toFixed(1)}&nbsp;%)
                              </div>
                            </div>
                          )}
                          {urgence === 'ok' && (
                            <div className="alert alert-success d-flex align-items-center gap-2 mb-3" role="alert">
                              <i className="tabler-circle-check fs-5" />
                              <div>
                                <strong>PAS URGENT</strong> — Bâtiment en bon état (CU = {cu.toFixed(1)}&nbsp;%)
                              </div>
                            </div>
                          )}

                          {/* Récapitulatif coût global */}
                          <div className="row g-3 mb-4">
                            <div className="col-md-4">
                              <div className="border rounded p-3 text-center h-100" style={{ background: '#f8f9fa' }}>
                                <div className="text-muted small mb-1">Coût estimatif maintenance</div>
                                <div className="fw-bold fs-6">{fmt(totalEstimatif)} FCFA</div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div className="border rounded p-3 text-center h-100" style={{ background: '#fff8e1' }}>
                                <div className="text-muted small mb-1">Surcoût effets climatiques</div>
                                <div className="fw-bold fs-6 text-warning">{fmt(totalSurcout)} FCFA</div>
                              </div>
                            </div>
                            <div className="col-md-4">
                              <div
                                className="border rounded p-3 text-center h-100"
                                style={{ background: urgence === 'urgent' ? '#fff0f0' : urgence === 'planifier' ? '#fffbe6' : '#f0fff4' }}
                              >
                                <div className="text-muted small mb-1">Coût global total</div>
                                <div
                                  className="fw-bold fs-5"
                                  style={{ color: urgence === 'urgent' ? '#dc3545' : urgence === 'planifier' ? '#f0a500' : '#198754' }}
                                >
                                  {fmt(totalGlobal)} FCFA
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="overflow-auto">
                            <table
                              className="table table-bordered align-middle mb-0"
                              style={{ fontSize: '0.82rem', minWidth: 950 }}
                            >
                              <thead className="table-light">
                                <tr>
                                  <th style={{ width: '18%' }}>Parties d&apos;ouvrages</th>
                                  <th className="text-center" style={{ width: '9%' }}>Superficie (m²)</th>
                                  <th className="text-center" style={{ width: '10%' }}>Prix Unit. réf.</th>
                                  <th className="text-center" style={{ width: '10%' }}>Prix Unit. (/m²)</th>
                                  <th className="text-center" style={{ width: '8%' }}>Coéf d&apos;Usure</th>
                                  <th className="text-center" style={{ width: '14%' }}>Coût estimatif (FCFA)</th>
                                  <th className="text-center" style={{ width: '9%' }}>Coéf effets Clim.</th>
                                  <th className="text-center" style={{ width: '11%' }}>Surcoût (FCFA)</th>
                                  <th className="text-center" style={{ width: '11%' }}>Coût global (FCFA)</th>
                                </tr>
                              </thead>
                              <tbody>
                                {lignes.map(({ p, coefClim, coutEstimatif, surcout, coutGlobal }) => (
                                  <tr key={p.id}>
                                    <td className="fw-medium">{p.nom}</td>
                                    <td className="text-center">{fmt(superficie)}</td>
                                    <td className="text-center text-muted">{p.prixUnitaireRef}</td>
                                    <td className="text-center">{fmt(p.prixUnitaire)}</td>
                                    <td className="text-center">
                                      <Badge
                                        bg={cu < 20 ? 'success' : cu < 45 ? 'warning' : 'danger'}
                                        className="fw-normal"
                                      >
                                        {cu.toFixed(1)}&nbsp;%
                                      </Badge>
                                    </td>
                                    <td className="text-center fw-semibold">{fmt(coutEstimatif)}</td>
                                    <td className="text-center">
                                      {selectedDept
                                        ? <span style={{ color: '#0d6efd' }}>{coefClim.toFixed(1)}&nbsp;%</span>
                                        : <span className="text-muted fst-italic small">—</span>}
                                    </td>
                                    <td className="text-center">{fmt(surcout)}</td>
                                    <td className="text-center fw-bold">{fmt(coutGlobal)}</td>
                                  </tr>
                                ))}
                              </tbody>
                              <tfoot>
                                <tr className="table-primary">
                                  <td className="fw-bold" colSpan={5}>TOTAL MAINTENANCE</td>
                                  <td className="text-center fw-bold">{fmt(totalEstimatif)}</td>
                                  <td />
                                  <td className="text-center fw-bold">{fmt(totalSurcout)}</td>
                                  <td className="text-center fw-bold">{fmt(totalGlobal)}</td>
                                </tr>
                              </tfoot>
                            </table>
                          </div>

                          <p className="text-muted fst-italic mt-2" style={{ fontSize: '0.78rem' }}>
                            <strong>NB&nbsp;:</strong> la superficie du bâtiment correspond à la superficie au sol multipliée par le nombre d&apos;étages.
                          </p>
                        </>
                      )}
                    </>
                  )
                })()}
              </Tab.Pane>

            </Tab.Content>
          </Tab.Container>
        </CardBody>
      </Card>

      {/* Boutons — masqués en mode modal (onCancel défini), gérés par Modal.Footer */}
      {!onCancel && (
        <div
          className="d-flex justify-content-end gap-2 bg-white border-top px-4 py-3"
          style={{ position: 'sticky', bottom: 0, zIndex: 100, boxShadow: '0 -2px 8px rgba(0,0,0,.06)' }}
        >
          {/* <Button variant="light">Annuler</Button> */}
          <Button variant="primary" onClick={handleSave} disabled={saving || !batimentId}>
            {saving
              ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
              : <><i className="tabler-device-floppy me-1" />Enregistrer l&apos;évaluation</>
            }
          </Button>
        </div>
      )}
    </>
  )
})

export default EvaluationForm
