import {useState,useRef,useEffect} from 'react';import {analyze} from './ml';import {api} from './api';
const Rep=({r})=>r&&<div className="chk">{r.checks.map((c,i)=><div key={i} className={c[1]?'p':'f'}>{c[1]?'✔':'✖'} {c[0]}</div>)}{!r.ok&&<div className="f">Retake in better light and hold steady.</div>}</div>;
export default function Onboard({onDone,onSkip}){
 const [p,setP]=useState({}),[d,setD]=useState({}),[dt,setDt]=useState(''),[cam,setCam]=useState(null),[live,setLive]=useState([]),[busy,setBusy]=useState(false),[err,setErr]=useState('');
 const vid=useRef(),file=useRef(),tgt=useRef(),stream=useRef(),kind=k=>k==='p'?'face':'doc';
 const set=async(k,blob,url,src)=>{const r=await analyze(src,kind(k));(k==='p'?setP:setD)({blob,url,r})};
 const onFile=e=>{const f=e.target.files[0];e.target.value='';if(!f)return;if(f.size>2e6)return setErr('File must be under 2MB');
  const u=URL.createObjectURL(f),im=new Image();im.onload=()=>set(tgt.current,f,u,im);im.src=u};
 const pick=k=>{tgt.current=k;file.current.click()};
 const start=async k=>{try{stream.current=await navigator.mediaDevices.getUserMedia({video:{facingMode:k==='p'?'user':'environment'}});setCam(k)}catch{setErr('Camera unavailable. Allow access or upload a file.')}};
 useEffect(()=>{if(!cam)return;const v=vid.current;v.srcObject=stream.current;
  const t=setInterval(async()=>{if(v.videoWidth)setLive((await analyze(v,kind(cam))).checks)},700);return()=>clearInterval(t)},[cam]);
 const stop=()=>{stream.current?.getTracks().forEach(t=>t.stop());setCam(null)};
 const snap=()=>{const v=vid.current,c=document.createElement('canvas');c.width=v.videoWidth;c.height=v.videoHeight;c.getContext('2d').drawImage(v,0,0);const k=cam;
  c.toBlob(b=>{set(k,b,URL.createObjectURL(b),c);stop()},'image/jpeg',.85)};
 const ok=p.r?.ok&&d.r?.ok&&dt;
 const submit=async()=>{setBusy(true);setErr('');try{const fd=new FormData();fd.append('photo',p.blob);fd.append('document',d.blob);fd.append('docType',dt);onDone(await api.profile(fd))}catch(e){setErr(e.message)}setBusy(false)};
const Slot=({k,s,t})=>s.url?<><img className="pv" src={s.url} alt=""/><button className="btn o full" onClick={()=>(k==='p'?setP:setD)({})}>Remove</button></>:<div className="drop" onClick={()=>pick(k)}>{t}</div>;
 return <div className="lw"><div className="ob card">
  <div style={{textAlign:'center'}}><div style={{fontSize:34}}>📋</div><h2>Complete your Profile</h2><div className="mut">Upload your photo and identity document to get started</div></div>
  <div className="stp"><span className="on">① Photo</span><span className={p.url?'on':''}>② Document</span><span className={ok?'on':''}>③ Submit</span></div>
  <label>PASSPORT-SIZE PHOTO</label><Slot k="p" s={p} t="📷 Drop your photo here or click to browse (JPG, PNG, max 2MB)"/><Rep r={p.r}/>
  <button className="btn o full" onClick={()=>start('p')}>📹 {p.url?'Retake with':'Use'} camera</button>
  <label>IDENTITY DOCUMENT</label>
  <select value={dt} onChange={e=>setDt(e.target.value)}><option value="">Select document type...</option>{['College ID card','Aadhaar','Passport','Driving licence'].map(t=><option key={t}>{t}</option>)}</select>
  <div style={{marginTop:10}}><Slot k="d" s={d} t="Click to attach document (JPG/PNG)"/></div><Rep r={d.r}/>
  <button className="btn o full" onClick={()=>start('d')}>📹 Scan document with camera</button>
  {cam&&<div><video ref={vid} autoPlay playsInline muted/><div className="chk">{live.map((c,i)=><div key={i} className={c[1]?'p':'f'}>{c[1]?'✔':'✖'} {c[0]}</div>)}</div>
   <div style={{display:'flex',gap:8}}><button className="btn full" onClick={snap}>Capture</button><button className="btn o" onClick={stop}>Cancel</button></div></div>}
  <input ref={file} type="file" accept="image/*" hidden onChange={onFile}/>
  <div className="err">{err}</div>
  <button className="btn full" disabled={!ok||busy} onClick={submit}>{busy?'Uploading…':'Submit & open dashboard'}</button>
  {onSkip&&<button className="btn o full" style={{marginTop:10}} onClick={onSkip}>Skip for now</button>}
 </div></div>}
