/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import logoDark from '@/assets/images/logo-dark.png'
import logo from '@/assets/images/logo.png'
import IconifyIcon from '@/components/wrappers/IconifyIcon'
import Image from 'next/image'
import LoginForm from './components/LoginForm'
import { Button, Card, Col, Row } from 'react-bootstrap'
import Link from 'next/link'
import { Metadata } from 'next'
import { currentYear, developedBy } from '@/context/constants'

export const metadata: Metadata = { title: 'Log In' }

const LoginPage = () => {
  return (
    <>
      <div className="auth-bg d-flex min-vh-100 justify-content-center align-items-center">
        <Row className="g-0 justify-content-center w-100 m-xxl-5 px-xxl-4 m-3">
          <Col xl={4} lg={5} md={6}>
            <Card className="overflow-hidden text-center h-100 p-xxl-4 p-3 mb-0">
              {/* <Link href="/dashboard/entretien-batiment" className="auth-brand mb-3">
                <Image src={logoDark} alt="dark logo" height={24} className="logo-dark" />
                <Image src={logo} alt="logo light" height={24} className="logo-light" />
              </Link> */}
              <h3 className="fw-semibold mb-2">Se connecter</h3>
              {/* <p className="text-muted mb-4">Utiliser l'AD </p> */}
              <div className="d-flex justify-content-center gap-2 mb-3">
                {/* <Button variant='soft-danger' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:brand-google-filled' className="fs-24" /></span></Button> */}
                {/* <Button variant='soft-success' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:brand-apple' className="fs-24" /></span></Button> */}
                {/* <Button variant='soft-primary' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:brand-facebook' className="fs-24" /></span></Button> */}
                {/* <Button variant='soft-info' className="avatar-lg"> <span> <IconifyIcon width={24} height={24} icon='tabler:cloud-lock' className="fs-24" /></span></Button> */}
              </div>
              {/* <p className="fs-13 fw-semibold">Ou entrez votre adresse email et votre mot de passe.</p> */}
              <LoginForm />
              {/* <p className="text-danger fs-14 mb-4">Don&apos;t have an account? <Link href="/auth/register" className="fw-semibold text-dark ms-1">Sign Up !</Link></p> */}
              {/* <p className="mt-auto mb-0">
                 {currentYear} © Osen - By <span className="fw-bold text-decoration-underline text-uppercase text-reset fs-12">{developedBy}</span>
              </p> */}
            </Card>
          </Col>
        </Row>
      </div>
    </>
  )
}

export default LoginPage