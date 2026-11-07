import {useState,useEffect} from 'react';import {api} from './api';
const L={PM:'Pending Mentor',PH:'Pending HOD',APPROVED:'Approved',REJECTED:'Rejected'};
const NAV={student:[['dash','Dashboard'],['new','New OD Request'],['my','My Requests']],mentor:[['dash','Dashboard'],['pend','Pending Reviews']],hod:[['dash','Dashboard'],['pend','Department Requests']]};
const Stat=({l,v})=><div className="card st"><small>{l}</small><b>{v}</b></div>;
const Table=({rows,act,staff})=><div className="bx"><table><thead><tr><th>ID</th><th>Event</th><th>Type</th><th>Dates</th><th>Status</th>{act&&<th/>}</tr></thead><tbody>
 {rows.map(r=><tr key={r.id}><td><b>{r.id}</b>{staff&&<><br/><small>{r.studentName} · {r.dept}</small></>}</td><td>{r.event}</td><td>{r.type}</td><td>{r.fromDate}{r.toDate!==r.fromDate&&' → '+r.toDate}</td>
  <td><span className={'pill '+r.status}>{L[r.status]}</span></td>{act&&<td className="nw"><button className="btn no s" onClick={()=>act(r.id,'reject')}>Reject</button> <button className="btn ok s" onClick={()=>act(r.id,'approve')}>Approve</button></td>}</tr>)}
 {!rows.length&&<tr><td colSpan="6">Nothing here yet.</td></tr>}</tbody></table></div>;
function NewForm({pre,onDone,onErr}){
 const [t,setT]=useState(pre.type||'Event'),[f,setF]=useState({event:pre.event||'',venue:'',description:'',fromDate:'',toDate:''}),s=k=>e=>setF({...f,[k]:e.target.value});
 const [err,setErr]=useState('');
 const go=async()=>{try{await api.create({...f,type:t});onDone()}catch(e){setErr(e.message)}};
 return <div className="card pn"><label className="f0">Select OD Type</label><div className="chips">{['Event','Sports','Workshop','Hackathon','Cultural','Other'].map(x=><button key={x} className={x===t?'on':''} onClick={()=>setT(x)}>{x}</button>)}</div>
  <div className="g2f"><div><label>Event Name</label><input value={f.event} onChange={s('event')} placeholder="e.g., Smart India Hackathon 2026"/></div><div><label>Venue / Location</label><input value={f.venue} onChange={s('venue')} placeholder="e.g., IIT Madras Campus"/></div></div>
  <label>Event Description</label><textarea rows="4" value={f.description} onChange={s('description')} placeholder="Describe the event and your role…"/>
  <div className="g2f"><div><label>From Date</label><input type="date" value={f.fromDate} onChange={s('fromDate')}/></div><div><label>To Date</label><input type="date" value={f.toDate} onChange={s('toDate')}/></div></div>
  <div className="err">{err}</div><button className="btn" onClick={go}>Submit request</button></div>}
export default function Dashboard({user,onLogout,onVerify}){
 const [view,setView]=useState('dash'),[open,setOpen]=useState(false),[rs,setRs]=useState([]),[flt,setFlt]=useState('All'),[pre,setPre]=useState({}),[toast,setToast]=useState('');
 const load=()=>api.list().then(setRs).catch(()=>{});useEffect(()=>{load()},[]);
 const flash=m=>{setToast(m);setTimeout(()=>setToast(''),2000)};
 const act=async(id,a)=>{try{await api.review(id,a);flash(a==='approve'?'Approved':'Rejected');load()}catch(e){flash(e.message)}};
 const q=user.role==='mentor'?'PM':'PH',pend=rs.filter(r=>r.status===q),cnt=s=>rs.filter(r=>r.status===s).length,go=v=>{setView(v);setOpen(false)};
 const title=view!=='dash'?NAV[user.role].find(n=>n[0]===view)[1]:user.role==='student'?'Good morning, '+user.name.split(' ')[0]+' 👋':user.role==='mentor'?'Welcome, '+user.name:'Department Overview';
 let body;
 if(user.role==='student'){
  if(view==='new')body=<NewForm pre={pre} onDone={()=>{setPre({});flash('Request submitted to mentor');load();setView('my')}}/>;
  else if(view==='my')body=<><div className="chips mb">{['All','Pending','Approved','Rejected'].map(x=><button key={x} className={x===flt?'on':''} onClick={()=>setFlt(x)}>{x}</button>)}</div><div className="card pn"><Table rows={rs.filter(r=>flt==='All'||L[r.status].includes(flt))}/></div></>;
  else body=<><div className="gr g4"><Stat l="Total Requests" v={rs.length}/><Stat l="Approved" v={cnt('APPROVED')}/><Stat l="Pending" v={cnt('PM')+cnt('PH')}/><Stat l="Rejected" v={cnt('REJECTED')}/></div>
   <div className="gr g2 mt"><div className="card pn"><h3>Recent Requests</h3><Table rows={rs.slice(0,5)}/></div>
   <div className="card pn"><h3>Upcoming Events</h3>{[['PyCon Campus Meetup','Hackathon'],['Annual Athletic Track Meet','Sports'],['Robo Soccer Exhibition','Event']].map(e=><div className="ev" key={e[0]}><b>{e[0]}</b><button className="btn o s" onClick={()=>{setPre({event:e[0],type:e[1]});setView('new')}}>Apply</button></div>)}
   <button className="btn full" onClick={()=>setView('new')}>+ New OD Request</button></div></div></>;
 }else if(view==='dash'){
  const bars=[['Jul',30],['Aug',48],['Sep',38],['Oct',70],['Nov',58],['Dec',90]];
  body=<><div className="gr g4">{user.role==='mentor'?<><Stat l="Students Assigned" v={156}/><Stat l="Pending Reviews" v={pend.length}/><Stat l="Approved" v={cnt('APPROVED')}/><Stat l="Rejected" v={cnt('REJECTED')}/></>:<><Stat l="Total CSE Students" v={842}/><Stat l="Active OD Requests" v={cnt('PM')+cnt('PH')}/><Stat l="Approval Rate" v="89%"/><Stat l="Pending My Review" v={pend.length}/></>}</div>
   <div className={'gr mt '+(user.role==='hod'?'g2':'')}><div className="card pn"><h3>{user.role==='mentor'?'Pending Reviews':'Pending My Review (HOD Clearance)'}</h3><Table rows={pend} act={act} staff/></div>
   {user.role==='hod'&&<div className="card pn"><h3>Monthly OD Trend</h3><div className="bars">{bars.map(b=><div key={b[0]} style={{height:b[1]+'%'}}><span>{b[0]}</span></div>)}</div></div>}</div></>;
 }else body=<div className="card pn"><h3>{user.role==='hod'?'All department requests':'Requests'}</h3><Table rows={user.role==='hod'?rs:rs.filter(r=>r.status!=='REJECTED')} act={act} staff/></div>;
 return <div className={'sh '+(open?'open':'')}>
  <aside className="sb"><div className="logo"><i>✓</i>ODTrack</div>{NAV[user.role].map(n=><button key={n[0]} className={'nv '+(n[0]===view?'on':'')} onClick={()=>go(n[0])}>{n[1]}</button>)}
   <button className="nv" style={{marginTop:20}} onClick={onLogout}>Sign out</button></aside>
  <div><div className="tb"><button className="hb" aria-label="Menu" onClick={()=>setOpen(!open)}>☰</button><h1>{title}</h1>
   <div className="av">{user.profileDone?<img src={'/api/photo/'+user.netid} alt=""/>:user.name.slice(0,2).toUpperCase()}</div></div>
   <main className="mn">{user.role!=='student'&&!user.profileDone&&<div className="bn">Profile photo & ID not verified. <a onClick={onVerify}>Complete now</a></div>}{body}</main></div>
  {toast&&<div className="toast">{toast}</div>}</div>}
