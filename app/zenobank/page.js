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
    if(r.error || !r.data){ setMsg('Wrong test login! Try player1 / demo123'); return; }
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
          <div style={{background:'#fde047', padding:8, borderRadius:8, textAlign:'center', fontWeight:800, fontSize:12, marginBottom:12}}>⚠️ DEMO ONLY - NOT A REAL BANK - FAKE MONEY</div>
          <h2 style={{margin:0}}>Razzy Demo Bank</h2>
          <p style={{fontSize:12, color:'#666'}}>Login with test accounts only</p>
          <p style={{fontSize:11, background:'#f1f5f9', padding:8, borderRadius:6}}>Try: player1 / demo123<br/>player2 / demo123<br/>player3 / demo123</p>
          <input value={username} onChange={e=>setUsername(e.target.value)} placeholder="Test username" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:12, boxSizing:'border-box'}}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Test password" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:8, boxSizing:'border-box'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login to Demo</button>
          {msg && <div style={{marginTop:10, fontSize:12, color:'red', textAlign:'center'}}>{msg}</div>}
        </div>
      </div>
    );
  }

  return(
    <div style={{minHeight:'100vh', background:'#f1f5f9', padding:16, fontFamily:'sans-serif'}}>
      <div style={{background:'#fde047', padding:8, borderRadius:8, textAlign:'center', fontWeight:800, fontSize:12}}>DEMO BANK - FAKE MONEY ONLY</div>
      <div style={{background:'white', padding:20, borderRadius:16, marginTop:12}}>
        <div style={{display:'flex', justifyContent:'space-between'}}>
          <div><b>Hi, {user.username}</b><br/><span style={{fontSize:11, color:'#666'}}>Test Account #{user.id}</span></div>
          <button onClick={()=>setUser(null)} style={{background:'#eee', border:0, padding:'8px 12px', borderRadius:6}}>Logout</button>
        </div>
        <div style={{marginTop:16, background:'#0f172a', color:'white', padding:16, borderRadius:12}}>
          <div style={{fontSize:12, opacity:0.7}}>FAKE BALANCE</div>
          <div style={{fontSize:28, fontWeight:800}}>₦{user.balance?.toLocaleString()}</div>
        </div>
        <button onClick={refresh} style={{width:'100%', marginTop:12, padding:10, borderRadius:8, border:'1px solid #ddd', background:'white'}}>Refresh Balance</button>
        <div style={{marginTop:16, fontSize:11, color:'#666', textAlign:'center'}}>This is a simulation. No real money. You cannot transfer to real banks.</div>
      </div>
    </div>
  );
}
