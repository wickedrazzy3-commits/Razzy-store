'use client';
import { useState } from 'react';

export default function DemoBank(){
  const [username,setUsername]=useState('');
  const [password,setPassword]=useState('');
  const [user,setUser]=useState(null);
  const [msg,setMsg]=useState('');

  const getSupabase = async () => {
    try{ const m=await import('../lib/supabase'); return m.supabase; }catch{ return null; }
  };

  const login = async () => {
    setMsg('Checking...');
    const sb=await getSupabase();
    if(!sb){ setMsg('Connect Supabase first'); return; }
    const r=await sb.from('demo_users').select('*').eq('username', username.trim()).eq('password', password.trim()).single();
    if(r.error || !r.data){ setMsg('Wrong login!'); return; }
    setUser(r.data);
    setMsg('');
  };

  const refresh = async () => {
    const sb=await getSupabase();
    const r=await sb.from('demo_users').select('*').eq('id', user.id).single();
    if(r.data) setUser(r.data);
  };

  if(!user){
    return(
      <div style={{minHeight:'100vh', background:'#0f172a', display:'flex', alignItems:'center', justifyContent:'center', padding:20, fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:24, borderRadius:16, width:360}}>
          <div style={{textAlign:'center', marginBottom:16}}>
            <h2 style={{margin:0, fontSize:26, letterSpacing:1}}>ZENOBANK</h2>
            <p style={{fontSize:13, color:'#444', marginTop:6}}>login here</p>
          </div>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Username" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:12, boxSizing:'border-box'}}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:8, boxSizing:'border-box'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:16, fontWeight:800}}>Login</button>
          {msg && <div style={{marginTop:10, fontSize:12, color:'red', textAlign:'center'}}>{msg}</div>}
          <div style={{marginTop:14, fontSize:10, color:'#888', textAlign:'center'}}>Zenobank simulation</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:'100vh', background:'#f1f5f9', padding:16, fontFamily:'sans-serif'}}>
      <div style={{background:'white', padding:20, borderRadius:16, marginTop:12}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <div><h3 style={{margin:0}}>ZENOBANK</h3><b>Hi, {user.username}</b><br/><span style={{fontSize:11, color:'#666'}}>Account #{user.id}</span></div>
          <button onClick={()=>setUser(null)} style={{background:'#eee', border:0, padding:'8px 12px', borderRadius:6}}>Logout</button>
        </div>
        <div style={{marginTop:16, background:'#0f172a', color:'white', padding:16, borderRadius:12}}>
          <div style={{fontSize:12, opacity:0.7}}>BALANCE</div>
          <div style={{fontSize:28, fontWeight:800}}>${user.balance?.toLocaleString()}</div>
        </div>
        <button onClick={refresh} style={{width:'100%', marginTop:12, padding:10, borderRadius:8, border:'1px solid #ddd', background:'white'}}>Refresh</button>
      </div>
    </div>
  );
}
