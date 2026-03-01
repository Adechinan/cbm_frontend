/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { CritereEtatBatimentType } from '@/types/entretien-batiment'
import { createCritereEtatBatiment, updateCritereEtatBatiment } from '@/services/batimentService'

const schema = yup.object({
  nom:         yup.string().required('Le nom est obligatoire'),
  ponderation: yup.number().required('La pondération est obligatoire').min(0).max(100),
  ordre:       yup.number().required("L'ordre est obligatoire").min(1),
})

type FormValues = yup.InferType<typeof schema>

type Props = {
  show:    boolean
  onHide:  () => void
  critere: CritereEtatBatimentType | null
  onSaved: (saved: CritereEtatBatimentType) => void
}

export default function CritereEtatBatimentModal({ show, onHide, critere, onSaved }: Props) {
  const isEdit = !!critere
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { ponderation: 0, ordre: 1 },
  })

  useEffect(() => {
    if (!show) return
    reset(critere
      ? { nom: critere.nom, ponderation: critere.ponderation, ordre: critere.ordre }
      : { nom: '', ponderation: 0, ordre: 1 }
    )
  }, [show, critere, reset])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const saved = isEdit && critere
        ? await updateCritereEtatBatiment(critere.id, values)
        : await createCritereEtatBatiment(values as Omit<CritereEtatBatimentType, 'id'>)
      onSaved(saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? 'Modifier le critère' : 'Ajouter un critère d\'état'}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="fw-medium">
                Critère <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex : Age du bâtiment"
                {...register('nom')}
                isInvalid={!!errors.nom}
              />
              <Form.Control.Feedback type="invalid">{errors.nom?.message}</Form.Control.Feedback>
            </Col>

            <Col md={6}>
              <Form.Label className="fw-medium">
                Pondération (%) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                max={100}
                step={1}
                {...register('ponderation')}
                isInvalid={!!errors.ponderation}
              />
              <Form.Control.Feedback type="invalid">{errors.ponderation?.message}</Form.Control.Feedback>
            </Col>

            <Col md={6}>
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
