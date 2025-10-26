require('dotenv').config()
const express = require('express')
const multer = require('multer')
const AWS = require('aws-sdk')
const knex = require('knex')({
  client: 'sqlite3',
  connection: { filename: './data.db' },
  useNullAsDefault: true
})

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 6*1024*1024 } })
const app = express()
app.use(express.json())

// init DB
;(async ()=>{
  const exists = await knex.schema.hasTable('posts')
  if(!exists){
    await knex.schema.createTable('posts', t=>{
      t.string('id').primary()
      t.string('caption')
      t.string('tags')
      t.integer('ts')
      t.integer('likes').defaultTo(0)
      t.string('s3key')
      t.string('mime')
      t.float('lat'); t.float('lon')
    })
  }
})()

// configure S3 if provided
const s3 = new AWS.S3({
  accessKeyId: process.env.S3_KEY,
  secretAccessKey: process.env.S3_SECRET,
  endpoint: process.env.S3_ENDPOINT || undefined,
  s3ForcePathStyle: !!process.env.S3_ENDPOINT
})

// POST /upload - form-data: file, caption, tags, lat, lon
app.post('/upload', upload.single('file'), async (req,res)=>{
  try{
    if(!req.file) return res.status(400).json({error:'file required'})
    const id = 'p_'+Date.now()+'_'+Math.random().toString(36).slice(2,6)
    const s3key = `voices/${id}.webm`
    if(process.env.S3_BUCKET){
      await s3.putObject({ Bucket: process.env.S3_BUCKET, Key: s3key, Body: req.file.buffer, ContentType: req.file.mimetype }).promise()
    } else {
      // fallback: save to local disk (dev only)
      const fs = require('fs')
      const path = require('path')
      const dir = path.join(__dirname, 'uploads')
      if(!fs.existsSync(dir)) fs.mkdirSync(dir)
      fs.writeFileSync(path.join(dir, `${id}.webm`), req.file.buffer)
    }
    await knex('posts').insert({
      id, caption: req.body.caption||'', tags: req.body.tags||'', ts: Date.now(), s3key, mime: req.file.mimetype,
      lat: req.body.lat||null, lon: req.body.lon||null
    })
    res.json({ok:true, id})
  }catch(e){
    console.error(e); res.status(500).json({error:'upload_failed'})
  }
})

// GET /posts - list latest
app.get('/posts', async (req,res)=>{
  try{
    const rows = await knex('posts').orderBy('ts','desc').limit(200)
    const result = await Promise.all(rows.map(async r=>{
      let url = null
      if(process.env.S3_BUCKET){
        url = s3.getSignedUrl('getObject', { Bucket: process.env.S3_BUCKET, Key: r.s3key, Expires: 60*60 })
      } else {
        url = `/uploads/${r.s3key.split('/').pop()}`
      }
      return { id: r.id, caption: r.caption, tags: r.tags, ts: r.ts, likes: r.likes, audioUrl: url, mime: r.mime, loc: r.lat? {lat:r.lat,lon:r.lon}: null }
    }))
    res.json(result)
  }catch(e){ console.error(e); res.status(500).json({error:'list_failed'}) }
})

app.post('/like/:id', async (req,res)=>{
  try{ await knex('posts').where('id',req.params.id).increment('likes',1); res.json({ok:true}) }
  catch(e){ res.status(500).json({error:'fail'}) }
})

const PORT = process.env.PORT || 4000
app.listen(PORT, ()=> console.log('backend listening on', PORT))
