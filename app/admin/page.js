'use client';
import { useState } from 'react';
export default function Admin(){
  const [auth,setAuth]=useState(false);
  const [pass,setPass]=useState('');
  const [products,setProducts]=useState([]);
  const [msg,setMsg]=useState('');

  const login = async () => {
    if(pass.trim() !== 'admin123'){ alert('Wrong!'); return; }
    setAuth(true);
    setMsg('Logged in! Trying to load products...');
    try{
      const m = await import('../lib/supabase');
      const sb = m.supabase;
      if(!sb){ setMsg('Supabase not connected! Add env vars in Vercel Settings > Environment Variables'); return; }
      const r = await sb.from('products').select('*');
      if(r.error) setMsg('Supabase error: ' + r.error.message);
      else { setProducts(r.data||[]); setMsg('Loaded ' + (r.data||[]).length + ' products'); }
    }catch(e){ setMsg('Error: ' + e.message); }
  };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', padding:20}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin Login</h2>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password: admin123" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, background:'#f5f5f7', minHeight:'100vh'}}>
      <h2>Admin - Logged In ✅</h2>
      <p>{msg}</p>
      <p>Products: {products.length}</p>
      <a href="/" style={{background:'black', color:'white', padding:'10px', borderRadius:6, textDecoration:'none'}}>Back to Store</a>
      {products.map(p=>(
        <div key={p.id} style={{background:'white', padding:12, marginTop:12, borderRadius:8}}>{p.name} - N{p.price} - Stock: {p.stock}</div>
      ))}
    </div>
  );
}
