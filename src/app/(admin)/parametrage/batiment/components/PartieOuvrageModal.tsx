/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { PartieOuvrageType } from '@/types/entretien-batiment'
import { createPartieOuvrage, updatePartieOuvrage } from '@/services/batimentService'

const schema = yup.object({
  nom:             yup.string().required('Le nom est obligatoire'),
  superficie:      yup.number().required('La superficie est obligatoire').min(0),
  prixUnitaireRef: yup.string().required('La fourchette de prix est obligatoire'),
  prixUnitaire:    yup.number().required('Le prix unitaire est obligatoire').min(0),
  ordre:           yup.number().required("L'ordre est obligatoire").min(1),
})

type FormValues = yup.InferType<typeof schema>

type Props = {
  show:    boolean
  onHide:  () => void
  partie:  PartieOuvrageType | null
  onSaved: (saved: PartieOuvrageType) => void
}

export default function PartieOuvrageModal({ show, onHide, partie, onSaved }: Props) {
  const isEdit = !!partie
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { superficie: 1000, prixUnitaireRef: '', prixUnitaire: 0, ordre: 1 },
  })

  useEffect(() => {
    if (!show) return
    reset(partie
      ? {
          nom:             partie.nom,
          superficie:      partie.superficie,
          prixUnitaireRef: partie.prixUnitaireRef,
          prixUnitaire:    partie.prixUnitaire,
          ordre:           partie.ordre,
        }
      : { nom: '', superficie: 1000, prixUnitaireRef: '', prixUnitaire: 0, ordre: 1 }
    )
  }, [show, partie, reset])

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const saved = isEdit && partie
        ? await updatePartieOuvrage(partie.id, values)
        : await createPartieOuvrage(values as Omit<PartieOuvrageType, 'id'>)
      onSaved(saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} size="lg" centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isEdit ? 'Modifier la partie d\'ouvrage' : 'Ajouter une partie d\'ouvrage'}
        </Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={12}>
              <Form.Label className="fw-medium">
                Nom / Libellé <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex : Gros œuvre (structure, maçonnerie)"
                {...register('nom')}
                isInvalid={!!errors.nom}
              />
              <Form.Control.Feedback type="invalid">{errors.nom?.message}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label className="fw-medium">
                Superficie (m²) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={1}
                {...register('superficie')}
                isInvalid={!!errors.superficie}
              />
              <Form.Control.Feedback type="invalid">{errors.superficie?.message}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label className="fw-medium">
                Prix de référence (FCFA/m²) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="text"
                placeholder="Ex : 150-400"
                {...register('prixUnitaireRef')}
                isInvalid={!!errors.prixUnitaireRef}
              />
              <Form.Text className="text-muted">Fourchette min-max</Form.Text>
              <Form.Control.Feedback type="invalid">{errors.prixUnitaireRef?.message}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
              <Form.Label className="fw-medium">
                Prix unitaire (FCFA/m²) <span className="text-danger">*</span>
              </Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={1}
                {...register('prixUnitaire')}
                isInvalid={!!errors.prixUnitaire}
              />
              <Form.Control.Feedback type="invalid">{errors.prixUnitaire?.message}</Form.Control.Feedback>
            </Col>

            <Col md={4}>
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
