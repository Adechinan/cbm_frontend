/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import error500Img from '@/assets/images/error/error-500.png'
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'
import { currentYear, developedBy } from '@/context/constants'

export const metadata: Metadata = { title: 'Error 500' }

const Error500Page = () => {
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
            <Link href="/dashboard/sales" className="auth-brand mb-3">
              <Image src={logoDark} alt="dark logo" height={24} className="logo-dark" />
              <Image src={logo} alt="logo light" height={24} className="logo-light" />
            </Link>
            <div className="mx-auto text-center">
              <h3 className="fw-semibold mb-2">Ooop&apos;s ! </h3>
              <Image src={error500Img} alt="error 500 img" height={230} className="my-3" />
              <h3 className="fw-bold mt-3 text-primary lh-base">Server Error</h3>
              <h5 className="fw-bold mt-2 text-dark lh-base">Ohh Noo ! Seem Like Our Servers Are Lost</h5>
              <p className="text-muted fs-12 mb-3">Our internal server has gone on a uninformed vacation. And, we are trying our best to bring it back online.</p>
              <Link href="/dashboard/sales" className="btn btn-primary">Back To Home <IconifyIcon icon='tabler:home' className="ms-1" /></Link>
            </div>
            <p className="mt-3 mb-0">
               {currentYear} © Entretien Batiments - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
            </p>
          </Card>
        </Col>
      </Row>
    </div>

  )
}

export default Error500Page