/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import { useLayoutContext } from '@/context/useLayoutContext'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

const Horizontal = () => {
  const router = useRouter()
  const { changeLayoutOrientation } = useLayoutContext()
  useEffect(() => {
    changeLayoutOrientation('horizontal')
    router.push('/dashboard/sales')
  }, [])
  return <></>
}

export default Horizontal
