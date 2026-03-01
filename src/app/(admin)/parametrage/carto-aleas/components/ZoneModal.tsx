/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useEffect, useState } from 'react'
import { Button, Col, Form, Modal, Row } from 'react-bootstrap'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import * as yup from 'yup'
import { ZoneClimatiqueType } from '@/types/entretien-batiment'
import type { ZoneClimatiqueInput } from '@/types/entretien-batiment'
import { createZoneClimatique, updateZoneClimatique } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const schema = yup.object({
  nom: yup.string().required('Le nom est obligatoire'),
  ordre: yup.number().required().min(1),
})
type FormValues = yup.InferType<typeof schema>

type Props = {
  show: boolean
  onHide: () => void
  zone: ZoneClimatiqueType | null
  onSaved: (zone: ZoneClimatiqueType) => void
}

export default function ZoneModal({ show, onHide, zone, onSaved }: Props) {
  const isEdit = !!zone
  const [departements, setDepartements] = useState<string[]>([])
  const [nouveauDept, setNouveauDept] = useState('')
  const [loading, setLoading] = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { ordre: 1 },
  })

  useEffect(() => {
    if (!show) return
    if (zone) {
      reset({ nom: zone.nom, ordre: zone.ordre })
      setDepartements(zone.departements.map((d) => d.nom))
    } else {
      reset({ nom: '', ordre: 1 })
      setDepartements([])
    }
    setNouveauDept('')
  }, [show, zone, reset])

  const ajouterDept = () => {
    const val = nouveauDept.trim()
    if (val && !departements.includes(val)) setDepartements((p) => [...p, val])
    setNouveauDept('')
  }

  const onSubmit = async (values: FormValues) => {
    setLoading(true)
    try {
      const payload: ZoneClimatiqueInput = { nom: values.nom, ordre: values.ordre, departements }
      const saved = isEdit && zone
        ? await updateZoneClimatique(zone.id, payload)
        : await createZoneClimatique(payload)
      onSaved(saved)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal show={show} onHide={onHide} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEdit ? 'Modifier la zone' : 'Ajouter une zone climatique'}</Modal.Title>
      </Modal.Header>
      <form onSubmit={handleSubmit(onSubmit)}>
        <Modal.Body>
          <Row className="g-3">
            <Col xs={9}>
              <Form.Label className="fw-medium">Nom <span className="text-danger">*</span></Form.Label>
              <Form.Control type="text" placeholder="Ex: Zone Guinéenne (Sud)" {...register('nom')} isInvalid={!!errors.nom} />
              <Form.Control.Feedback type="invalid">{errors.nom?.message}</Form.Control.Feedback>
            </Col>
            <Col xs={3}>
              <Form.Label className="fw-medium">Ordre</Form.Label>
              <Form.Control type="number" min={1} {...register('ordre')} />
            </Col>
            <Col xs={12}>
              <Form.Label className="fw-medium">Départements</Form.Label>
              <div className="d-flex flex-wrap gap-2 mb-2 p-2 border rounded bg-light" style={{ minHeight: 40 }}>
                {departements.length === 0 && <span className="text-muted small fst-italic">Aucun département</span>}
                {departements.map((d) => (
                  <span key={d} className="badge bg-white border text-dark d-inline-flex align-items-center gap-1 px-2 py-1" style={{ fontSize: '0.82rem' }}>
                    {d}
                    <button type="button" className="btn-close" style={{ fontSize: '0.45rem' }}
                      onClick={() => setDepartements((p) => p.filter((x) => x !== d))} />
                  </span>
                ))}
              </div>
              <div className="input-group input-group-sm">
                <Form.Control type="text" placeholder="Ajouter un département…" value={nouveauDept}
                  onChange={(e) => setNouveauDept(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); ajouterDept() } }} />
                <Button variant="outline-secondary" type="button" onClick={ajouterDept}>
                  <IconifyIcon icon="tabler:plus" />
                </Button>
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
