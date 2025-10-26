import React, { useRef, useState } from 'react'
import Waveform from './Waveform'

export default function Recorder({onRecorded, maxSec=30}){
  const [recording, setRecording] = useState(false)
  const [seconds, setSeconds] = useState(0)
  const [caption, setCaption] = useState('')
  const [includeLoc, setIncludeLoc] = useState(false)
  const [anon, setAnon] = useState(false)
  const mediaRef = useRef(null)
  const chunksRef = useRef([])
  const startRef = useRef(0)
  const streamRef = useRef(null)

  async function start(){
    try{
      const stream = await navigator.mediaDevices.getUserMedia({audio:true})
      streamRef.current = stream
      const mr = new MediaRecorder(stream)
      mediaRef.current = mr
      chunksRef.current = []
      mr.ondataavailable = e => { if(e.data.size) chunksRef.current.push(e.data) }
      mr.start()
      setRecording(true); startRef.current = Date.now(); tick()
    }catch(e){
      alert('Microphone access required.')
    }
  }

  function tick(){
    if(!recording) return
    const s = Math.floor((Date.now()-startRef.current)/1000)
    setSeconds(s)
    if(s>=maxSec) stop()
    else requestAnimationFrame(tick)
  }

  function stop(){
    if(mediaRef.current && mediaRef.current.state !== 'inactive') mediaRef.current.stop()
    setRecording(false); setSeconds(0)
    // convert to base64 and call onRecorded
    const blob = new Blob(chunksRef.current, { type:'audio/webm' })
    const reader = new FileReader()
    reader.onload = () => {
      const base64 = reader.result.split(',')[1]
      // optional: get geolocation
      if(includeLoc && navigator.geolocation){
        navigator.geolocation.getCurrentPosition(pos=>{
          const loc = {lat: pos.coords.latitude, lon: pos.coords.longitude}
          onRecorded({ base64, mime: blob.type, caption, tags: extractTags(caption), loc, anon })
        }, ()=> onRecorded({ base64, mime: blob.type, caption, tags: extractTags(caption), loc:null, anon }))
      } else {
        onRecorded({ base64, mime: blob.type, caption, tags: extractTags(caption), loc:null, anon })
      }
    }
    reader.readAsDataURL(blob)
  }

  function extractTags(text){
    return (text||'').split(/\s+/).filter(t=>t.startsWith('#')).map(t=>t.replace('#',''))
  }

  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
        <div>
          <div style={{fontSize:13,color:'var(--muted)'}}>Record a 30s voice</div>
          <div style={{fontSize:12,color:'var(--muted)'}}>Real people only — no AI voices</div>
        </div>
        <div style={{fontSize:13,color:'var(--muted)'}}>Profile: Guest</div>
      </div>

      <div style={{display:'flex',gap:12,alignItems:'center',marginTop:12}}>
        <button onClick={()=> recording? stop(): start()} style={{width:88,height:88,borderRadius:44,background:'linear-gradient(180deg,#ff715b,#ff8f6b)',color:'#fff',border:0}}>
          {recording? 'Stop' : 'Rec'}
        </button>
        <div>
          <div style={{fontSize:18}}>{String(Math.floor(seconds/60)).padStart(2,'0')}:{String(seconds%60).padStart(2,'0')}</div>
          <div style={{color:'var(--muted)',marginTop:6}}>Max 30s</div>
        </div>
      </div>

      <div style={{marginTop:12}}>
        <input placeholder="Add a caption (optional)" value={caption} onChange={e=>setCaption(e.target.value)} style={{width:'100%',padding:8,borderRadius:8}} />
        <div style={{display:'flex',gap:8,marginTop:8,alignItems:'center'}}>
          <label style={{color:'var(--muted)'}}><input type="checkbox" checked={includeLoc} onChange={e=>setIncludeLoc(e.target.checked)} /> Include location</label>
          <label style={{color:'var(--muted)'}}><input type="checkbox" checked={anon} onChange={e=>setAnon(e.target.checked)} /> Post anonymously</label>
        </div>
      </div>

      {/* Simple waveform (live only while recording) */}
      <div style={{marginTop:10}}>
        {recording && <Waveform stream={streamRef.current} />}
      </div>
    </div>
  )
}
