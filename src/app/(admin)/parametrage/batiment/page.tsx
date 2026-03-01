/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import PageTitle from '@/components/PageTitle'
import { getCriteresEtatBatiment, getPartiesOuvrage, getTypesBatiment } from '@/services/batimentService'
import { Metadata } from 'next'
import { Col, Row } from 'react-bootstrap'
import TypeBatimentManager from './components/TypeBatimentManager'
import PartiesOuvrageManager from './components/PartiesOuvrageManager'
import CritereEtatBatimentManager from './components/CritereEtatBatimentManager'

export const metadata: Metadata = {
  title: 'Bâtiment — Paramétrage',
}

export default async function BatimentParametragePage() {
  const [types, criteres, parties] = await Promise.all([
    getTypesBatiment(),
    getCriteresEtatBatiment(),
    getPartiesOuvrage(),
  ])

  return (
    <>
      <PageTitle title="Paramétrage — Bâtiment" subTitle="Paramétrage" />

      <Row className="g-3">
        <Col xs={12} md={6}>
          <TypeBatimentManager typesInit={types} />
        </Col>

        <Col xs={12} md={6}>
          <CritereEtatBatimentManager criteresInit={criteres} />
        </Col>

        <Col xs={12}>
          <PartiesOuvrageManager partiesInit={parties} />
        </Col>
      </Row>
    </>
  )
}
