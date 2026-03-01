/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { TypeBatimentType } from '@/types/entretien-batiment'
import { createTypeBatiment, updateTypeBatiment } from '@/services/batimentService'

const schema = yup.object({
  nom:                            yup.string().required('Le nom est obligatoire'),
  ordre:                          yup.number().required("L'ordre est obligatoire").min(1),
  actif:                          yup.boolean().default(true),
  ponderationAnneeRef:            yup.number().required('Obligatoire').min(0).max(100),
  ponderationAnneeConstruction:   yup.number().required('Obligatoire').min(0).max(100),
  ponderationAnneeRehabilitation: yup.number().required('Obligatoire').min(0).max(100),
})

type FormValues = yup.InferType<typeof schema>

type Props = {
  show:    boolean
  onHide:  () => void
  type:    TypeBatimentType | null
  onSaved: (saved: TypeBatimentType) => void
}

export default function TypeBatimentModal({ show, onHide, type, onSaved }: Props) {
  const isEdit = !!type
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: {
      ordre: 1, actif: true,
      ponderationAnneeRef: 0, ponderationAnneeConstruction: 70, ponderationAnneeRehabilitation: 30,
    },
  })

  useEffect(() => {
    if (!show) return
    reset(type
      ? {
          nom:                            type.nom,
          ordre:                          type.ordre,
          actif:                          type.actif,
          ponderationAnneeRef:            type.ponderationAnneeRef,
          ponderationAnneeConstruction:   type.ponderationAnneeConstruction,
          ponderationAnneeRehabilitation: type.ponderationAnneeRehabilitation,
        }
      : {
          nom: '', ordre: 1, actif: true,
          ponderationAnneeRef: 0, ponderationAnneeConstruction: 70, ponderationAnneeRehabilitation: 30,
        }
    )
  }, [show, type, reset])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        nom:                            values.nom,
        ordre:                          values.ordre,
        actif:                          values.actif ?? true,
        ponderationAnneeRef:            values.ponderationAnneeRef,
        ponderationAnneeConstruction:   values.ponderationAnneeConstruction,
        ponderationAnneeRehabilitation: values.ponderationAnneeRehabilitation,
      }
      const saved = isEdit && type
        ? await updateTypeBatiment(type.id, payload)
        : await createTypeBatiment(payload)
      onSaved(saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? 'Modifier le type de bâtiment' : 'Ajouter un type de bâtiment'}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body className="d-flex flex-column gap-3">
          <div>
            <Form.Label className="fw-medium">
              Nom <span className="text-danger">*</span>
            </Form.Label>
            <Form.Control
              type="text"
              placeholder="Ex : Bâtiment Administratif"
              {...register('nom')}
              isInvalid={!!errors.nom}
            />
            <Form.Control.Feedback type="invalid">{errors.nom?.message}</Form.Control.Feedback>
          </div>

          <div>
            <Form.Label className="fw-medium mb-2">
              Pondérations applicable au coefficient d&apos;usure (%)<span className="text-danger">*</span>
            </Form.Label>
            <Row className="g-2">
              <Col md={4}>
                <Form.Label className="text-muted small mb-1">Pond. année de référence (%)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  {...register('ponderationAnneeRef')}
                  isInvalid={!!errors.ponderationAnneeRef}
                />
                <Form.Control.Feedback type="invalid">{errors.ponderationAnneeRef?.message}</Form.Control.Feedback>
              </Col>
              <Col md={4}>
                <Form.Label className="text-muted small mb-1">Pond. année de construction (%)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  {...register('ponderationAnneeConstruction')}
                  isInvalid={!!errors.ponderationAnneeConstruction}
                />
                <Form.Control.Feedback type="invalid">{errors.ponderationAnneeConstruction?.message}</Form.Control.Feedback>
              </Col>
              <Col md={4}>
                <Form.Label className="text-muted small mb-1">Pond. année de réhabilitation (%)</Form.Label>
                <Form.Control
                  type="number"
                  min={0}
                  max={100}
                  step={1}
                  {...register('ponderationAnneeRehabilitation')}
                  isInvalid={!!errors.ponderationAnneeRehabilitation}
                />
                <Form.Control.Feedback type="invalid">{errors.ponderationAnneeRehabilitation?.message}</Form.Control.Feedback>
              </Col>
            </Row>
          </div>

          <Row className="g-2 align-items-center">
            <Col xs="auto" style={{ maxWidth: 140 }}>
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
            <Col className="pt-3">
              <Form.Check
                type="switch"
                id="actif-switch"
                label="Type actif"
                {...register('actif')}
              />
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
