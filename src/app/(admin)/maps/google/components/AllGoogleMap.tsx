/* Konrad Ahodan : konrad.ahodan@approbations.ca */
'use client'
import { GoogleMap, LoadScript, Marker, StreetViewPanorama } from '@react-google-maps/api'
import React from 'react'
import { Card, Col, Row } from 'react-bootstrap'

const containerStyle = {
  width: '100%',
  height: '400px',
}

const center = {
  lat: -12.043333,
  lng: -77.028333,
}


const BasicMap = () => {
  const [map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Basic Google Map</h4>
        <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
          <LoadScript googleMapsApiKey="AIzaSyAgIfLQi8KTxTJahilcem6qHusV-V6XXjw">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={14} // Set the zoom level here
              onLoad={onLoad}
              onUnmount={onUnmount}></GoogleMap>
          </LoadScript>
        </div>
      </Card.Body>
    </Card>
  )
}

const MapWithMarker = () => {
  const markers = [
    { lat: -3.745, lng: -38.523, title: 'Marker 1' },
    { lat: -3.745, lng: -38.533, title: 'Marker 2' },
    { lat: -3.735, lng: -38.523, title: 'Marker 3' },
  ]

  const [_map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Google Map with Marker</h4>
        <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
          <LoadScript googleMapsApiKey="AIzaSyAgIfLQi8KTxTJahilcem6qHusV-V6XXjw">
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14} onLoad={onLoad} onUnmount={onUnmount}>
              {/* Add markers */}
              {markers.map((marker, index) => (
                <Marker key={index} position={{ lat: marker.lat, lng: marker.lng }} title={marker.title} />
              ))}
            </GoogleMap>
          </LoadScript>
        </div>
      </Card.Body>
    </Card>
  )
}

const StreetViewMap = () => {
  const [_map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])
  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Street View Panoramas Google Map</h4>
        <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
          <LoadScript googleMapsApiKey="AIzaSyAgIfLQi8KTxTJahilcem6qHusV-V6XXjw">
            <GoogleMap mapContainerStyle={containerStyle} center={center} zoom={14} onLoad={onLoad} onUnmount={onUnmount}>
              {/* Add StreetViewPanorama */}
              <StreetViewPanorama
                options={{
                  position: center, // Set the position for Street View
                  visible: true,
                  panControl: false,
                  zoomControl: false,
                }}
              />
            </GoogleMap>
          </LoadScript>
        </div>
      </Card.Body>
    </Card>
  )
}

const PolyLineMap = () => {
  const containerStyle = {
    width: '100%',
    height: '400px',
  }

  const center = {
    lat: 37.7749,
    lng: -122.4194,
  }


  const [_map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Poly Line Map</h4>
        <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
          <LoadScript googleMapsApiKey="AIzaSyAgIfLQi8KTxTJahilcem6qHusV-V6XXjw">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              zoom={14}
              mapTypeId="hybrid" // Change this to "roadmap", "satellite", "terrain", etc.
              onLoad={onLoad}
              onUnmount={onUnmount}
            ></GoogleMap>

          </LoadScript>
        </div>
      </Card.Body>
    </Card>
  )
}

const UltraLightStyledMap = () => {
  const mapStyles = [
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#e9e9e9' }, { lightness: 17 }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 20 }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#ffffff' }, { lightness: 17 }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#ffffff' }, { lightness: 29 }, { weight: 0.2 }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 18 }],
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#ffffff' }, { lightness: 16 }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#f5f5f5' }, { lightness: 21 }],
    },
    {
      featureType: 'poi.park',
      elementType: 'geometry',
      stylers: [{ color: '#dedede' }, { lightness: 21 }],
    },
    {
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#ffffff' }, { lightness: 16 }],
    },
    {
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#333333' }, { lightness: 40 }],
    },
    { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#f2f2f2' }, { lightness: 19 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#fefefe' }, { lightness: 20 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#fefefe' }, { lightness: 17 }, { weight: 1.2 }],
    },
  ]

  const [_map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Ultra Light with Labels</h4>

        <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
          <LoadScript googleMapsApiKey="AIzaSyAgIfLQi8KTxTJahilcem6qHusV-V6XXjw">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              options={{
                styles: mapStyles,
              }}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}></GoogleMap>
          </LoadScript>
        </div>
      </Card.Body>
    </Card>
  )
}

const DarkStyledMap = () => {
  const mapStyles = [
    {
      featureType: 'all',
      elementType: 'labels',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.fill',
      stylers: [{ saturation: 36 }, { color: '#000000' }, { lightness: 40 }],
    },
    {
      featureType: 'all',
      elementType: 'labels.text.stroke',
      stylers: [{ visibility: 'on' }, { color: '#000000' }, { lightness: 16 }],
    },
    {
      featureType: 'all',
      elementType: 'labels.icon',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.fill',
      stylers: [{ color: '#000000' }, { lightness: 20 }],
    },
    {
      featureType: 'administrative',
      elementType: 'geometry.stroke',
      stylers: [{ color: '#000000' }, { lightness: 17 }, { weight: 1.2 }],
    },
    {
      featureType: 'administrative.country',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'administrative.locality',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#c4c4c4' }],
    },
    {
      featureType: 'administrative.neighborhood',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'landscape',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 20 }],
    },
    {
      featureType: 'poi',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 21 }, { visibility: 'on' }],
    },
    {
      featureType: 'poi.business',
      elementType: 'geometry',
      stylers: [{ visibility: 'on' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.fill',
      stylers: [{ color: '#e5c163' }, { lightness: '0' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'geometry.stroke',
      stylers: [{ visibility: 'off' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.highway',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#e5c163' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 18 }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'geometry.fill',
      stylers: [{ color: '#575757' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#ffffff' }],
    },
    {
      featureType: 'road.arterial',
      elementType: 'labels.text.stroke',
      stylers: [{ color: '#2c2c2c' }],
    },
    {
      featureType: 'road.local',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 16 }],
    },
    {
      featureType: 'road.local',
      elementType: 'labels.text.fill',
      stylers: [{ color: '#999999' }],
    },
    {
      featureType: 'transit',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 19 }],
    },
    {
      featureType: 'water',
      elementType: 'geometry',
      stylers: [{ color: '#000000' }, { lightness: 17 }],
    },
  ]

  const [_map, setMap] = React.useState(null)

  const onLoad = React.useCallback(function callback(map: any) {
    setMap(map)
  }, [])

  const onUnmount = React.useCallback(function callback() {
    setMap(null)
  }, [])

  return (
    <Card>
      <Card.Body>
        <h4 className="header-title mb-3">Dark</h4>
        <div className="gmaps" style={{ position: 'relative', overflow: 'hidden' }}>
          <LoadScript googleMapsApiKey="AIzaSyAgIfLQi8KTxTJahilcem6qHusV-V6XXjw">
            <GoogleMap
              mapContainerStyle={containerStyle}
              center={center}
              options={{
                styles: mapStyles,
              }}
              zoom={14}
              onLoad={onLoad}
              onUnmount={onUnmount}></GoogleMap>
          </LoadScript>
        </div>
      </Card.Body>
    </Card>
  )
}

const GoogleMaps = () => {
  return (
    <>
      <Row>
        <Col xl={6}>
          <BasicMap />
        </Col>
        <Col xl={6}>
          <MapWithMarker />
        </Col>
      </Row>

      <Row>
        <Col xl={6}>
          <StreetViewMap />
        </Col>
        <Col xl={6}>
          <PolyLineMap />
        </Col>
      </Row>

      <Row>
        <Col xl={6}>
          <UltraLightStyledMap />
        </Col>
        <Col xl={6}>
          <DarkStyledMap />
        </Col>
      </Row>
    </>
  )
}

export default GoogleMaps
// export default GoogleApiWrapper({
//   apiKey: "AIzaSyDsucrEdmswqYrw0f6ej3bf4M4suDeRgNA",
// })(GoogleMaps);
