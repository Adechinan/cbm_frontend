/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Table } from 'react-bootstrap'
import { CritereEtatBatimentType } from '@/types/entretien-batiment'
import { deleteCritereEtatBatiment } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import CritereEtatBatimentModal from './CritereEtatBatimentModal'

type Props = {
  criteresInit: CritereEtatBatimentType[]
}

export default function CritereEtatBatimentManager({ criteresInit }: Props) {
  const [criteres,  setCriteres]  = useState<CritereEtatBatimentType[]>(criteresInit)
  const [showModal, setShowModal] = useState(false)
  const [editItem,  setEditItem]  = useState<CritereEtatBatimentType | null>(null)

  const handleSaved = (saved: CritereEtatBatimentType) => {
    setCriteres((prev) => {
      const exists = prev.find((c) => c.id === saved.id)
      return exists ? prev.map((c) => (c.id === saved.id ? saved : c)) : [...prev, saved]
    })
    setShowModal(false)
    setEditItem(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce critère ?')) return
    await deleteCritereEtatBatiment(id)
    setCriteres((prev) => prev.filter((c) => c.id !== id))
  }

  const sorted = [...criteres].sort((a, b) => a.ordre - b.ordre)
  const total  = criteres.reduce((sum, c) => sum + c.ponderation, 0)

  return (
    <>
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <h5 className="card-title mb-0">Pondération des critères d'états de bâtiment</h5>
          {/* <Button
            variant="primary"
            size="sm"
            onClick={() => { setEditItem(null); setShowModal(true) }}
          >
            <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter
          </Button> */}
        </CardHeader>
        <CardBody className="p-0">
          <Table hover className="align-middle mb-0 table-sm">
            <thead className="table-light">
              <tr>
                <th className="ps-3" style={{ width: 40 }}>#</th>
                <th>Critère</th>
                <th className="text-center" style={{ width: 120 }}>Pondération (%)</th>
                <th className="text-center pe-3" style={{ width: 90 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map((c) => (
                <tr key={c.id}>
                  <td className="ps-3 text-muted">{c.ordre}</td>
                  <td className="fw-medium" style={{ fontSize: '0.85rem' }}>{c.nom}</td>
                  <td className="text-center">
                    <Badge bg="secondary" className="fw-normal">{c.ponderation} %</Badge>
                  </td>
                  <td className="text-center pe-3">
                    <div className="hstack gap-1 justify-content-center">
                      <Button
                        variant="soft-success"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => { setEditItem(c); setShowModal(true) }}
                        title="Modifier"
                      >
                        <IconifyIcon icon="tabler:edit" />
                      </Button>
                      {/* <Button
                        variant="soft-danger"
                        size="sm"
                        className="btn-icon rounded-circle"
                        onClick={() => handleDelete(c.id)}
                        title="Supprimer"
                      >
                        <IconifyIcon icon="tabler:trash" />
                      </Button> */}
                    </div>
                  </td>
                </tr>
              ))}

              {criteres.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center text-muted py-4 fst-italic">
                    Aucun critère configuré.
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot className="table-light">
              <tr>
                <td colSpan={2} className="ps-3 fw-semibold" style={{ fontSize: '0.82rem' }}>
                  Total
                </td>
                <td className="text-center">
                  <Badge bg={total === 100 ? 'success' : 'danger'} className="fw-semibold">
                    {total} %
                  </Badge>
                </td>
                <td />
              </tr>
              {/* <tr className="border-top">
                <td colSpan={3} className="ps-3 text-muted" style={{ fontSize: '0.82rem' }}>
                  Indice de Condition du Bâtiment (ICB)
                </td>
                <td />
              </tr>
              <tr>
                <td colSpan={3} className="ps-3 text-muted" style={{ fontSize: '0.82rem' }}>
                  Coéf d&apos;Usure
                </td>
                <td />
              </tr> */}
            </tfoot>
          </Table>
        </CardBody>
      </Card>

      <CritereEtatBatimentModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditItem(null) }}
        critere={editItem}
        onSaved={handleSaved}
      />
    </>
  )
}
