/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import maintenanceImg from '@/assets/images/png/maintenance.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import { Metadata } from 'next'
import Image from 'next/image' 
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'

export const metadata: Metadata = { title: 'Maintenance' }

const MaintenancePage = () => {
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
            <Link href="/dashboard/sales" className="auth-brand mb-3">
              <Image src={logoDark} alt="dark logo" height={24} className="logo-dark" />
              <Image src={logo} alt="logo light" height={24} className="logo-light" />
            </Link>
            <div>
              <h3 className="fw-semibold text-dark">Ooop&apos;s ! </h3>
            </div>
            <Image src={maintenanceImg} alt='maintenance' className="img-fluid mt-3" height={320} />
            <h5 className="fw-bold my-3 fs-20 text-dark lh-base">We are Under Scheduled Maintenance</h5>
            <Link href="/dashboard/sales" className="btn btn-primary">Back To Home <IconifyIcon icon='tabler:home' className="ms-1" /></Link>
          </Card>
        </Col>
      </Row>
    </div>
  )
}

export default MaintenancePage