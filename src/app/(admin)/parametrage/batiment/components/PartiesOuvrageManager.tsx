/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Button, Card, CardBody, CardHeader, Table } from 'react-bootstrap'
import { PartieOuvrageType } from '@/types/entretien-batiment'
import { deletePartieOuvrage } from '@/services/batimentService'
import { fmt } from '@/utils/evaluationCalcul'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import PartieOuvrageModal from './PartieOuvrageModal'
import { usePrivileges } from '@/hooks/usePrivileges'

type Props = {
  partiesInit: PartieOuvrageType[]
}

export default function PartiesOuvrageManager({ partiesInit }: Props) {
  const priv = usePrivileges()
  const [parties,   setParties]   = useState<PartieOuvrageType[]>(partiesInit)
  const [showModal, setShowModal] = useState(false)
  const [editItem,  setEditItem]  = useState<PartieOuvrageType | null>(null)

  const handleSaved = (saved: PartieOuvrageType) => {
    setParties((prev) => {
      const exists = prev.find((p) => p.id === saved.id)
      return exists ? prev.map((p) => (p.id === saved.id ? saved : p)) : [...prev, saved]
    })
    setShowModal(false)
    setEditItem(null)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer cette partie d\'ouvrage ? Les pondérations associées seront également supprimées.')) return
    await deletePartieOuvrage(id)
    setParties((prev) => prev.filter((p) => p.id !== id))
  }

  const sorted = [...parties].sort((a, b) => a.ordre - b.ordre)

  return (
    <>
      <Card>
        <CardHeader className="d-flex align-items-center justify-content-between">
          <div>
            <h5 className="card-title mb-0">Parties d&apos;ouvrage / Lots techniques</h5>
            <p className="text-muted small mb-0 mt-1">
              Ces parties sont utilisées dans la pondération des aléas climatiques.
            </p>
          </div>
          {priv.canEditSettings && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => { setEditItem(null); setShowModal(true) }}
            >
              <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter
            </Button>
          )}
        </CardHeader>
        <CardBody className="p-0">
          <div style={{ overflowX: 'auto' }}>
            <Table hover className="align-middle mb-0 table-sm">
              <thead className="table-light">
                <tr>
                  <th className="ps-3" style={{ width: 40 }}>#</th>
                  <th>Parties d&apos;ouvrages / Lots techniques</th>
                  <th className="text-center" style={{ width: 120 }}>Superficie (m²)</th>
                  <th className="text-center" style={{ width: 180 }}>
                    Prix Unitaires de référence<br />
                    <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>(FCFA/m²)</span>
                  </th>
                  <th className="text-center" style={{ width: 140 }}>
                    Prix Unitaire<br />
                    <span className="text-muted fw-normal" style={{ fontSize: '0.72rem' }}>(FCFA/m²)</span>
                  </th>
                  <th className="text-center pe-3" style={{ width: 90 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((p) => (
                  <tr key={p.id}>
                    <td className="ps-3 text-muted">{p.ordre}</td>
                    <td className="fw-medium" style={{ fontSize: '0.85rem' }}>{p.nom}</td>
                    <td className="text-center">{fmt(p.superficie)}</td>
                    <td className="text-center">{p.prixUnitaireRef}</td>
                    <td className="text-center fw-semibold">{fmt(p.prixUnitaire)}</td>
                    <td className="text-center pe-3">
                      <div className="hstack gap-1 justify-content-center">
                        {priv.canEditSettings && (
                          <Button
                            variant="soft-success"
                            size="sm"
                            className="btn-icon rounded-circle"
                            onClick={() => { setEditItem(p); setShowModal(true) }}
                            title="Modifier"
                          >
                            <IconifyIcon icon="tabler:edit" />
                          </Button>
                        )}
                        {/* <Button
                          variant="soft-danger"
                          size="sm"
                          className="btn-icon rounded-circle"
                          onClick={() => handleDelete(p.id)}
                          title="Supprimer"
                        >
                          <IconifyIcon icon="tabler:trash" />
                        </Button> */}
                      </div>
                    </td>
                  </tr>
                ))}

                {parties.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4 fst-italic">
                      Aucune partie d&apos;ouvrage configurée.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </CardBody>
      </Card>

      <PartieOuvrageModal
        show={showModal}
        onHide={() => { setShowModal(false); setEditItem(null) }}
        partie={editItem}
        onSaved={handleSaved}
      />
    </>
  )
}
