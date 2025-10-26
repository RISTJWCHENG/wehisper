import React from 'react'
import PostItem from './PostItem'

export default function Feed({posts, onPlay, onLike, onReply}){
  return (
    <div>
      {posts.length===0 && <div style={{color:'var(--muted)'}}>No posts yet — record one!</div>}
      {posts.map(p=> (
        <div key={p.id} style={{marginBottom:10}}>
          <PostItem post={p} onPlay={onPlay} onLike={onLike} onReply={onReply} />
        </div>
      ))}
    </div>
  )
}
