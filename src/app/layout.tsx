/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import Image from 'next/image'
import NextTopLoader from 'nextjs-toploader'
import logoDark from '../assets/images/logo-dark.png'
import AppProvidersWrapper from '../components/wrappers/AppProvidersWrapper'
import { DEFAULT_PAGE_TITLE } from '@/context/constants'

import 'flatpickr/dist/flatpickr.css'
import 'jsvectormap/dist/css/jsvectormap.min.css'
import '@/assets/scss/app.scss'

const inter = Inter({
  subsets: ['latin'],
  weight: ['100', '200', '300', '400', '500', '600', '700', '800', '900'],
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    template: '%s | Osen Nextjs - Responsive Bootstrap 5 Admin Dashboard',
    default: DEFAULT_PAGE_TITLE,
  },
  description: 'A fully responsive premium admin dashboard template, Real Estate Management Admin Template',
}

const splashScreenStyles = `
#splash-screen {
  position: fixed;
  top: 50%;
  left: 50%;
  background: white;
  display: flex;
  height: 100%;
  width: 100%;
  transform: translate(-50%, -50%);
  align-items: center;
  justify-content: center;
  z-index: 9999;
  opacity: 1;
  transition: all 15s linear;
  overflow: hidden;
}

#splash-screen.remove {
  animation: fadeout 0.7s forwards;
  z-index: 0;
}

@keyframes fadeout {
  to {
    opacity: 0;
    visibility: hidden;
  }
}
`

export default function RootLayout({
                                     children,
                                   }: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
    <head>
      <style suppressHydrationWarning>{splashScreenStyles}</style>
    </head>
    <body className={inter.className} suppressHydrationWarning>
    <div id="splash-screen">
      <Image alt="Logo" width={112} height={24} src={logoDark} style={{ height: '6%', width: 'auto' }} priority />
    </div>
    <NextTopLoader color="#604ae3" showSpinner={false} />
    <div id="__next_splash">
      <AppProvidersWrapper>{children}</AppProvidersWrapper>
    </div>
    </body>
    </html>
  )
}
