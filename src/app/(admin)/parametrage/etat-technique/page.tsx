/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getCriteresEtatTechnique } from '@/services/batimentService'
import { Metadata } from 'next'
import { Button, Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import CriteresTableTechnique from './components/CriteresTable'
import IconifyIcon from '@/components/wrappers/IconifyIcon'

export const metadata: Metadata = {
  title: 'État Technique — Paramétrage',
}

export default async function EtatTechniquePage() {
  const criteres = await getCriteresEtatTechnique()

  return (
    <>
      <PageTitle
        title="Paramétrage — État Technique"
        subTitle="Paramétrage"
      />

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="card-title mb-0">Éléments d&apos;évaluation technique</h5>
                  <p className="text-muted small mb-0 mt-1">
                    Gérez les éléments (structure, façade, toiture…) inspectés lors de l&apos;évaluation technique.
                  </p>
                </div>
                {/* <span className="badge bg-soft-primary text-primary fs-6">
                  {criteres.filter((c) => c.actif).length} / {criteres.length} actifs
                </span> */}
                {/* <Button
                  variant="success"
                  size="sm"

                >
                  <IconifyIcon icon="tabler:plus" style={{ fontSize: '0.8rem' }} className="me-1" /> Ajouter un critère
                </Button> */}
              </div>
            </CardHeader>
            <CardBody>
              <CriteresTableTechnique criteres={criteres} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}
