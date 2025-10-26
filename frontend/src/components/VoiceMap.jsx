import React from 'react'
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

// Note: leaflet requires proper CSS and marker icons in some builds.
// This is a minimal example for demo.

export default function VoiceMap({posts}){
  const geos = posts.filter(p=>p.loc)
  const center = geos.length? [geos[0].loc.lat, geos[0].loc.lon] : [20,0]
  return (
    <div style={{height:320}}>
      <MapContainer center={center} zoom={2} style={{height:'100%', width:'100%'}}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {geos.map(p=>(
          <Marker key={p.id} position={[p.loc.lat, p.loc.lon]}>
            <Popup>
              <div style={{width:220}}>
                <strong>{p.caption||'Voice'}</strong>
                <div style={{marginTop:6}}>
                  <button onClick={()=>{ const a=new Audio('data:'+p.mime+';base64,'+p.base64); a.play() }}>Play</button>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  )
}
