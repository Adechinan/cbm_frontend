/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { EtatDisponible, ElementCritereEvaluation, TypeCritere } from '@/types/entretien-batiment'
import {
  addElementFonctionnel, updateElementFonctionnel,
  addElementTechnique,   updateElementTechnique,
} from '@/services/batimentService'

const ETATS_PAR_DEFAUT: EtatDisponible[] = [
  { etat: 'Bon',     note: 3 },
  { etat: 'Passable', note: 2 },
  { etat: 'Mauvais',  note: 1 },
]

const schema = yup.object({
  libelle:     yup.string().required('Le libellé est obligatoire'),
  ponderation: yup.number().required('La pondération est obligatoire').min(0).max(100),
  description: yup.string(),
  ordre:       yup.number().required("L'ordre est obligatoire").min(1),
  actif:       yup.boolean().default(true),
})

type FormValues = yup.InferType<typeof schema>

type Props = {
  show:        boolean
  onHide:      () => void
  sectionId:   string
  typeCritere: TypeCritere
  element:     ElementCritereEvaluation | null
  onSaved:     (updatedSection: import('@/types/entretien-batiment').CritereEvaluationType) => void
}

export default function ElementModal({ show, onHide, sectionId, typeCritere, element, onSaved }: Props) {
  const isEdit = !!element
  const [loading, setLoading] = useState(false)
  const [etats, setEtats]         = useState<EtatDisponible[]>(ETATS_PAR_DEFAUT)
  const [nouvelEtat, setNouvelEtat] = useState('')
  const [nouvelNote, setNouvelNote] = useState('1')

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { ponderation: 25, ordre: 1, actif: true },
  })

  useEffect(() => {
    if (!show) return
    if (element) {
      reset({ libelle: element.libelle, ponderation: element.ponderation, description: element.description ?? '', ordre: element.ordre, actif: element.actif })
      setEtats(element.etatsDisponibles)
    } else {
      reset({ libelle: '', ponderation: 25, description: '', ordre: 1, actif: true })
      setEtats(ETATS_PAR_DEFAUT)
    }
  }, [show, element, reset])

  const addEtat = () => {
    const v = nouvelEtat.trim()
    if (v && !etats.some((e) => e.etat === v)) {
      setEtats((prev) => [...prev, { etat: v, note: Number(nouvelNote) || 1 }])
    }
    setNouvelEtat('')
    setNouvelNote('1')
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        libelle:          values.libelle,
        ponderation:      values.ponderation,
        description:      values.description,
        ordre:            values.ordre,
        actif:            values.actif ?? true,
        etatsDisponibles: etats,
      }
      let updated
      if (isEdit && element) {
        updated = typeCritere === 'fonctionnel'
          ? await updateElementFonctionnel(sectionId, element.id, payload)
          : await updateElementTechnique(sectionId, element.id, payload)
      } else {
        updated = typeCritere === 'fonctionnel'
          ? await addElementFonctionnel(sectionId, payload)
          : await addElementTechnique(sectionId, payload)
      }
      onSaved(updated)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? "Modifier l'élément" : 'Ajouter un élément'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="fw-medium">
                Libellé <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex : Perception générale de la vétusté des matériaux"
                {...register('libelle')}
                isInvalid={!!errors.libelle}
              />
              <Form.Control.Feedback type="invalid">{errors.libelle?.message}</Form.Control.Feedback>
            </Col>

            <Col xs={12}>
              <Form.Label className="fw-medium">Description (facultative)</Form.Label>
              <Form.Control as="textarea" rows={2} placeholder="Précisions..." {...register('description')} />
            </Col>

            <Col md={4}>
              <Form.Label className="fw-medium">
                Pondération (%) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="number" min={0} max={100} step={1} {...register('ponderation')} isInvalid={!!errors.ponderation} />
              <Form.Control.Feedback type="invalid">{errors.ponderation?.message}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label className="fw-medium">
                Ordre <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control type="number" min={1} {...register('ordre')} isInvalid={!!errors.ordre} />
              <Form.Control.Feedback type="invalid">{errors.ordre?.message}</Form.Control.Feedback>
            </Col>

            <Col md={4} className="d-flex align-items-end pb-1">
              <Form.Check type="switch" id="el-actif-switch" label="Actif" {...register('actif')} />
            </Col>

            <Col xs={12}>
              <Form.Label className="fw-medium">États disponibles</Form.Label>
              <div className="d-flex flex-wrap gap-2 mb-2">
                {etats.map(({ etat, note }) => (
                  <span key={etat} className="badge bg-light text-dark border d-flex align-items-center gap-1">
                    {etat} <span className="text-muted">({note})</span>
                    <button type="button" className="btn-close btn-close-sm" style={{ fontSize: '0.5rem' }}
                      onClick={() => setEtats((p) => p.filter((e) => e.etat !== etat))} />
                  </span>
                ))}
              </div>
              <div className="d-flex gap-2">
                <Form.Control type="text" size="sm" placeholder="Libellé de l'état…"
                  value={nouvelEtat} onChange={(e) => setNouvelEtat(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addEtat() } }}
                />
                <Form.Control type="number" size="sm" min={0} placeholder="Note"
                  style={{ maxWidth: 70 }} value={nouvelNote}
                  onChange={(e) => setNouvelNote(e.target.value)}
                />
                <Button variant="outline-secondary" size="sm" type="button" onClick={addEtat}>Ajouter</Button>
              </div>
            </Col>
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
