'use client';
import { useState } from 'react';
export default function DemoAdmin(){
  const [auth,setAuth]=useState(false);
  const [pass,setPass]=useState('');
  const [users,setUsers]=useState([]);
  const getSupabase = async () => { try{ const m=await import('../../lib/supabase'); return m.supabase; }catch{ return null; } };
  const login=async()=>{
    if(pass!=='admin123'){ alert('Wrong'); return; }
    setAuth(true);
    const sb=await getSupabase();
    const r=await sb.from('demo_users').select('*').order('id');
    if(r.data) setUsers(r.data);
  };
  const updateBalance=async(id,newBal)=>{
    setUsers(users.map(u=>u.id===id?{...u,balance:newBal}:u));
    const sb=await getSupabase();
    if(sb) await sb.from('demo_users').update({balance:newBal}).eq('id', id);
  };
  if(!auth) return(<div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center'}}><div style={{background:'white', padding:24, borderRadius:12}}><h3>Demo Bank Admin</h3><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="admin123" style={{width:'100%', padding:10, border:'1px solid #ddd', borderRadius:6}}/><button onClick={login} style={{width:'100%', marginTop:10, background:'black', color:'white', padding:10, borderRadius:6, border:0}}>Login</button></div></div>);
  return(
    <div style={{padding:16, background:'#f5f5f7', minHeight:'100vh'}}>
      <h2>Demo Bank Admin - Edit Fake Balances</h2>
      {users.map(u=>(
        <div key={u.id} style={{background:'white', padding:12, borderRadius:10, marginTop:12, display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div><b>{u.username}</b> - Pass: {u.password}<br/>Balance: N{u.balance}</div>
          <div style={{display:'flex', gap:6}}>
            <button onClick={()=>updateBalance(u.id, u.balance+1000)} style={{background:'#dcfce7', border:0, padding:'8px 10px', borderRadius:6}}>+1k</button>
            <button onClick={()=>updateBalance(u.id, u.balance+5000)} style={{background:'#bbf7d0', border:0, padding:'8px 10px', borderRadius:6}}>+5k</button>
            <button onClick={()=>{ const v=prompt('New balance for '+u.username, u.balance); if(v!==null) updateBalance(u.id, Number(v)); }} style={{background:'black', color:'white', border:0, padding:'8px 10px', borderRadius:6}}>Edit</button>
          </div>
        </div>
      ))}
    </div>
  );
}
