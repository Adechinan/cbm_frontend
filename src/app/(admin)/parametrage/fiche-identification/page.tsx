/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getSectionsFiche } from '@/services/batimentService'
import { Metadata } from 'next'
import { Card, CardBody, CardHeader, Col, Row } from 'react-bootstrap'
import ChampsFicheManager from './components/ChampsFicheManager'

export const metadata: Metadata = {
  title: "Fiche d'Identification — Paramétrage",
}

export default async function FicheIdentificationPage() {
  const sections = await getSectionsFiche()

  return (
    <>
      <PageTitle title="Paramétrage — Fiche d'identification" subTitle="Paramétrage" />

      <Row>
        <Col xs={12}>
          <Card>
            <CardHeader>
              <div>
                <h5 className="card-title mb-0">Champs de la fiche d&apos;identification</h5>
                <p className="text-muted small mb-0 mt-1">
                  Configurez les données collectées lors de l&apos;identification d&apos;un bâtiment.
                  Utilisez le bouton <strong>+</strong> par section pour ajouter un champ dans cette section.
                </p>
              </div>
            </CardHeader>
            <CardBody>
              <ChampsFicheManager sectionsInitiales={sections} />
            </CardBody>
          </Card>
        </Col>
      </Row>
    </>
  )
}
