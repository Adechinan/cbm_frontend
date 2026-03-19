/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import React from 'react'
// import logo from '@/assets/images/logo.png'
import logo from '@/assets/images/logo-text.png'
// import logoSm from '@/assets/images/logo-sm.png'
import logoSm from '@/assets/images/logo-dgml.png'
// import logoDark from '@/assets/images/logo-dark.png'
import logoDark from '@/assets/images/logo-dgml.png'
import Image from 'next/image'
import Link from 'next/link'


const customLogo = () => {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 420 80"
      role="img"
      aria-label="isellup.com"
      style={{ width: "100%", maxWidth: 150, height: "auto", display: "block" }}
      preserveAspectRatio="xMidYMid meet"
    >
      <text
        x="0"
        y="58"
        fill="#ffffff"
        fontFamily="Arial Rounded MT Bold, Arial Rounded MT, Arial, sans-serif"
        fontSize="45"
        fontWeight="700"
        letterSpacing="0.5"
      >
        Entretien Bâtiments
      </text>
      {/* <circle cx="11" cy="5" r="7" fill="#F97316" /> */}
    </svg>
  )
}

const LogoBox = () => {
  return (
    <Link href="/dashboard/entretien-batiment" className="logo">
      {/* <div className="logo-light" style={{minHeight: '5px'}}>
        {customLogo()}
      </div> */}
      <span className="logo-light">
        {/* <span className="logo-lg">Entretien Bâtiments</span> */}
        {/* <span className="logo-lg">-</span> */}
        {/* {customLogo()} */}
        {/* <span className="logo-lg"><Image src={logo} width={73} height={20} alt="logo" /></span> */}
        <span className="logo-lg" style={{marginTop: '10px', marginBottom: '20px'}}>{customLogo()}</span>
        <span className="logo-sm"><Image src={logoSm} width={21} height={20} alt="small logo" /></span>
      </span>
      <span className="logo-dark">
        {/* {customLogo()} */}
        <span className="logo-lg"><Image src={logoDark} width={73} height={20}  alt="dark logo" /></span>
        <span className="logo-sm"><Image src={logoSm} width={21} height={20} alt="small logo" /></span>
      </span>
    </Link>
  )
}

export default LogoBox