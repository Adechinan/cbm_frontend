/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getCriteresEtatFonctionnel } from '@/services/batimentService'
import { Metadata } from 'next'
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import CriteresTable from './components/CriteresTable'

export const metadata: Metadata = {
  title: 'État Fonctionnel — Paramétrage',
}

export default async function EtatFonctionnelPage() {
  const criteres = await getCriteresEtatFonctionnel()

  return (
    <>
      <PageTitle
        title="Paramétrage — État Fonctionnel"
        subTitle="Paramétrage"
      />

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <div className="d-flex align-items-center justify-content-between">
                <div>
                  <h5 className="card-title mb-0">Critères d&apos;évaluation fonctionnelle</h5>
                  <p className="text-muted small mb-0 mt-1">
                    Gérez les critères utilisés pour évaluer l&apos;état fonctionnel des bâtiments.
                  </p>
                </div>
                {/* <span className="badge bg-soft-primary text-primary fs-6">
                  {criteres.filter((c) => c.actif).length} / {criteres.length} actifs
                </span> */}
              </div>
            </CardHeader>
            <CardBody>
              <CriteresTable criteres={criteres} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}
