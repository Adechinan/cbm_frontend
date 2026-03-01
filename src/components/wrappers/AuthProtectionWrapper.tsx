/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import { useSession } from 'next-auth/react'
import { usePathname, useRouter } from 'next/navigation'
import { Suspense, useEffect } from 'react'

import type { ChildrenType } from '@/types/component-props'
import FallbackLoading from '../FallbackLoading'

const AuthProtectionWrapper = ({ children }: ChildrenType) => {
  const { data: session, status } = useSession()
  const { push } = useRouter()
  const pathname = usePathname()

  // Synchronise le token Laravel (stocké dans la session NextAuth) dans
  // localStorage pour que les Client Components puissent l'utiliser.
  useEffect(() => {
    const token = (session as { apiToken?: string } | null)?.apiToken
    if (token) {
      localStorage.setItem('api_token', token)
    }
  }, [session])

  if (status == 'unauthenticated') {
    push(`/auth/login?redirectTo=${pathname}`)
    return <FallbackLoading />
  }

  return <Suspense>{children}</Suspense>
}

export default AuthProtectionWrapper
