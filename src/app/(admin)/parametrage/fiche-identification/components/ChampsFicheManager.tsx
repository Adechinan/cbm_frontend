/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Badge, Button, Table } from 'react-bootstrap'
import { ChampFicheType, SectionFicheType, TypeChamp } from '@/types/entretien-batiment'
import { updateChampFiche, deleteChampFiche } from '@/services/batimentService'
import AddChampModal from './AddChampModal'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

const TYPE_BADGE: Record<TypeChamp, string> = {
  Texte: 'dark', Nombre: 'dark', Select: 'dark', Radio: 'dark',
  Date: 'dark', Checkbox: 'dark', GPS: 'dark', Textearea: 'dark',
}

type Props = {
  sectionsInitiales: SectionFicheType[]
}

export default function ChampsFicheManager({ sectionsInitiales }: Props) {
  const [sections, setSections]       = useState<SectionFicheType[]>(sectionsInitiales)
  const [showModal, setShowModal]     = useState(false)
  const [editChamp, setEditChamp]     = useState<ChampFicheType | null>(null)
  const [sectionCible, setSectionCible] = useState<string | null>(null)  // id de section

  const openAddModal = (sectionId?: string) => {
    setEditChamp(null)
    setSectionCible(sectionId ?? null)
    setShowModal(true)
  }

  const openEditModal = (champ: ChampFicheType) => {
    setEditChamp(champ)
    setSectionCible(null)
    setShowModal(true)
  }

  const handleToggleActif = async (champ: ChampFicheType) => {
    const updated = await updateChampFiche(champ.id, { actif: !champ.actif })
    setSections((prev) => prev.map((s) => ({
      ...s,
      champs: s.champs.map((c) => c.id === updated.id ? updated : c),
    })))
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Supprimer ce champ ?')) return
    await deleteChampFiche(id)
    setSections((prev) => prev.map((s) => ({
      ...s,
      champs: s.champs.filter((c) => c.id !== id),
    })))
  }

  const handleSaved = (saved: ChampFicheType) => {
    setSections((prev) => {
      const sectionIdx = prev.findIndex((s) => s.id === saved.sectionId)
      if (sectionIdx >= 0) {
        const sec = prev[sectionIdx]
        const champIdx = sec.champs.findIndex((c) => c.id === saved.id)
        const newChamps = champIdx >= 0
          ? sec.champs.map((c) => c.id === saved.id ? saved : c)
          : [...sec.champs, saved]
        return prev.map((s, i) => i === sectionIdx ? { ...s, champs: newChamps } : s)
      } else if (saved.section) {
        // Nouvelle section créée avec ce champ
        return [...prev, saved.section]
      }
      return prev
    })
    setShowModal(false)
    setEditChamp(null)
    setSectionCible(null)
  }

  // Sections ordonnées passées à la modale (section cible en tête)
  const sectionsForModal = sectionCible
    ? [
        ...sections.filter((s) => s.id === sectionCible),
        ...sections.filter((s) => s.id !== sectionCible),
      ]
    : sections

  const sectionsTriees = [...sections].sort((a, b) => a.ordre - b.ordre)

  return (
    <>
      {/* Bouton global Ajouter */}
      <div className="d-flex justify-content-end mb-3">
        <Button variant="success" size="sm" onClick={() => openAddModal()}>
          <IconifyIcon icon="tabler:plus" style={{ fontSize: '0.8rem' }} className="me-1" /> Ajouter un champ
        </Button>
      </div>

      {/* Tableau par section */}
      {sectionsTriees.map((section) => {
        const champsSection = [...section.champs].sort((a, b) => a.ordre - b.ordre)

        return (
          <div key={section.id} className="mb-4">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <h6
                className="fw-semibold text-muted text-uppercase mb-0"
                style={{ fontSize: '0.75rem', letterSpacing: 1 }}
              >
                {section.libelle}
                <Badge bg="light" text="dark" className="ms-2 border">
                  {champsSection.length}
                </Badge>
                {!section.actif && (
                  <Badge bg="secondary" className="ms-2 fw-normal" style={{ fontSize: '0.65rem' }}>Inactive</Badge>
                )}
              </h6>
              <Button
                variant="outline-primary"
                size="sm"
                onClick={() => openAddModal(section.id)}
                title={`Ajouter un champ dans « ${section.libelle} »`}
              >
                <IconifyIcon icon="tabler:plus" style={{ fontSize: '0.8rem' }} />
              </Button>
            </div>

            <Table hover responsive className="align-middle mb-0 table-sm">
              <thead className="table-light">
                <tr>
                  <th>Libellé</th>
                  <th style={{ width: 110 }}>Type</th>
                  <th className="text-center" style={{ width: 90 }}>Ordre</th>
                  <th className="text-center" style={{ width: 110 }}>Obligatoire</th>
                  <th className="text-center" style={{ width: 90 }}>Statut</th>
                  <th className="text-center" style={{ width: 130 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {champsSection.map((champ) => (
                  <tr key={champ.id} className={!champ.actif ? 'opacity-50' : ''}>
                    <td>
                      <span className="fw-medium">{champ.libelle}</span>
                      {(champ.type === 'Select' || champ.type === 'Radio') && champ.options && champ.options.length > 0 && (
                        <div className="text-muted small mt-1 font-monospace">
                          [{champ.options.join(', ')}]
                        </div>
                      )}
                    </td>
                    <td>
                      <Badge bg={TYPE_BADGE[champ.type]} className="fw-normal">
                        {champ.type}
                      </Badge>
                    </td>
                    <td className="text-center text-muted">{champ.ordre}</td>
                    <td className="text-center">
                      {champ.obligatoire ? (
                        <IconifyIcon icon="tabler:check" className="text-success fs-5" />
                      ) : (
                        <span className="text-muted">—</span>
                      )}
                    </td>
                    <td className="text-center">
                      <Badge bg={champ.actif ? 'success' : 'secondary'}>
                        {champ.actif ? 'Actif' : 'Inactif'}
                      </Badge>
                    </td>
                    <td className="hstack gap-1 justify-content-end">
                      <Button variant={champ.actif ? 'soft-warning' : 'soft-success'} size="sm" className="btn-icon rounded-circle"
                        onClick={() => handleToggleActif(champ)}
                        title={champ.actif ? 'Désactiver' : 'Activer'}
                      >
                        <IconifyIcon icon={champ.actif ? 'tabler:eye-off' : 'tabler:eye'} />
                      </Button>
                      <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                        onClick={() => openEditModal(champ)}
                        title="Modifier"
                      >
                        <IconifyIcon icon="tabler:edit" className="fs-16" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        )
      })}

      <AddChampModal
        show={showModal}
        onHide={() => {
          setShowModal(false)
          setEditChamp(null)
          setSectionCible(null)
        }}
        champ={editChamp}
        sectionsExistantes={sectionsForModal}
        onSaved={handleSaved}
      />
    </>
  )
}
