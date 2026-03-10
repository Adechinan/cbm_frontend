/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Accordion, Alert, Badge, Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { BatimentType, ChampFicheType, SectionFicheType, ZoneClimatiqueType } from '@/types/entretien-batiment'
import { createBatiment, updateBatiment } from '@/services/batimentService'
import { BENIN_GEO } from '@/assets/data/benin-geo'

// ─── Correspondance options typeConstruction ───────────────────────────────

const TC_LABEL_TO_ENUM: Record<string, BatimentType['typeConstruction']> = {
  'Villa / RDC': 'villa_rdc',
  'Bâtiment à étage': 'batiment_etage',
  'Autre': 'autre',
}
const TC_ENUM_TO_LABEL: Record<string, string> = {
  villa_rdc: 'Villa / RDC',
  batiment_etage: 'Bâtiment à étage',
  autre: 'Autre',
}

// ─── Clés "connues" de BatimentType (tout le reste → extra) ───────────────

const KNOWN_KEYS = new Set([
  'code', 'codeBatiment', 'denomination', 'organisme', 'modeAcquisition',
  'anneeConstruction', 'anneesRestructuration', 'coutConstruction', 'statutConstruction',
  'departement', 'commune', 'arrondissement', 'adresse', 'latitude', 'longitude',
  'departementClimatique',
  'typeConstruction', 'niveauxSousSol', 'nombreEtages',
  'usages', 'typeMateriau', 'typeToiture', 'energies',
  'surfaceTotale', 'surfaceSallesHumides', 'nombrePieces',
  'acteNature', 'acteDateEffet', 'acteDuree', 'acteReference', 'acteCommentaire',
])

// ─── FormState dynamique ───────────────────────────────────────────────────

type DynForm = Record<string, string | string[]>

const getStr = (f: DynForm, k: string): string => (f[k] as string) ?? ''
const getArr = (f: DynForm, k: string): string[] => (f[k] as string[]) ?? []
const numOrUndef = (s: string) => s ? Number(s) : undefined

// Valeurs par défaut pour certains fieldKey
const FIELD_DEFAULTS: Record<string, string | string[]> = {
  statutConstruction: 'Actif',
  typeConstruction: 'Villa / RDC',
  niveauxSousSol: '0',
  nombreEtages: '1',
}

function buildEmptyForm(champs: ChampFicheType[]): DynForm {
  const form: DynForm = {}
  for (const c of champs) {
    if (!c.actif) continue
    if (c.type === 'Checkbox') {
      form[c.fieldKey] = form[c.fieldKey] ?? []
    } else if (!(c.fieldKey in form)) {
      form[c.fieldKey] = FIELD_DEFAULTS[c.fieldKey] ?? ''
    }
  }
  return form
}

function batimentToForm(b: BatimentType, champs: ChampFicheType[]): DynForm {
  const form = buildEmptyForm(champs)
  form['codeBatiment'] = b.codeBatiment ?? ''
  form['denomination'] = b.denomination
  form['organisme'] = b.organisme
  form['modeAcquisition'] = b.modeAcquisition
  form['anneeConstruction'] = String(b.anneeConstruction)
  form['anneesRestructuration'] = (b.anneesRestructuration ?? []).join(', ')
  form['coutConstruction'] = b.coutConstruction !== undefined ? String(b.coutConstruction) : ''
  form['statutConstruction'] = b.statutConstruction
  form['departement'] = b.departement
  form['commune'] = b.commune
  form['arrondissement'] = b.arrondissement ?? ''
  form['adresse'] = b.adresse
  form['latitude'] = b.latitude !== undefined ? String(b.latitude) : ''
  form['longitude'] = b.longitude !== undefined ? String(b.longitude) : ''
  form['departementClimatique'] = b.departementClimatique ?? ''
  form['typeConstruction'] = TC_ENUM_TO_LABEL[b.typeConstruction] ?? b.typeConstruction
  form['niveauxSousSol'] = String(b.niveauxSousSol)
  form['nombreEtages'] = String(b.nombreEtages)
  form['usages'] = Array.isArray(b.usages) ? [...b.usages] : []
  form['typeMateriau'] = Array.isArray(b.typeMateriau) ? [...b.typeMateriau] : []
  form['typeToiture'] = Array.isArray(b.typeToiture) ? [...b.typeToiture] : []
  form['energies'] = Array.isArray(b.energies) ? [...b.energies] : []
  form['surfaceTotale'] = String(b.surfaceTotale)
  form['surfaceSallesHumides'] = String(b.surfaceSallesHumides)
  form['nombrePieces'] = String(b.nombrePieces)
  form['acteNature'] = b.acteAffectation?.nature ?? ''
  form['acteDateEffet'] = b.acteAffectation?.dateEffet ?? ''
  form['acteDuree'] = b.acteAffectation?.duree ?? ''
  form['acteReference'] = b.acteAffectation?.reference ?? ''
  form['acteCommentaire'] = b.acteAffectation?.commentaire ?? ''
  // Champs extra
  if (b.extra) {
    for (const [k, v] of Object.entries(b.extra)) form[k] = v
  }
  return form
}

function formToBatiment(f: DynForm): Omit<BatimentType, 'id'> {
  const str = (k: string) => getStr(f, k).trim()
  const num = (k: string) => Number(f[k]) || 0
  const arr = (k: string) => getArr(f, k)

  const extra: Record<string, string | string[]> = {}
  for (const [k, v] of Object.entries(f)) {
    if (!KNOWN_KEYS.has(k) && (Array.isArray(v) ? v.length > 0 : v !== '')) {
      extra[k] = v
    }
  }

  const acteNature = str('acteNature')
  return {
    code: '',           // auto-généré par le backend (BAT-YYYY-XXXX)
    sections: [],       // géré par le backend
    codeBatiment: str('codeBatiment'),
    denomination: str('denomination'),
    organisme: str('organisme'),
    modeAcquisition: str('modeAcquisition'),
    anneeConstruction: num('anneeConstruction'),
    anneesRestructuration: str('anneesRestructuration')
      ? str('anneesRestructuration').split(',').map((s) => Number(s.trim())).filter(Boolean)
      : [],
    coutConstruction: str('coutConstruction') ? num('coutConstruction') : undefined,
    statutConstruction: str('statutConstruction'),
    departement: str('departement'),
    commune: str('commune'),
    arrondissement: str('arrondissement') || undefined,
    adresse: str('adresse'),
    latitude: numOrUndef(str('latitude')),
    longitude: numOrUndef(str('longitude')),
    departementClimatique: str('departementClimatique') || undefined,
    typeConstruction: TC_LABEL_TO_ENUM[str('typeConstruction')] ?? 'batiment_etage',
    niveauxSousSol: num('niveauxSousSol'),
    nombreEtages: num('nombreEtages'),
    usages: arr('usages'),
    typeMateriau: arr('typeMateriau'),
    typeToiture: arr('typeToiture'),
    energies: arr('energies'),
    surfaceTotale: num('surfaceTotale'),
    surfaceSallesHumides: num('surfaceSallesHumides'),
    nombrePieces: num('nombrePieces'),
    acteAffectation: acteNature ? {
      nature: acteNature,
      dateEffet: str('acteDateEffet'),
      duree: str('acteDuree'),
      reference: str('acteReference'),
      commentaire: str('acteCommentaire') || undefined,
    } : undefined,
    ...(Object.keys(extra).length > 0 ? { extra } : {}),
  }
}

// ─── Rendu d'un champ individuel ──────────────────────────────────────────

function FieldControl({
  champ, form, setField, min, isInvalid,
}: {
  champ: ChampFicheType
  form: DynForm
  setField: (key: string, val: string | string[]) => void
  min?: number
  isInvalid?: boolean
}) {
  const key = champ.fieldKey
  const val = getStr(form, key)

  switch (champ.type) {
    case 'Texte':
      return (
        <Form.Control
          type="text"
          value={val}
          onChange={(e) => setField(key, e.target.value)}
          required={champ.obligatoire}
          isInvalid={isInvalid}
        />
      )
    case 'Nombre':
      return (
        <Form.Control
          type="number"
          min={min}
          value={val}
          onChange={(e) => setField(key, e.target.value)}
          required={champ.obligatoire}
          isInvalid={isInvalid}
        />
      )
    case 'GPS':
      return (
        <Form.Control
          type="number"
          step="any"
          value={val}
          onChange={(e) => setField(key, e.target.value)}
          isInvalid={isInvalid}
        />
      )
    case 'Date':
      return (
        <Form.Control
          type="date"
          value={val}
          onChange={(e) => setField(key, e.target.value)}
          required={champ.obligatoire}
          isInvalid={isInvalid}
        />
      )
    case 'Select':
      return (
        <Form.Select
          value={val}
          onChange={(e) => setField(key, e.target.value)}
          required={champ.obligatoire}
          isInvalid={isInvalid}
        >
          {!champ.obligatoire && <option value="">— Sélectionner —</option>}
          {(champ.options ?? []).map((opt) => (
            <option key={opt} value={opt}>{opt}</option>
          ))}
        </Form.Select>
      )
    case 'Radio':
      return (
        <div className="d-flex gap-3 flex-wrap pt-1">
          {(champ.options ?? []).map((opt) => (
            <Form.Check
              key={opt}
              type="radio"
              id={`${key}-${opt}`}
              label={opt}
              checked={val === opt}
              onChange={() => setField(key, opt)}
            />
          ))}
        </div>
      )
    default:
      return null
  }
}

// ─── Composant ────────────────────────────────────────────────────────────

type Props = {
  show: boolean
  onHide: () => void
  batiment: BatimentType | null
  onSaved: (b: BatimentType) => void
  sections: SectionFicheType[]
  zonesClimatiques: ZoneClimatiqueType[]
}

export default function BatimentModal({ show, onHide, batiment, onSaved, sections, zonesClimatiques }: Props) {
  const isEdit = !!batiment
  const [form, setFormState] = useState<DynForm>({})
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState('')
  const [errors, setErrors]   = useState<Set<string>>(new Set())
  const [openKeys, setOpenKeys] = useState<string[]>([])

  // Sections actives triées par ordre croissant
  const sectionsActives = [...sections].filter((s) => s.actif).sort((a, b) => a.ordre - b.ordre)

  // Tous les champs actifs à plat (pour les helpers buildEmptyForm / batimentToForm)
  const champsActifs: ChampFicheType[] = sectionsActives.flatMap((s) => s.champs.filter((c) => c.actif))

  useEffect(() => {
    if (!show) return
    setFormState(batiment ? batimentToForm(batiment, champsActifs) : buildEmptyForm(champsActifs))
    setError('')
    setErrors(new Set())
    setOpenKeys(sectionsActives.slice(0, 4).map((_, i) => String(i)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [show, batiment])

  const setField = (key: string, val: string | string[]) => {
    setFormState((prev) => ({ ...prev, [key]: val }))
    if (errors.has(key)) {
      setErrors((prev) => { const s = new Set(prev); s.delete(key); return s })
    }
  }

  const toggleCheckbox = (key: string, libelle: string) => {
    const arr = getArr(form, key)
    setField(key, arr.includes(libelle) ? arr.filter((v) => v !== libelle) : [...arr, libelle])
  }

  const validate = (): Set<string> => {
    const newErrors = new Set<string>()
    for (const c of champsActifs) {
      if (!c.obligatoire || c.type === 'Checkbox') continue
      if (!getStr(form, c.fieldKey).trim()) newErrors.add(c.fieldKey)
    }
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (newErrors.size > 0) {
      setErrors(newErrors)
      // Ouvrir les accordéons contenant des erreurs
      const errorSectionKeys = sectionsActives
        .map((sec, idx) => ({ sec, key: String(idx) }))
        .filter(({ sec }) => sec.champs.some((c) => c.actif && newErrors.has(c.fieldKey)))
        .map(({ key }) => key)
      setOpenKeys((prev) => [...new Set([...prev, ...errorSectionKeys])])
      return
    }
    setLoading(true)
    setError('')
    try {
      const payload = formToBatiment(form)
      const saved = isEdit && batiment
        ? await updateBatiment(batiment.id, payload)
        : await createBatiment(payload)
      onSaved(saved)
    } catch {
      setError('Une erreur est survenue. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  // Champs en erreur pour l'alerte récapitulative
  const errorFields = champsActifs.filter((c) => errors.has(c.fieldKey))
  const sectionLibelleById = new Map(sectionsActives.map((s) => [s.id, s.libelle]))

  return (
    <Modal show={show} onHide={onHide} size="xl" centered scrollable>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Modifier le bâtiment' : 'Ajouter un bâtiment'}</Modal.Title>
      </Modal.Header>

      <Modal.Body>
        <form id="batiment-form" onSubmit={handleSubmit} noValidate>
          {error && <div className="alert alert-danger py-2 small mb-3">{error}</div>}

          {errorFields.length > 0 && (
            <Alert variant="danger" className="py-2 small mb-3">
              <strong>Champs obligatoires manquants :</strong>
              <ul className="mb-0 mt-1 ps-3">
                {errorFields.map((c) => (
                  <li key={c.fieldKey}>
                    {c.libelle}
                    <span className="ms-1 fst-italic opacity-75">— {sectionLibelleById.get(c.sectionId)}</span>
                  </li>
                ))}
              </ul>
            </Alert>
          )}

          <Accordion
            activeKey={openKeys}
            alwaysOpen
            onSelect={(k) => {
              if (Array.isArray(k)) setOpenKeys(k as string[])
            }}
          >
            {sectionsActives.map((section, idx) => {
              const champsSection  = section.champs.filter((c) => c.actif).sort((a, b) => a.ordre - b.ordre)
              const sectionHasError = champsSection.some((c) => errors.has(c.fieldKey))

              // Regrouper les Checkbox par fieldKey
              const checkboxGroups = new Map<string, ChampFicheType[]>()
              const autresChamps: ChampFicheType[] = []
              for (const c of champsSection) {
                if (c.type === 'Checkbox') {
                  checkboxGroups.set(c.fieldKey, [...(checkboxGroups.get(c.fieldKey) ?? []), c])
                } else {
                  autresChamps.push(c)
                }
              }

              return (
                <Accordion.Item
                  key={section.id}
                  eventKey={String(idx)}
                  className={sectionHasError ? 'border-danger' : ''}
                >
                  <Accordion.Header>
                    <span className="me-auto">{section.libelle}</span>
                    {sectionHasError && (
                      <Badge bg="danger" className="me-2 fw-normal" style={{ fontSize: '0.7rem' }}>
                        Champs manquants
                      </Badge>
                    )}
                  </Accordion.Header>
                  <Accordion.Body>
                    <Row className="g-3">

                      {/* Champs non-checkbox */}
                      {autresChamps.map((champ) => {
                        const invalid = errors.has(champ.fieldKey)

                        // ── Selects en cascade Département / Commune / Arrondissement ──
                        if (champ.fieldKey === 'departement') {
                          return (
                            <Col key={champ.id} md={4}>
                              <Form.Label className="fw-medium">
                                {champ.libelle}
                                {champ.obligatoire && <span className="text-danger ms-1">*</span>}
                              </Form.Label>
                              <Form.Select
                                value={getStr(form, 'departement')}
                                onChange={(e) => {
                                  setField('departement', e.target.value)
                                  setField('commune', '')
                                  setField('arrondissement', '')
                                }}
                                required={champ.obligatoire}
                                isInvalid={invalid}
                              >
                                <option value="">— Département —</option>
                                {BENIN_GEO.map((d) => (
                                  <option key={d.nom} value={d.nom}>{d.nom}</option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">Champ requis</Form.Control.Feedback>
                            </Col>
                          )
                        }

                        if (champ.fieldKey === 'commune') {
                          const deptData = BENIN_GEO.find((d) => d.nom === getStr(form, 'departement'))
                          const communes = deptData?.communes ?? []
                          const noDept = !getStr(form, 'departement')
                          return (
                            <Col key={champ.id} md={4}>
                              <Form.Label className="fw-medium">
                                {champ.libelle}
                                {champ.obligatoire && <span className="text-danger ms-1">*</span>}
                              </Form.Label>
                              <Form.Select
                                value={getStr(form, 'commune')}
                                onChange={(e) => {
                                  setField('commune', e.target.value)
                                  setField('arrondissement', '')
                                }}
                                required={champ.obligatoire}
                                isInvalid={invalid}
                                disabled={noDept}
                              >
                                <option value="">{noDept ? '— Sélectionner un département —' : '— Commune —'}</option>
                                {communes.map((c) => (
                                  <option key={c.nom} value={c.nom}>{c.nom}</option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">Champ requis</Form.Control.Feedback>
                            </Col>
                          )
                        }

                        if (champ.fieldKey === 'arrondissement') {
                          const deptData = BENIN_GEO.find((d) => d.nom === getStr(form, 'departement'))
                          const communeData = deptData?.communes.find((c) => c.nom === getStr(form, 'commune'))
                          const arrondissements = communeData?.arrondissements ?? []
                          const noCommune = !getStr(form, 'commune')
                          return (
                            <Col key={champ.id} md={4}>
                              <Form.Label className="fw-medium">
                                {champ.libelle}
                                {champ.obligatoire && <span className="text-danger ms-1">*</span>}
                              </Form.Label>
                              <Form.Select
                                value={getStr(form, 'arrondissement')}
                                onChange={(e) => setField('arrondissement', e.target.value)}
                                required={champ.obligatoire}
                                isInvalid={invalid}
                                disabled={noCommune}
                              >
                                <option value="">{noCommune ? '— Sélectionner une commune —' : '— Arrondissement —'}</option>
                                {arrondissements.map((a) => (
                                  <option key={a} value={a}>{a}</option>
                                ))}
                              </Form.Select>
                              <Form.Control.Feedback type="invalid">Champ requis</Form.Control.Feedback>
                            </Col>
                          )
                        }

                        if (champ.fieldKey === 'departementClimatique') {
                          return (
                            <Col key={champ.id} md={4}>
                              <Form.Label className="fw-medium">
                                {champ.libelle}
                                {champ.obligatoire && <span className="text-danger ms-1">*</span>}
                              </Form.Label>
                              <Form.Select
                                value={getStr(form, 'departementClimatique')}
                                onChange={(e) => setField('departementClimatique', e.target.value)}
                                isInvalid={invalid}
                              >
                                <option value="">— Zone climatique —</option>
                                {zonesClimatiques.map((zone) => (
                                  <optgroup key={zone.id} label={zone.nom}>
                                    {zone.departements.map((dep) => (
                                      <option key={dep.id} value={String(dep.id)}>{dep.nom}</option>
                                    ))}
                                  </optgroup>
                                ))}
                              </Form.Select>
                            </Col>
                          )
                        }

                        // ── Champs standards ──────────────────────────────────────────
                        const isFullWidth = champ.fieldKey === 'adresse' || champ.type === 'Radio'
                        return (
                          <Col key={champ.id} md={isFullWidth ? 12 : 4}>
                            <Form.Label className="fw-medium">
                              {champ.libelle}
                              {champ.obligatoire && <span className="text-danger ms-1">*</span>}
                            </Form.Label>
                            {champ.type === 'Textearea' ? (
                              <Form.Control
                                as="textarea"
                                rows={2}
                                value={form[champ.fieldKey] ?? ''}
                                onChange={(e) => setField(champ.fieldKey, e.target.value)}
                                isInvalid={invalid}
                              />
                            ) : champ.type === 'Nombre' ? (
                              <FieldControl champ={champ} min={0} form={form} setField={setField} isInvalid={invalid} />
                            ) : (
                              <FieldControl champ={champ} form={form} setField={setField} isInvalid={invalid} />
                            )}
                          </Col>
                        )
                      })}

                      {/* Groupes de Checkbox */}
                      {Array.from(checkboxGroups.entries()).map(([fieldKey, group]) => (
                        <Col xs={12} key={fieldKey}>
                          <div className="d-flex flex-wrap gap-3">
                            {group.map((c) => (
                              <Form.Check
                                key={c.id}
                                type="checkbox"
                                id={`${fieldKey}-${c.libelle}`}
                                label={c.libelle}
                                checked={getArr(form, fieldKey).includes(c.libelle)}
                                onChange={() => toggleCheckbox(fieldKey, c.libelle)}
                              />
                            ))}
                          </div>
                        </Col>
                      ))}

                    </Row>
                  </Accordion.Body>
                </Accordion.Item>
              )
            })}
          </Accordion>
        </form>
      </Modal.Body>

      <Modal.Footer>
        <Button variant="light" onClick={onHide} type="button">Annuler</Button>
        <Button variant="primary" type="submit" form="batiment-form" disabled={loading}>
          {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter'}
        </Button>
      </Modal.Footer>
    </Modal>
  )
}
