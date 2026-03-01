/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import avatar1 from '@/assets/images/users/avatar-1.jpg'
import { currentYear, developedBy } from '@/context/constants'
import { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { Card, Col, Row } from 'react-bootstrap'

export const metadata: Metadata = { title: 'Account Deactivation' }

const AccountDeactivationPage = () => {
  return (
    <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
      <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
        <Col xl={4} lg={5} md={6}>
          <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
            <Link href="/dashboard/sales" className="auth-brand mb-3">
              <Image src={logoDark} alt="dark logo" height={24} className="logo-dark" />
              <Image src={logo} alt="logo light" height={24} className="logo-light" />
            </Link>
            <h3 className="fw-semibold mb-4">Deactivation Account</h3>
            <div className="d-flex align-items-center gap-2 mb-3 text-start">
              <Image src={avatar1} alt='avatar' className="avatar-xl rounded img-thumbnail" />
              <div>
                <h3 className="fw-semibold text-dark">Hi ! Dhanoo K.</h3>
                <p className="mb-0">Temporarily Deactivate your account instead of Deleting?</p>
              </div>
            </div>
            <div className="mb-3 text-start">
              <div className="alert alert-danger fw-medium mb-0" role="alert">
                Your profile will be temporarily hidden until you activate it again by logging back in
              </div>
            </div>
            <div className="d-grid">
              <button className="btn btn-primary" type="submit">Deactivate Account</button>
            </div>
            <p className="text-danger fs-14 my-3">Back to <Link href="/auth/login" className="text-dark fw-semibold ms-1">Login !</Link>
            </p><p className="mt-auto mb-0">
              {currentYear} © Osen - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
            </p>
          </Card>
        </Col>
      </Row>
    </div>

  )
}

export default AccountDeactivationPage