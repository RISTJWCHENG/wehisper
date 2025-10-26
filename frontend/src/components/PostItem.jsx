import React from 'react'

export default function PostItem({post, onPlay, onLike, onReply}){
  return (
    <div style={{display:'flex',gap:12,padding:10,borderRadius:10,background:'linear-gradient(180deg, rgba(255,255,255,0.01), transparent)'}}>
      <div style={{width:56,height:56,borderRadius:10,background:'linear-gradient(180deg,#334155,#0ea5a8)',display:'grid',placeItems:'center'}}>U</div>
      <div style={{flex:1}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
          <strong>{post.caption || (post.anon? 'Anonymous' : 'Voice')}</strong>
          <small style={{color:'var(--muted)'}}>{new Date(post.ts).toLocaleString()}</small>
        </div>
        <div style={{marginTop:6,color:'var(--muted)'}}>{(post.tags||[]).map(t=>('#'+t+' '))}</div>
        <div style={{marginTop:8,display:'flex',gap:8}}>
          <button onClick={()=>onPlay(post)} style={{padding:'6px 12px',borderRadius:999,background:'linear-gradient(90deg,#06b6d4,#7c3aed)',color:'#fff',border:0}}>Play</button>
          <button onClick={()=>onLike(post)} style={{padding:6,borderRadius:8,background:'none',border:'1px solid rgba(255,255,255,0.06)',color:'var(--muted)'}}>❤ {post.likes||0}</button>
          <button onClick={()=>onReply(post)} className="small">Reply</button>
        </div>
      </div>
    </div>
  )
}
