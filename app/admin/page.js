'use client';
import { useState } from 'react';

export default function Admin(){
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const getSupabase = async () => {
    try{ const m = await import('../lib/supabase'); return m.supabase; }catch{ return null; }
  };

  const login = async () => {
    if(pass.trim() !== 'admin123'){ alert('Wrong password'); return; }
    setAuth(true);
    setLoading(true);
    setMsg('');
    try{
      const sb = await getSupabase();
      if(!sb){ setMsg('Supabase not connected! Add env vars in Vercel Settings'); setLoading(false); return; }
      const r = await sb.from('products').select('*').order('id', {ascending:false});
      if(r.error) setMsg('Supabase error: ' + r.error.message);
      else setProducts(r.data||[]);
    }catch(e){ setMsg('Error: ' + e.message); }
    setLoading(false);
  };

  const addProduct = async () => {
    const sb = await getSupabase();
    if(!sb) return;
    const r = await sb.from('products').insert([{name:'New Product', price:1000, stock:10, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'Logs here', logs:[]}]).select();
    if(r.data && r.data[0]) setProducts([r.data[0], ...products]);
  };

  const update = async (id, field, value) => {
    setProducts(products.map(function(p){ return p.id===id ? {...p, [field]:value} : p; }));
    const sb = await getSupabase();
    if(sb) await sb.from('products').update({[field]:value}).eq('id', id);
  };

  const del = async (id) => {
    if(!confirm('Delete?')) return;
    const sb = await getSupabase();
    if(sb) await sb.from('products').delete().eq('id', id);
    setProducts(products.filter(function(p){ return p.id!==id; }));
  };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', padding:20, fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin Login</h2>
          <p style={{fontSize:12, color:'#666'}}>Password: admin123</p>
          <input type="password" value={pass} onChange={function(e){setPass(e.target.value)}} placeholder="Password" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
          <a href="/" style={{display:'block', textAlign:'center', marginTop:12, fontSize:12}}>Back to Store</a>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, background:'#f5f5f7', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Admin ({products.length})</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:6, fontWeight:800}}>+ Add Product</button>
          <a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Store</a>
        </div>
      </div>
      {msg && <div style={{background:'#fee2e2', padding:12, borderRadius:8, marginTop:12, fontSize:13}}>{msg}</div>}
      {loading && <div style={{marginTop:12, background:'white', padding:12, borderRadius:8}}>Loading...</div>}
      {products.map(function(p){
        if(!p) return null;
        return(
          <div key={p.id} style={{background:'white', padding:16, borderRadius:12, marginTop:16, border:'1px solid #eee'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><b>{p.name}</b><button onClick={function(){del(p.id)}} style={{background:'#fee2e2', border:0, padding:'6px 10px', borderRadius:4}}>Delete</button></div>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:10}}>
              <div><label style={{fontSize:11}}>Name</label><input value={p.name||''} onChange={function(e){update(p.id,'name',e.target.value)}} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd'}}/></div>
              <div><label style={{fontSize:11}}>Price N</label><input type="number" value={p.price||0} onChange={function(e){update(p.id,'price',Number(e.target.value))}} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd'}}/></div>
              <div><label style={{fontSize:11}}>Stock</label><input type="number" value={p.stock||0} onChange={function(e){update(p.id,'stock',Number(e.target.value))}} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd'}}/></div>
              <div><label style={{fontSize:11}}>Type</label><select value={p.type||'digital'} onChange={function(e){update(p.id,'type',e.target.value)}} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd'}}><option value="digital">digital</option><option value="physical">physical</option></select></div>
              <div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11}}>Description</label><textarea value={p.description||''} onChange={function(e){update(p.id,'description',e.target.value)}} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd'}}/></div>
              <div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11}}>Logs (use --- between)</label><textarea value={(p.logs||[]).join('\n---\n')} onChange={function(e){ const logs = e.target.value.split('\n---\n').map(function(s){return s.trim()}).filter(Boolean); setProducts(products.map(function(x){ return x.id===p.id ? {...x, logs:logs, stock:logs.length} : x; })); (async function(){ const sb = await getSupabase(); if(sb) await sb.from('products').update({logs:logs, stock:logs.length}).eq('id', p.id); })(); }} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd', minHeight:80, fontSize:11}}/></div>
            </div>
            <div style={{fontSize:11, marginTop:6, color: (p.logs?.length||p.stock)>0 ? 'green' : 'red', fontWeight:700}}>Available: {p.type==='digital' ? (p.logs?.length||0) : p.stock}</div>
          </div>
        );
      })}
    </div>
  );
}
