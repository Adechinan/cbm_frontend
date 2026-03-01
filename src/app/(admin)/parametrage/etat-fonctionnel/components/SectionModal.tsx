/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { CritereEvaluationType, TypeCritere } from '@/types/entretien-batiment'
import { createCritere, updateCritere, createCriteresTechnique, updateCritereTechnique } from '@/services/batimentService'

const schema = yup.object({
  section:     yup.string().required('Le nom de la section est obligatoire'),
  ponderation: yup.number().required('La pondération est obligatoire').min(0).max(100),
})

type FormValues = yup.InferType<typeof schema>

type Props = {
  show:        boolean
  onHide:      () => void
  section:     CritereEvaluationType | null
  typeCritere: TypeCritere
  onSaved:     (saved: CritereEvaluationType) => void
}

export default function SectionModal({ show, onHide, section, typeCritere, onSaved }: Props) {
  const isEdit = !!section
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { ponderation: 25 },
  })

  useEffect(() => {
    if (!show) return
    reset(section
      ? { section: section.section, ponderation: section.ponderation }
      : { section: '', ponderation: 25 }
    )
  }, [show, section, reset])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const payload = {
        type: typeCritere,
        section:     values.section,
        ponderation: values.ponderation,
        elements:    section?.elements ?? [],
      }
      let saved: CritereEvaluationType
      if (isEdit && section) {
        saved = typeCritere === 'fonctionnel'
          ? await updateCritere(section.id, payload)
          : await updateCritereTechnique(section.id, payload)
      } else {
        saved = typeCritere === 'fonctionnel'
          ? await createCritere(payload)
          : await createCriteresTechnique(payload)
      }
      onSaved(saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Modifier la section' : 'Ajouter une section'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="fw-medium">
                Nom de la section <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex : Hygiène"
                {...register('section')}
                isInvalid={!!errors.section}
              />
              <Form.Control.Feedback type="invalid">{errors.section?.message}</Form.Control.Feedback>
            </Col>
            <Col xs={6}>
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
