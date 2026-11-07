import {useState,useEffect} from 'react';import {api} from './api';
import Login from './Login';import Onboard from './Onboard';import Dashboard from './Dashboard';
export default function App(){
 const [user,setUser]=useState(null),[screen,setScreen]=useState('login'),[ready,setReady]=useState(!api.hasToken());
 const enter=u=>{setUser(u);setScreen(u.role==='student'&&!u.profileDone?'onboard':'dash')};
 useEffect(()=>{if(api.hasToken())api.me().then(enter).catch(()=>api.logout()).finally(()=>setReady(true))},[]);
 if(!ready)return null;
 if(!user)return <Login onLogin={enter}/>;
 if(screen==='onboard')return <Onboard user={user} onDone={u=>{setUser(u);setScreen('dash')}} onSkip={user.role!=='student'?()=>setScreen('dash'):null}/>;
 return <Dashboard user={user} onVerify={()=>setScreen('onboard')} onLogout={()=>{api.logout();setUser(null)}}/>;
}
