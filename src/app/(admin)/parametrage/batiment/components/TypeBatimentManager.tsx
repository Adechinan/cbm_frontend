/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import {
  Badge, Button, Card, CardBody, CardHeader, Table,
} from 'react-bootstrap'
import { TypeBatimentType } from '@/types/entretien-batiment'
import { deleteTypeBatiment, updateTypeBatiment } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import TypeBatimentModal from './TypeBatimentModal'

type Props = {
  typesInit: TypeBatimentType[]
}

export default function TypeBatimentManager({ typesInit }: Props) {
  const [types,     setTypes]     = useState<TypeBatimentType[]>(typesInit)
  const [showModal, setShowModal] = useState(false)
  const [editType,  setEditType]  = useState<TypeBatimentType | null>(null)

  const handleSaved = (saved: TypeBatimentType) => {
    setTypes((prev) => {
      const exists = prev.find((t) => t.id === saved.id)
      return exists ? prev.map((t) => (t.id === saved.id ? saved : t)) : [...prev, saved]
    })
    setShowModal(false)
    setEditType(null)
  }

  const handleToggle = async (t: TypeBatimentType) => {
    const updated = await updateTypeBatiment(t.id, { actif: !t.actif })
    setTypes((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce type de bâtiment ?')) return
    await deleteTypeBatiment(id)
    setTypes((prev) => prev.filter((t) => t.id !== id))
  }

  const sorted = [...types].sort((a, b) => a.ordre - b.ordre)

  return (
    <>
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0">Types de bâtiment</h5>
          </div>
          {/* <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditType(null); setShowModal(true) }}
          >
            <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter
          </Button> */}
        </CardHeader>
        <CardBody className="p-0">
          <div style={{ overflowX: 'auto' }}>
            <Table hover className="align-middle mb-0 table-sm">
              <thead className="table-light">
                <tr>
                  <th className="ps-3" style={{ width: 40 }}>#</th>
                  <th>Nom</th>
                  <th className="text-center" style={{ width: 80 }}>Réf. (%)</th>
                  <th className="text-center" style={{ width: 90 }}>Constr. (%)</th>
                  <th className="text-center" style={{ width: 90 }}>Réhab. (%)</th>
                  <th className="text-center" style={{ width: 80 }}>Statut</th>
                  <th className="text-center pe-3" style={{ width: 100 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((t) => (
                  <tr key={t.id} className={!t.actif ? 'opacity-50' : ''}>
                    <td className="ps-3 text-muted">{t.ordre}</td>
                    <td className="fw-medium" style={{ fontSize: '0.85rem' }}>{t.nom}</td>
                    <td className="text-center">
                      <Badge bg="secondary" className="fw-normal">{t.ponderationAnneeRef} %</Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="secondary" className="fw-normal">{t.ponderationAnneeConstruction} %</Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg="secondary" className="fw-normal">{t.ponderationAnneeRehabilitation} %</Badge>
                    </td>
                    <td className="text-center">
                      <Badge bg={t.actif ? 'success' : 'secondary'}>
                        {t.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="text-center pe-3">
                      <div className="hstack gap-1 justify-content-center">
                        {/* <Button
                          variant={t.actif ? 'soft-warning' : 'soft-success'}
                          size="sm"
                          className="btn-icon rounded-circle"
                          onClick={() => handleToggle(t)}
                          title={t.actif ? 'Désactiver' : 'Activer'}
                        >
                          <IconifyIcon icon={t.actif ? 'tabler:eye-off' : 'tabler:eye'} />
                        </Button> */}
                        <Button
                          variant="soft-success"
                          size="sm"
                          className="btn-icon rounded-circle"
                          onClick={() => { setEditType(t); setShowModal(true) }}
                          title="Modifier"
                        >
                          <IconifyIcon icon="tabler:edit" />
                        </Button>
                        {/* <Button
                          variant="soft-danger"
                          size="sm"
                          className="btn-icon rounded-circle"
                          onClick={() => handleDelete(t.id)}
                          title="Supprimer"
                        >
                          <IconifyIcon icon="tabler:trash" />
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))}

                {types.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4 fst-italic">
                      Aucun type de bâtiment configuré.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
          <div className="px-3 py-2 border-top text-muted" style={{ fontSize: '0.75rem' }}>
            <span className="fw-medium">Légende des pondérations applicable au coefficient d&apos;usure </span>{' '}<br/>
            <span className="me-2">Réf. = Année de référence</span>·{' '}
            <span className="mx-2">Constr. = Année de construction</span>·{' '}
            <span className="ms-2">Réhab. = Année de réhabilitation</span>
          </div>
        </CardBody>
      </Card>

      <TypeBatimentModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditType(null) }}
        type={editType}
        onSaved={handleSaved}
      />
    </>
  )
}
