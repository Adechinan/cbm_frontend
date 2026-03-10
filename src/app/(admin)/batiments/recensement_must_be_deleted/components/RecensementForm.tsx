/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import {
  Badge, Button, Card, CardBody, CardHeader,
  Col, Form, Nav, Row, Tab, Table,
} from 'react-bootstrap'
import { BatimentType, CritereEvaluationType } from '@/types/entretien-batiment'
import { saveRecensement } from '@/services/batimentService'
import FonctionnelGroupedForm from '../../components/FonctionnelGroupedForm'
import TechniqueGroupedForm from '../../components/TechniqueGroupedForm'

type EvalFonc = { critereId: string; elementId: string; etat: string; commentaire: string }
type EvalTech = { critereId: string; elementId: string; nature: string; constat: string; etat: string }

type Props = {
  batiments: BatimentType[]
  criteresFonctionnels: CritereEvaluationType[]
  criteresTechniques: CritereEvaluationType[]
}

const ETATS_COULEUR: Record<string, string> = {
  Bon: 'success', Passable: 'warning', Mauvais: 'danger', Dangereux: 'dark', 'Non évalué': 'secondary',
}

export default function RecensementForm({
  batiments, criteresFonctionnels, criteresTechniques,
}: Props) {
  const [batimentId, setBatimentId] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [evaluateur, setEvaluateur] = useState('')
  const [activeTab, setActiveTab] = useState('fonctionnel')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  // ── Listes à plat de tous les éléments actifs ────────────────────────────────
  const [evalsFonc, setEvalsFonc] = useState<EvalFonc[]>(() =>
    criteresFonctionnels.flatMap((sec) =>
      sec.elements
        .filter((e) => e.actif)
        .sort((a, b) => a.ordre - b.ordre)
        .map((el) => ({ critereId: sec.id, elementId: el.id, etat: 'Non évalué', commentaire: '' }))
    )
  )

  const [evalsTech, setEvalsTech] = useState<EvalTech[]>(() =>
    criteresTechniques.flatMap((sec) =>
      sec.elements
        .filter((e) => e.actif)
        .sort((a, b) => a.ordre - b.ordre)
        .map((el) => ({ critereId: sec.id, elementId: el.id, nature: '', constat: '', etat: 'Non évalué' }))
    )
  )

  // ── Index elementId → { libelle, section, etats } ───────────────────────────
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

  const groupedEvalsFonc = criteresFonctionnels
    .map((critere) => ({
      critereId: critere.id,
      section: critere.section,
      rows: evalsFonc.filter((item) => item.critereId === critere.id),
    }))
    .filter((group) => group.rows.length > 0)

  const groupedEvalsTech = criteresTechniques
    .map((critere) => ({
      critereId: critere.id,
      section: critere.section,
      rows: evalsTech.filter((item) => item.critereId === critere.id),
    }))
    .filter((group) => group.rows.length > 0)

  const handleSave = async () => {
    if (!batimentId) { alert('Veuillez sélectionner un bâtiment.'); return }
    setSaveError(null)
    setSaving(true)
    try {
      await saveRecensement({
        batimentId,
        date,
        evaluateur,
        criteresFonctionnels: evalsFonc,
        criteresTechniques: evalsTech,
      })
      setSaved(true)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Erreur lors de l\'enregistrement.')
    } finally {
      setSaving(false)
    }
  }

  if (saved) {
    return (
      <Card className="text-center py-5">
        <CardBody>
          <i className="tabler-circle-check text-success" style={{ fontSize: '3rem' }} />
          <h4 className="mt-3">Recensement enregistré !</h4>
          <p className="text-muted">Les données ont été sauvegardées avec succès.</p>
          <Button variant="primary" onClick={() => setSaved(false)}>Nouveau recensement</Button>
        </CardBody>
      </Card>
    )
  }

  return (
    <>
      {/* En-tête */}
      <Card className="mb-3">
        <CardHeader><h5 className="card-title mb-0">Informations générales</h5></CardHeader>
        <CardBody>
          <Row className="g-3">
            <Col md={5}>
              <Form.Label className="fw-medium">Bâtiment <span className="text-danger">*</span></Form.Label>
              <Form.Select value={batimentId} onChange={(e) => setBatimentId(e.target.value)}>
                <option value="">— Sélectionner un bâtiment —</option>
                {batiments.map((b) => (
                  <option key={b.id} value={b.id}>[{b.code}] {b.denomination}</option>
                ))}
              </Form.Select>
            </Col>
            <Col md={3}>
              <Form.Label className="fw-medium">Date de recensement</Form.Label>
              <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
            </Col>
            <Col md={4}>
              <Form.Label className="fw-medium">Évaluateur</Form.Label>
              <Form.Control
                type="text"
                placeholder="Nom de l'évaluateur"
                value={evaluateur}
                onChange={(e) => setEvaluateur(e.target.value)}
              />
            </Col>
          </Row>
        </CardBody>
      </Card>

      {/* Tabs */}
      <Card>
        <CardBody className="p-0">
          <Tab.Container activeKey={activeTab} onSelect={(k) => setActiveTab(k ?? 'fonctionnel')}>
            <Nav variant="tabs" className="px-3 pt-3">
              <Nav.Item>
                <Nav.Link eventKey="fonctionnel">
                  État Fonctionnel
                  {/* État Fonctionnel ({evalsFonc.length}) */}
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="technique">
                  État Technique
                  {/* État Technique ({evalsTech.length}) */}
                </Nav.Link>
              </Nav.Item>
            </Nav>

            <Tab.Content className="p-3">

              {/* ── Fonctionnel ── */}
              <Tab.Pane eventKey="fonctionnel">
                {!batimentId ? (
                  <div className="text-center text-muted py-4 fst-italic small">
                    Sélectionnez un bâtiment pour afficher le formulaire.
                  </div>
                ) : (
                  <FonctionnelGroupedForm
                    groups={groupedEvalsFonc}
                    mapFonc={mapFonc}
                    etatsCouleur={ETATS_COULEUR}
                    onChangeEtat={(critereId, elementId, value) => {
                      setEvalsFonc((prev) =>
                        prev.map((x) =>
                          x.critereId === critereId && x.elementId === elementId
                            ? { ...x, etat: value }
                            : x
                        )
                      )
                    }}
                    onChangeCommentaire={(critereId, elementId, value) => {
                      setEvalsFonc((prev) =>
                        prev.map((x) =>
                          x.critereId === critereId && x.elementId === elementId
                            ? { ...x, commentaire: value }
                            : x
                        )
                      )
                    }}
                  />
                )}
              </Tab.Pane>

              {/* ── Technique ── */}
              <Tab.Pane eventKey="technique">
                {!batimentId ? (
                  <div className="text-center text-muted py-4 fst-italic small">
                    Sélectionnez un bâtiment pour afficher le formulaire.
                  </div>
                ) : (
                  <TechniqueGroupedForm
                    groups={groupedEvalsTech}
                    mapTech={mapTech}
                    etatsCouleur={ETATS_COULEUR}
                    onChangeEtat={(critereId, elementId, value) => {
                      setEvalsTech((prev) =>
                        prev.map((x) =>
                          x.critereId === critereId && x.elementId === elementId
                            ? { ...x, etat: value }
                            : x
                        )
                      )
                    }}
                    // onChangeNature={(critereId, elementId, value) => {
                    //   setEvalsTech((prev) =>
                    //     prev.map((x) =>
                    //       x.critereId === critereId && x.elementId === elementId
                    //         ? { ...x, nature: value }
                    //         : x
                    //     )
                    //   )
                    // }}
                    onChangeConstat={(critereId, elementId, value) => {
                      setEvalsTech((prev) =>
                        prev.map((x) =>
                          x.critereId === critereId && x.elementId === elementId
                            ? { ...x, constat: value }
                            : x
                        )
                      )
                    }}
                  />
                )}
              </Tab.Pane>

            </Tab.Content>
          </Tab.Container>
        </CardBody>
      </Card>

      {/* Boutons — barre fixe en bas */}
      <div
        className="d-flex align-items-center justify-content-end gap-2 bg-white border-top px-4 py-3"
        style={{ position: 'sticky', bottom: 0, zIndex: 100, boxShadow: '0 -2px 8px rgba(0,0,0,.06)' }}
      >
        {saveError && (
          <span className="text-danger small me-auto">
            <i className="tabler-alert-circle me-1" />{saveError}
          </span>
        )}
        {/* <Button variant="light">Annuler</Button> */}
        <Button variant="primary" onClick={handleSave} disabled={saving || !batimentId}>
          {saving
            ? <><span className="spinner-border spinner-border-sm me-1" />Enregistrement...</>
            : <><i className="tabler-device-floppy me-1" />Enregistrer le recensement</>
          }
        </Button>
      </div>
    </>
  )
}
