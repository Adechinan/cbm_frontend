/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import { useEffect } from 'react'

interface BaseVectorMapProps {
  width?: string
  height?: string
  options?: any
  type: string
}

const BaseVectorMap = ({ width, height, options, type }: BaseVectorMapProps) => {
  const selectorId = type

  useEffect(() => {
    console.log('Map initialized:', selectorId)

    const map = new (window as any)['jsVectorMap']({
      selector: '#' + selectorId,
      map: type,
      ...options,
    })

    return () => {
      console.log('Map destroyed:', selectorId)
      map.destroy()
    }

  }, [type, options])

  return (
    <>
      <div id={selectorId} style={{ width: width, height: height }}></div>
    </>
  )
}

export default BaseVectorMap
