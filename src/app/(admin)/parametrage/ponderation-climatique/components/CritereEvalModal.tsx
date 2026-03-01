/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { CritereEvalPonderationType } from '@/types/entretien-batiment'
import { createCritereEvalPonderation, updateCritereEvalPonderation } from '@/services/batimentService'

const schema = yup.object({
  nom:        yup.string().required('Le nom est obligatoire'),
  definition: yup.string().required('La définition est obligatoire'),
  poids:      yup.number().required('Le poids est obligatoire').min(0).max(1),
  ordre:      yup.number().required("L'ordre est obligatoire").min(1),
})

type FormValues = yup.InferType<typeof schema>

type Props = {
  show:    boolean
  onHide:  () => void
  critere: CritereEvalPonderationType | null
  onSaved: (saved: CritereEvalPonderationType) => void
}

export default function CritereEvalModal({ show, onHide, critere, onSaved }: Props) {
  const isEdit = !!critere
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { poids: 0, ordre: 1 },
  })

  useEffect(() => {
    if (!show) return
    reset(critere
      ? { nom: critere.nom, definition: critere.definition, poids: critere.poids, ordre: critere.ordre }
      : { nom: '', definition: '', poids: 0, ordre: 1 }
    )
  }, [show, critere, reset])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const saved = isEdit && critere
        ? await updateCritereEvalPonderation(critere.id, values)
        : await createCritereEvalPonderation(values as Omit<CritereEvalPonderationType, 'id'>)
      onSaved(saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Modifier le critère' : 'Ajouter un critère'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="fw-medium">Nom du critère <span className="text-danger">*</span></Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex : Exposition"
                {...register('nom')}
                isInvalid={!!errors.nom}
              />
              <Form.Control.Feedback type="invalid">{errors.nom?.message}</Form.Control.Feedback>
            </Col>

            <Col xs={12}>
              <Form.Label className="fw-medium">Définition <span className="text-danger">*</span></Form.Label>
              <Form.Control
                as="textarea"
                rows={3}
                placeholder="Description du critère…"
                {...register('definition')}
                isInvalid={!!errors.definition}
              />
              <Form.Control.Feedback type="invalid">{errors.definition?.message}</Form.Control.Feedback>
            </Col>

            <Col md={6}>
              <Form.Label className="fw-medium">
                Poids <span className="text-danger">*</span>
                <span className="text-muted fw-normal ms-1 small">(entre 0 et 1, ex : 0.45)</span>
              </Form.Label>
              <Form.Control
                type="number"
                step="0.01"
                min={0}
                max={1}
                {...register('poids')}
                isInvalid={!!errors.poids}
              />
              <Form.Control.Feedback type="invalid">{errors.poids?.message}</Form.Control.Feedback>
            </Col>

            <Col md={6}>
              <Form.Label className="fw-medium">Ordre <span className="text-danger">*</span></Form.Label>
              <Form.Control type="number" min={1} {...register('ordre')} isInvalid={!!errors.ordre} />
              <Form.Control.Feedback type="invalid">{errors.ordre?.message}</Form.Control.Feedback>
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
