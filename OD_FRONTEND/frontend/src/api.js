// All backend calls live here. Vite proxies /api -> http://localhost:8080. In production set the same origin or a base URL.
let token=sessionStorage.getItem('t');
const call=async(p,o={})=>{const h={...(o.body&&!(o.body instanceof FormData)?{'Content-Type':'application/json'}:{}),...(token?{Authorization:'Bearer '+token}:{})};
 const r=await fetch('/api'+p,{...o,headers:h});if(!r.ok){const j=await r.json().catch(()=>({}));throw new Error(j.message||'Request failed')}return r.json()};
const J=b=>JSON.stringify(b);
export const api={
 hasToken:()=>!!token,
 captcha:()=>call('/auth/captcha'),
 otp:netid=>call('/auth/otp',{method:'POST',body:J({netid})}),
 login:async b=>{const r=await call('/auth/login',{method:'POST',body:J(b)});token=r.token;sessionStorage.setItem('t',token);return r.user},
 me:()=>call('/me'),
 profile:fd=>call('/profile',{method:'POST',body:fd}),
 list:()=>call('/requests'),
 create:b=>call('/requests',{method:'POST',body:J(b)}),
 review:(id,action)=>call('/requests/'+id,{method:'PATCH',body:J({action})}),
 logout:()=>{token=null;sessionStorage.clear()}};
