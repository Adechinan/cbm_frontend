/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import { signOut, useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import type { ChildrenType } from '@/types/component-props'
import FallbackLoading from '../FallbackLoading'

const INACTIVITY_TIMEOUT = 30 * 60 * 1000 // 30 minutes

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { data: session, status } = useSession()
  const { push } = useRouter()
  const pathname = usePathname()

  // Synchronise le token Laravel dans localStorage
  useEffect(() => {
    const token = (session as { apiToken?: string } | null)?.apiToken
    if (token) {
      localStorage.setItem('api_token', token)
    }
  }, [session])

  // Redirection si non authentifié (dans un useEffect pour éviter l'erreur React)
  useEffect(() => {
    if (status === 'unauthenticated') {
      push(`/auth/login?redirectTo=${pathname}`)
    }
  }, [status, pathname, push])

  // Déconnexion automatique après inactivité
  useEffect(() => {
    if (status !== 'authenticated') return

    let timer: ReturnType<typeof setTimeout>

    const resetTimer = () => {
      clearTimeout(timer)
      timer = setTimeout(() => {
        localStorage.removeItem('api_token')
        signOut({ callbackUrl: '/auth/login' })
      }, INACTIVITY_TIMEOUT)
    }

    const events = ['mousemove', 'keydown', 'click', 'touchstart', 'scroll']
    events.forEach((e) => window.addEventListener(e, resetTimer, { passive: true }))
    resetTimer()

    return () => {
      clearTimeout(timer)
      events.forEach((e) => window.removeEventListener(e, resetTimer))
    }
  }, [status])

  if (status === 'loading' || status === 'unauthenticated') {
    return <FallbackLoading />
  }

  return <Suspense>{children}</Suspense>
}

export default AuthProtectionWrapper
