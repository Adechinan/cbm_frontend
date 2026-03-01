/* Konrad Ahodan : konrad.ahodan@approbations.ca */
import 'jsvectormap'
import 'jsvectormap/dist/maps/world-merc'

//components
import BaseVectorMap from './BaseVectorMap'

interface WorldVectorMapProps {
  width?: string
  height?: string
  options?: any
}

const WorldLineVectorMap = ({ width, height, options }: WorldVectorMapProps) => {
  return (
    <>
      <BaseVectorMap width={width} height={height} options={options} type="world_merc" />
    </>
  )
}

export default WorldLineVectorMap
