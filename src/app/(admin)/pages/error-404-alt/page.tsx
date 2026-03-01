/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import Image from 'next/image'
import React from 'react'
import Error404Alt from '@/assets/images/error/error-404.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import PageTitle from '@/components/PageTitle'
import { Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = { title: 'Error 404' }

const Error404AltPage = () => {
  return (
    <>
      <PageTitle title='404 Error' subTitle="Pages" />
      <Row className="justify-content-center">
        <Col lg={4}>
          <div className="text-center">
            <Image src={Error404Alt} height={230} alt="File not found Image" />
            <h4 className="text-uppercase text-danger mt-3">Page Not Found</h4>
            <p className="text-muted mt-3">Il semble que vous ayez pris le mauvais chemin. Ne vous inquiétez pas..
              Cela arrive aux meilleurs d'entre nous. Voici un
              petit conseil qui pourrait vous aider à vous remettre sur la bonne voie.
            </p>
            <Link className="btn btn-info mt-3" href="/dashboard/entretien-batiment"><IconifyIcon icon='tabler:home' className="me-1" /> Return Home</Link>
          </div>
        </Col>
      </Row>
    </>

  )
}

export default Error404AltPage