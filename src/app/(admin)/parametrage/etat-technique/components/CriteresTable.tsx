/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'

import { useState } from 'react'
import { Badge, Button, Card, CardBody, CardHeader, Table } from 'react-bootstrap'
import { CritereEvaluationType, ElementCritereEvaluation } from '@/types/entretien-batiment'
import { deleteCritereTechnique, deleteElementTechnique } from '@/services/batimentService'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import SectionModal from '../../etat-fonctionnel/components/SectionModal'
import ElementModal from '../../etat-fonctionnel/components/ElementModal'

const ETAT_BG: Record<string, string> = { Bon: 'success', Passable: 'warning', Mauvais: 'danger', Dangereux: 'dark' }

type Props = {
  criteres: CritereEvaluationType[]
}

export default function CriteresTableTechnique({ criteres: init }: Props) {
  const [sections, setSections] = useState<CritereEvaluationType[]>(init)
  const [showSectionModal, setShowSectionModal] = useState(false)
  const [editSection, setEditSection]           = useState<CritereEvaluationType | null>(null)
  const [showElementModal, setShowElementModal] = useState(false)
  const [editElement, setEditElement]           = useState<ElementCritereEvaluation | null>(null)
  const [activeSectionId, setActiveSectionId]   = useState<string>('')

  const totalPondSections = sections.reduce((s, c) => s + c.ponderation, 0)

  const handleSectionSaved = (saved: CritereEvaluationType) => {
    setSections((prev) => {
      const exists = prev.find((s) => s.id === saved.id)
      return exists ? prev.map((s) => (s.id === saved.id ? saved : s)) : [...prev, saved]
    })
    setShowSectionModal(false)
    setEditSection(null)
  }

  const handleDeleteSection = async (id: string) => {
    if (!confirm('Supprimer cette section et tous ses éléments ?')) return
    await deleteCritereTechnique(id)
    setSections((prev) => prev.filter((s) => s.id !== id))
  }

  const openAddElement = (sectionId: string) => {
    setActiveSectionId(sectionId)
    setEditElement(null)
    setShowElementModal(true)
  }

  const openEditElement = (sectionId: string, el: ElementCritereEvaluation) => {
    setActiveSectionId(sectionId)
    setEditElement(el)
    setShowElementModal(true)
  }

  const handleElementSaved = (updatedSection: CritereEvaluationType) => {
    setSections((prev) => prev.map((s) => (s.id === updatedSection.id ? updatedSection : s)))
    setShowElementModal(false)
    setEditElement(null)
  }

  const handleDeleteElement = async (sectionId: string, elementId: string) => {
    if (!confirm('Supprimer cet élément ?')) return
    const updated = await deleteElementTechnique(sectionId, elementId)
    setSections((prev) => prev.map((s) => (s.id === updated.id ? updated : s)))
  }

  return (
    <>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div>
          <span className="text-muted small me-2">Total sections :</span>
          <Badge bg={totalPondSections === 100 ? 'success' : 'danger'} className="fw-semibold">
            {totalPondSections} %
          </Badge>
        </div>
        <Button variant="success" size="sm" onClick={() => { setEditSection(null); setShowSectionModal(true) }}>
          <IconifyIcon icon="tabler:plus" className="me-1" /> Ajouter une section
        </Button>
      </div>

      {sections.map((sec) => {
        const totalEl = sec.elements.reduce((s, e) => s + e.ponderation, 0)
        return (
          <Card key={sec.id} className="mb-3">
            <CardHeader className="d-flex align-items-center justify-content-between py-2">
              <div className="d-flex align-items-center gap-2">
                <span className="fw-semibold text-uppercase" style={{ fontSize: '0.78rem', letterSpacing: 0.8 }}>
                  {sec.section}
                </span>
                <Badge bg="primary" className="fw-normal" style={{ fontSize: '0.72rem' }}>
                  Section : {sec.ponderation} %
                </Badge>
              </div>
              <div className="hstack gap-1">
                {/* <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                  onClick={() => openAddElement(sec.id)} title="Ajouter un élément">
                  <IconifyIcon icon="tabler:plus" />
                </Button> */}
                <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                  onClick={() => { setEditSection(sec); setShowSectionModal(true) }} title="Modifier la section">
                  <IconifyIcon icon="tabler:edit" />
                </Button>&nbsp;&nbsp;&nbsp;
                {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle"
                  onClick={() => handleDeleteSection(sec.id)} title="Supprimer la section">
                  <IconifyIcon icon="tabler:trash" />
                </Button> */}
              </div>
            </CardHeader>
            <CardBody className="p-0">
              <Table hover className="align-middle mb-0 table-sm">
                <thead className="table-light">
                  <tr>
                    <th className="ps-3" style={{ width: 40 }}>#</th>
                    <th>Élément</th>
                    <th className="text-center" style={{ width: 110 }}>Pondération (%)</th>
                    <th>États disponibles</th>
                    <th className="text-center" style={{ width: 80 }}>Statut</th>
                    <th className="text-center pe-3" style={{ width: 100 }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {[...sec.elements].sort((a, b) => a.ordre - b.ordre).map((el) => (
                    <tr key={el.id} className={!el.actif ? 'opacity-50' : ''}>
                      <td className="ps-3 text-muted">{el.ordre}</td>
                      <td>
                        <span className="fw-medium" style={{ fontSize: '0.85rem' }}>{el.libelle}</span>
                        {el.description && <div className="text-muted small">{el.description}</div>}
                      </td>
                      <td className="text-center">
                        <Badge bg="secondary" className="fw-normal">{el.ponderation} %</Badge>
                      </td>
                      <td>
                        <div className="d-flex flex-wrap gap-1">
                          {el.etatsDisponibles.map(({ etat, note }) => (
                            <Badge key={etat} bg={ETAT_BG[etat] ?? 'secondary'} className="fw-normal" style={{ fontSize: '0.72rem' }}>
                              {etat} <span className="opacity-75">({note})</span>
                            </Badge>
                          ))}
                        </div>
                      </td>
                      <td className="text-center">
                        <Badge bg={el.actif ? 'success' : 'secondary'}>{el.actif ? 'Actif' : 'Inactif'}</Badge>
                      </td>
                      <td className="text-center pe-3">
                        <div className="hstack gap-1 justify-content-center">
                          <Button variant="soft-success" size="sm" className="btn-icon rounded-circle"
                            onClick={() => openEditElement(sec.id, el)} title="Modifier">
                            <IconifyIcon icon="tabler:edit" />
                          </Button>
                          {/* <Button variant="soft-danger" size="sm" className="btn-icon rounded-circle"
                            onClick={() => handleDeleteElement(sec.id, el.id)} title="Supprimer">
                            <IconifyIcon icon="tabler:trash" />
                          </Button> */}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {sec.elements.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center text-muted py-3 fst-italic small">
                        Aucun élément —{' '}
                        <button className="btn btn-link btn-sm p-0" type="button" onClick={() => openAddElement(sec.id)}>Ajouter le premier</button>
                      </td>
                    </tr>
                  )}
                </tbody>
                <tfoot className="table-light">
                  <tr>
                    <td colSpan={2} className="ps-3 text-muted small">Total éléments</td>
                    <td className="text-center">
                      <Badge bg={totalEl === 100 ? 'success' : 'danger'} className="fw-semibold">{totalEl} %</Badge>
                    </td>
                    <td colSpan={3} />
                  </tr>
                </tfoot>
              </Table>
            </CardBody>
          </Card>
        )
      })}

      {sections.length === 0 && (
        <div className="text-center text-muted py-5 fst-italic">Aucune section configurée.</div>
      )}

      <SectionModal
        show={showSectionModal}
        onHide={() => { setShowSectionModal(false); setEditSection(null) }}
        section={editSection}
        typeCritere="technique"
        onSaved={handleSectionSaved}
      />

      <ElementModal
        show={showElementModal}
        onHide={() => { setShowElementModal(false); setEditElement(null) }}
        sectionId={activeSectionId}
        typeCritere="technique"
        element={editElement}
        onSaved={handleElementSaved}
      />
    </>
  )
}
