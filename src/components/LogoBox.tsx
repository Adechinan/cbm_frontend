/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import React from 'react'
import logo from '@/assets/images/logo.png'
import logoSm from '@/assets/images/logo-sm.png'
import logoDark from '@/assets/images/logo-dark.png'
import Image from 'next/image'
import Link from 'next/link'

const LogoBox = () => {
  return (
    <Link href="/dashboard/entretien-batiment" className="logo">
      <span className="logo-light">
        <span className="logo-lg"><Image src={logo} width={73} height={20} alt="logo" /></span>
        <span className="logo-sm"><Image src={logoSm} width={21} height={20} alt="small logo" /></span>
      </span>
      <span className="logo-dark">
        <span className="logo-lg"><Image src={logoDark} width={73} height={20}  alt="dark logo" /></span>
        <span className="logo-sm"><Image src={logoSm} width={21} height={20} alt="small logo" /></span>
      </span>
    </Link>
  )
}

export default LogoBox