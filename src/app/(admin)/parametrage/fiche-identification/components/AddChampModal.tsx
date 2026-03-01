/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ChampFicheType, SectionFicheType, TypeChamp } from '@/types/entretien-batiment'
import { createChampFiche, createSectionFiche, updateChampFiche } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const TYPES_CHAMP: TypeChamp[] = ['Texte', 'Nombre', 'Select', 'Radio', 'Date', 'Checkbox', 'GPS']
const TYPES_AVEC_OPTIONS: TypeChamp[] = ['Select', 'Radio']

const schema = yup.object({
  libelle: yup.string().required('Le libellé est obligatoire'),
  type: yup.string().oneOf(TYPES_CHAMP).required('Le type est obligatoire'),
  sectionId: yup.string().required('La section est obligatoire'),
  sectionNouvelle: yup.string(),
  ordre: yup.number().required("L'ordre est obligatoire").min(1),
  obligatoire: yup.boolean().default(false),
})

type FormValues = yup.InferType<typeof schema>

type Props = {
  show: boolean
  onHide: () => void
  champ: ChampFicheType | null
  sectionsExistantes: SectionFicheType[]
  onSaved: (champ: ChampFicheType) => void
}

export default function AddChampModal({ show, onHide, champ, sectionsExistantes, onSaved }: Props) {
  const isEdit = !!champ
  const [sectionMode, setSectionMode] = useState<'existing' | 'new'>('existing')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<string[]>([])
  const [nouvelleOption, setNouvelleOption] = useState('')

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { ordre: 1, obligatoire: false, type: 'Texte' },
  })

  const typeSelectionne = watch('type') as TypeChamp
  const aDesOptions = TYPES_AVEC_OPTIONS.includes(typeSelectionne)

  useEffect(() => {
    if (!show) return
    if (champ) {
      const sectionExists = sectionsExistantes.some((s) => s.id === champ.sectionId)
      reset({
        libelle:        champ.libelle,
        type:           champ.type,
        sectionId:      sectionExists ? champ.sectionId : (sectionsExistantes[0]?.id ?? ''),
        sectionNouvelle: sectionExists ? '' : (champ.section?.libelle ?? ''),
        ordre:          champ.ordre,
        obligatoire:    champ.obligatoire,
      })
      setOptions(champ.options ?? [])
      setSectionMode(sectionExists ? 'existing' : 'new')
    } else {
      reset({
        libelle:        '',
        type:           'Texte',
        sectionId:      sectionsExistantes[0]?.id ?? '',
        sectionNouvelle: '',
        ordre:          1,
        obligatoire:    false,
      })
      setOptions([])
      setSectionMode('existing')
    }
    setNouvelleOption('')
  }, [show, champ, sectionsExistantes, reset])

  const ajouterOption = () => {
    const val = nouvelleOption.trim()
    if (val && !options.includes(val)) {
      setOptions((prev) => [...prev, val])
    }
    setNouvelleOption('')
  }

  const supprimerOption = (opt: string) => {
    setOptions((prev) => prev.filter((o) => o !== opt))
  }

  const toFieldKey = (libelle: string) =>
    libelle
      .toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '_')
      .replace(/^_+|_+$/g, '')

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      let sectionId: string

      if (sectionMode === 'new') {
        const sectionLibelle = (values.sectionNouvelle ?? '').trim()
        // Chercher si une section avec ce libellé existe déjà
        const existing = sectionsExistantes.find(
          (s) => s.libelle.toLowerCase() === sectionLibelle.toLowerCase()
        )
        if (existing) {
          sectionId = existing.id
        } else {
          const newSec = await createSectionFiche({
            libelle:     sectionLibelle,
            obligatoire: false,
            actif:       true,
            ordre:       sectionsExistantes.length + 1,
          })
          sectionId = newSec.id
        }
      } else {
        sectionId = values.sectionId
      }

      const type = values.type as TypeChamp

      const payload: Omit<ChampFicheType, 'id'> = {
        sectionId,
        libelle:     values.libelle,
        type,
        ordre:       values.ordre,
        obligatoire: values.obligatoire ?? false,
        actif:       isEdit ? (champ?.actif ?? true) : true,
        fieldKey:    isEdit && champ ? champ.fieldKey : toFieldKey(values.libelle),
        ...(TYPES_AVEC_OPTIONS.includes(type) ? { options } : {}),
      }

      const saved = isEdit && champ
        ? await updateChampFiche(champ.id, payload)
        : await createChampFiche(payload)

      onSaved(saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Modifier le champ' : 'Ajouter un champ'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            {/* Section */}
            <Col xs={12}>
              <Form.Label className="fw-medium">Section</Form.Label>
              <div className="d-flex gap-3 mb-2">
                <Form.Check
                  type="radio"
                  id="section-existing"
                  label="Section existante"
                  checked={sectionMode === 'existing'}
                  onChange={() => setSectionMode('existing')}
                />
                <Form.Check
                  type="radio"
                  id="section-new"
                  label="Nouvelle section"
                  checked={sectionMode === 'new'}
                  onChange={() => setSectionMode('new')}
                />
              </div>
              {sectionMode === 'existing' ? (
                <Form.Select {...register('sectionId')} isInvalid={!!errors.sectionId}>
                  {sectionsExistantes.map((s) => (
                    <option key={s.id} value={s.id}>{s.libelle}</option>
                  ))}
                </Form.Select>
              ) : (
                <Form.Control
                  type="text"
                  placeholder="Nom de la nouvelle section"
                  {...register('sectionNouvelle')}
                />
              )}
            </Col>

            {/* Libellé */}
            <Col xs={12}>
              <Form.Label className="fw-medium">
                Libellé <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex: Statut de la construction"
                {...register('libelle')}
                isInvalid={!!errors.libelle}
              />
              <Form.Control.Feedback type="invalid">
                {errors.libelle?.message}
              </Form.Control.Feedback>
            </Col>

            {/* Type + Ordre + Obligatoire */}
            <Col md={6}>
              <Form.Label className="fw-medium">
                Type de champ <span className="text-danger">*</span>
              </Form.Label>
              <Form.Select {...register('type')} isInvalid={!!errors.type}>
                {TYPES_CHAMP.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </Form.Select>
            </Col>

            <Col md={3}>
              <Form.Label className="fw-medium">
                Ordre <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min={1}
                {...register('ordre')}
                isInvalid={!!errors.ordre}
              />
              <Form.Control.Feedback type="invalid">{errors.ordre?.message}</Form.Control.Feedback>
            </Col>

            <Col md={3} className="d-flex align-items-end pb-1">
              <Form.Check
                type="switch"
                id="obligatoire-switch"
                label="Champ obligatoire"
                {...register('obligatoire')}
              />
            </Col>

            {/* Options — visible uniquement pour Select / Radio */}
            {aDesOptions && (
              <Col xs={12}>
                <Form.Label className="fw-medium">
                  Valeurs possibles
                  <span className="text-muted fw-normal ms-1 small">
                    ({typeSelectionne === 'Radio' ? 'boutons radio' : 'liste déroulante'})
                  </span>
                </Form.Label>

                <div className="d-flex flex-wrap gap-2 mb-2 p-2 border rounded bg-light" style={{ minHeight: 40 }}>
                  {options.length === 0 && (
                    <span className="text-muted small fst-italic">Aucune valeur — ajoutez-en ci-dessous</span>
                  )}
                  {options.map((opt) => (
                    <span
                      key={opt}
                      className="badge bg-white border text-dark d-inline-flex align-items-center gap-1 px-2 py-1"
                      style={{ fontSize: '0.85rem' }}
                    >
                      {opt}
                      <button
                        type="button"
                        className="btn-close"
                        style={{ fontSize: '0.45rem' }}
                        onClick={() => supprimerOption(opt)}
                        aria-label={`Supprimer ${opt}`}
                      />
                    </span>
                  ))}
                </div>

                <div className="input-group input-group-sm">
                  <Form.Control
                    type="text"
                    placeholder="Saisir une valeur puis Entrée ou cliquer Ajouter…"
                    value={nouvelleOption}
                    onChange={(e) => setNouvelleOption(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        ajouterOption()
                      }
                    }}
                  />
                  <Button variant="outline-secondary" type="button" onClick={ajouterOption}>
                    <IconifyIcon icon="tabler:plus" />
                  </Button>
                </div>
                <Form.Text className="text-muted">
                  Appuyez sur <kbd>Entrée</kbd> ou cliquez <strong>+</strong> pour valider chaque valeur.
                </Form.Text>
              </Col>
            )}
          </Row>
        </Modal.Body>

        <Modal.Footer>
          <Button variant="light" onClick={onHide} type="button">Annuler</Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Enregistrement...' : isEdit ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
