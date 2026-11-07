import {useState,useEffect} from 'react';import {api} from './api';
const Logo=()=><svg width="160" height="52" viewBox="0 0 160 52"><circle cx="24" cy="26" r="20" fill="#fff" stroke="#c9a227" strokeWidth="3"/><circle cx="24" cy="26" r="13" fill="#1e3a8a"/><text x="52" y="36" fontFamily="Georgia,serif" fontSize="34" fontWeight="700" fill="#1e3a8a">SRM</text><text x="52" y="47" fontFamily="sans-serif" fontSize="5.5" fill="#1e3a8a">INSTITUTE OF SCIENCE &amp; TECHNOLOGY</text></svg>;
const RL={student:'Student',mentor:'Mentor',hod:'HOD'};
export default function Login({onLogin}){
 const [role,setRole]=useState('student'),[netid,setN]=useState(''),[otp,setO]=useState(''),[ans,setA]=useState(''),[cap,setCap]=useState({}),[err,setErr]=useState(''),[msg,setMsg]=useState('');
 const load=()=>{setA('');api.captcha().then(setCap).catch(()=>setErr('Cannot reach server. Is the backend running on :8080?'))};
 useEffect(load,[]);
 const go=async()=>{setErr('');if(!netid||!otp)return setErr('Enter NetID and OTP.');
  try{onLogin(await api.login({role,netid,otp,captchaId:cap.id,captchaAnswer:ans}))}catch(e){setErr(e.message);load()}};
 return <div className="lw"><div className="login card">
  <div className="lp"><Logo/><h2>Dear Student,</h2><p>Welcome to SRMIST OD TRACK PORTAL.</p>
   <p>You can access this portal to submit on-duty (OD) requests, track approval status from mentors, and view official event activity records.</p>
   <p>SRMIST students can login with NetID credentials (i.e. if your mail ID is abcd@srmist.edu.in, your netid is abcd).</p></div>
  <div className="rp"><div className="pt">Student OD Portal</div><div className="pb">
   <div className="tabs">{Object.keys(RL).map(r=><button key={r} className={r===role?'on':''} onClick={()=>setRole(r)}>{RL[r]}</button>)}</div>
   <label>NetID (without '@srmist.edu.in')</label><input value={netid} onChange={e=>setN(e.target.value)} placeholder="Enter NetID" autoComplete="username"/>
   <label>ENTER YOUR OTP</label><input value={otp} onChange={e=>setO(e.target.value)} placeholder="Enter OTP" inputMode="numeric"/>
   <label>CAPTCHA</label><div className="cap"><img src={cap.image} alt="captcha" width="120" height="44"/><button className="btn o" onClick={load} aria-label="Refresh captcha">↻</button><input value={ans} onChange={e=>setA(e.target.value)} placeholder="Type the code"/></div>
   <div className="row"><label className="rm"><input type="checkbox"/>Remember me</label><a onClick={()=>api.otp(netid).then(()=>setMsg('OTP sent (demo OTP: 123456)'))}>Resend OTP?</a></div>
   <div className="err">{err||msg}</div><button className="btn full" onClick={go}>Sign in as {RL[role]}</button>
  </div></div></div></div>}
