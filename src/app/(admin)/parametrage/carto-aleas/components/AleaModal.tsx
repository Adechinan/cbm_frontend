/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { AleaClimatiqueType } from '@/types/entretien-batiment'
import { createAleaClimatique, updateAleaClimatique } from '@/services/batimentService'

const schema = yup.object({
  nom: yup.string().required('Le nom est obligatoire'),
  ordre: yup.number().required().min(1),
  actif: yup.boolean().default(true),
})
type FormValues = yup.InferType<typeof schema>

type Props = {
  show: boolean
  onHide: () => void
  alea: AleaClimatiqueType | null
  onSaved: (alea: AleaClimatiqueType) => void
}

export default function AleaModal({ show, onHide, alea, onSaved }: Props) {
  const isEdit = !!alea
  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { ordre: 1, actif: true },
  })

  useEffect(() => {
    if (!show) return
    if (alea) reset({ nom: alea.nom, ordre: alea.ordre, actif: alea.actif })
    else reset({ nom: '', ordre: 1, actif: true })
  }, [show, alea, reset])

  const onSubmit = async (values: FormValues) => {
    const payload = { nom: values.nom, ordre: values.ordre, actif: values.actif ?? true }
    const saved = isEdit && alea
      ? await updateAleaClimatique(alea.id, payload)
      : await createAleaClimatique(payload)
    onSaved(saved)
  }

  return (
    <Modal show={show} onHide={onHide} centered size="sm">
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Modifier l\'aléa' : 'Ajouter un aléa'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="fw-medium">Nom <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" placeholder="Ex: Inondations" {...register('nom')} isInvalid={!!errors.nom} />
              <Form.Control.Feedback type="invalid">{errors.nom?.message}</Form.Control.Feedback>
            </Col>
            <Col xs={6}>
              <Form.Label className="fw-medium">Ordre</Form.Label>
              <Form.Control type="number" min={1} {...register('ordre')} />
            </Col>
            <Col xs={6} className="d-flex align-items-end pb-1">
              <Form.Check type="switch" id="alea-actif" label="Actif" {...register('actif')} />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="light" onClick={onHide} type="button">Annuler</Button>
          <Button variant="primary" type="submit">
            {isEdit ? 'Modifier' : 'Ajouter'}
          </Button>
        </Modal.Footer>
      </form>
    </Modal>
  )
}
