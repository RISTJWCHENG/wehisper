import React, { useEffect, useRef } from 'react'

export default function Waveform({stream}){
  const canvasRef = useRef(null)
  useEffect(()=>{
    if(!stream) return
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)()
    const src = audioCtx.createMediaStreamSource(stream)
    const analyser = audioCtx.createAnalyser()
    analyser.fftSize = 2048
    src.connect(analyser)
    const bufferLength = analyser.fftSize
    const dataArray = new Uint8Array(bufferLength)
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let raf
    function draw(){
      raf = requestAnimationFrame(draw)
      analyser.getByteTimeDomainData(dataArray)
      ctx.clearRect(0,0,canvas.width,canvas.height)
      ctx.beginPath()
      const slice = canvas.width / bufferLength
      let x = 0
      for(let i=0;i<bufferLength;i++){
        const v = dataArray[i]/128.0
        const y = v * canvas.height/2
        if(i===0) ctx.moveTo(x,y) else ctx.lineTo(x,y)
        x += slice
      }
      ctx.strokeStyle = 'rgba(255,255,255,0.9)'
      ctx.stroke()
    }
    draw()
    return ()=>{ cancelAnimationFrame(raf); audioCtx.close() }
  },[stream])
  return <canvas ref={canvasRef} width={600} height={48} style={{width:'100%',height:48, borderRadius:8, background:'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)'}} />
}
