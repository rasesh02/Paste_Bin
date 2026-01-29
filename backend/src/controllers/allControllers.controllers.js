import mongoose from 'mongoose';
import { Paste } from '../models/paste.model.js';
import { app } from '../app.js';


function buildBaseUrl(req) {
  const envBase = process.env.BASE_URL;
  if (envBase && typeof envBase === 'string' && envBase.trim()) return envBase.trim().replace(/\/$/, '');
  const host = req.get('host');
  const proto = (req.get('x-forwarded-proto') || req.protocol || 'http');
  return `${proto}://${host}`;
}

function getNowMillsec(req) {
  const testMode=process.env.TEST_MODE==='1';
  if (testMode){
    const header=req.get('x-test-now-ms');
    if (header){
      const parsed=Number(header);
      if(!Number.isNaN(parsed) && parsed>0) return parsed;
    }
  }
  return Date.now();
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

export const getHealth=(req,res)=>{
    try{
     const ok =mongoose.connection && mongoose.connection.readyState === 1;
      res.status(200).json({ ok });
  }catch(error){
    console.log("Error in getHeathz routes : ",error);
    res.status(500).json({ error: 'internal_error' });
  }
}

export const pasteText=async(req,res)=>{
    try {
        const {content, ttl_seconds, max_views}=req.body || {};
        // Validate content presence correctly: reject non-string or empty-after-trim
        if (typeof content !== 'string' || content.trim().length === 0) {
          return res.status(400).json({ error: 'content must be a non-empty string' });
        }
        let ttl=null;
         if (ttl_seconds !== undefined) {
          if (!Number.isInteger(ttl_seconds) || ttl_seconds < 1) {
           return res.status(400).json({ error: 'ttl_seconds must be an integer ≥ 1' });
        }
        ttl = ttl_seconds;
    }
        let maxViews = null;
        if(max_views!==undefined){
            if(!Number.isInteger(max_views) || max_views<1){
               return res.status(400).json({ error: 'max_views must be an integer ≥ 1' }); 
            }
            maxViews=max_views;
        }
        const nowMillsec=getNowMillsec(req);
        const expiresAt=ttl ? new Date(nowMillsec+ttl*1000) : null;
        
        const newPasteData= await Paste.create({
          content: content,
          maxViews: maxViews,
          views: 0,
          expiresAt,
          createdAt: new Date(nowMillsec),
        })

        const baseUrl=buildBaseUrl(req);
        const url = `${baseUrl}/p/${newPasteData._id}`;
        res.status(200).json({
          id: String(newPasteData._id),
          url 
        })
    } catch (error) {
        console.log("Unable to paste user Text due to error : ",error);
        res.status(500).json({error:"internal_error"});
    }
}

export const getUrl=async(req,res)=>{
    try {
      const {id}=req.params;
      const nowMillsec=getNowMillsec(req);
      const nowDate=new Date(nowMillsec);
      
      const filteredRow={
        $and:[
          {_id:id},
          {$or: [
            {expiresAt: null},
            {expiresAt: {$gt: nowDate}}
          ]},
          {$or:[
            {maxViews: null},
            {$expr:{$lt:['$views','$maxViews']}}
          ]}
        ]
      }
      const updatedRow= await Paste.findOne(filteredRow);
      if(!updatedRow){
      return res.status(404).json({error:"not_found"});
    }
      const remaining= updatedRow.maxViews == null ? null : Math.max(0, updatedRow.maxViews - updatedRow.views);
      const expires = updatedRow.expiresAt ? updatedRow.expiresAt.toISOString() : null;
      res.status(200).json({ content: updatedRow.content, remaining_views: remaining, expires_at: expires });

    } catch (error) {
      console.error('GET /api/pastes/:id error:', error);
      res.status(500).json({ error: 'internal_error' });
    }
}

export const getPaste=async(req,res)=>{
   try {
    const {id} = req.params;
    const nowMs = getNowMillsec(req);
    const nowDate = new Date(nowMs);

    const filter = {
      $and: [
        { _id: id },
        { $or: [ { expiresAt: null }, { expiresAt: { $gt: nowDate } } ] },
        { $or: [ { maxViews: null }, { $expr: { $lt: [ '$views', '$maxViews' ] } } ] },
      ],
    };

    const updatedRow = await Paste.findOne(filter);
    if (!updatedRow) {
      return res.status(404).send('<!doctype html><html><head><meta charset="utf-8"><title>Not Found</title></head><body><h1>Paste Not Found</h1><p>This paste is unavailable.</p></body></html>');
    }

    const safe = escapeHtml(updatedRow.content);
    res.set('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(`<!doctype html>
   <html>
  <head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Paste</title>
  <style>
    body { font-family: system-ui, -apple-system, Segoe UI, Roboto, sans-serif; margin: 2rem; }
    pre { white-space: pre-wrap; word-wrap: break-word; background: #f7f7f7; padding: 1rem; border-radius: 8px; }
  </style>
   </head> 
   <body>
     <h1>Paste</h1>
    <pre>${safe}</pre>
    </body>
     </html>`);
  } catch (err) {
    console.error('GET /p/:id error:', err);
    res.status(500).send('<!doctype html><html><head><meta charset="utf-8"><title>Error</title></head><body><h1>Error</h1><p>Internal server error.</p></body></html>');
  }
}
