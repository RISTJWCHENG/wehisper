import React, { useEffect, useState } from 'react'
import Recorder from './components/Recorder'
import Feed from './components/Feed'
import VoiceMap from './components/VoiceMap'

export default function App(){
  const [posts,setPosts] = useState([])

  useEffect(()=>{ // load from localStorage
    try{
      const raw = localStorage.getItem('wehisper_posts_v1')
      setPosts(raw? JSON.parse(raw) : [])
    }catch(e){ setPosts([]) }
  },[])

  function saveAll(list){
    localStorage.setItem('wehisper_posts_v1', JSON.stringify(list))
    setPosts(list)
  }

  function onRecorded({base64,mime,caption,tags,loc,anon}){
    const id = 'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,6)
    const post = { id, caption, tags, loc, anon, ts:Date.now(), likes:0, base64, mime, replies:[] }
    const newList = [post, ...posts]
    saveAll(newList)
  }

  function playPost(p){
    const audio = new Audio('data:'+p.mime+';base64,'+p.base64)
    audio.play()
  }

  function likePost(p){
    const newList = posts.map(item => item.id===p.id? {...item, likes:(item.likes||0)+1} : item)
    saveAll(newList)
  }

  function replyPost(postId, replyObj){
    const newList = posts.map(item => item.id===postId? {...item, replies:[...item.replies, replyObj]}:item)
    saveAll(newList)
  }

  return (
    <div className="app">
      <header>
        <div className="logo">OV</div>
        <div>
          <h1 style={{margin:0}}>Wehisper — OpenVoice Prototype</h1>
          <p style={{margin:'6px 0 0', color:'var(--muted)'}}>Real human voices · 30s max · Local demo</p>
        </div>
      </header>

      <div className="container">
        <aside className="left">
          <Recorder onRecorded={onRecorded} />
        </aside>

        <main>
          <div className="feed" style={{marginBottom:12}}>
            <h2 style={{margin:'6px 0'}}>Live Voice Feed</h2>
            <Feed posts={posts} onPlay={playPost} onLike={likePost} onReply={replyPost} />
          </div>

          <div className="feed">
            <h3 style={{margin:'6px 0'}}>VoiceMap (geotagged)</h3>
            <VoiceMap posts={posts} />
          </div>
        </main>
      </div>
    </div>
  )
}
