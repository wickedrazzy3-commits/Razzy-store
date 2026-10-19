'use client';
import { useState } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const getSupabase = async () => {
    try{
      const mod = await import('../lib/supabase');
      return mod.supabase || null;
    }catch(e){ return null; }
  };

  const fetchProducts = async () => {
    setLoading(true);
    setMsg('');
    try{
      const supabase = await getSupabase();
      if(!supabase){
        setMsg("Supabase not connected! Go to Vercel > Settings > Env Vars and add NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY, then Redeploy");
        setLoading(false);
        return;
      }
      const result = await supabase.from('products').select('*').order('id', {ascending:false});
      if(result.error){
        setMsg("Supabase error: " + result.error.message);
      } else {
        setProducts(result.data || []);
      }
    }catch(e){
      setMsg("Error: " + (e.message || String(e)));
    }
    setLoading(false);
  };

  const login = async () => {
    if(pass.trim() === 'admin123'){
      setAuth(true);
      setTimeout(()=>{ fetchProducts(); }, 200);
    } else {
      alert("Wrong! Password is admin123");
    }
  };

  const addProduct = async () => {
    try{
      const supabase = await getSupabase();
      if(!supabase){ alert("Supabase not connected"); return; }
      const { data, error } = await supabase.from('products').insert([{name:'New Product', price:1000, stock:10, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'', logs:[]}]).select();
      if(error){ alert(error.message); return; }
      if(data && data[0]) setProducts(p=>[data[0], ...p]);
    }catch(e){ alert(e.message); }
  };

  const updateField = async (id, field, value) => {
    try{
      setProducts(prev=>prev.map(p=> p && p.id===id ? {...p, [field]:value} : p));
      const supabase = await getSupabase();
      if(supabase) await supabase.from('products').update({[field]:value}).eq('id', id);
    }catch{}
  };

  const handleUpload = async (id, file) => {
    if(!file) return;
    try{
      const supabase = await getSupabase();
      if(!supabase){ alert("Supabase not connected"); return; }
      const name = `${id}_${Date.now()}_${file.name}`.replace(/\s/g,'_');
      const { error } = await supabase.storage.from('product-images').upload(name, file);
      if(error){ alert("Upload failed: "+error.message); return; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(name);
      const url = data.publicUrl;
      setProducts(prev=>prev.map(p=> p.id===id ? {...p, img:url} : p));
      await supabase.from('products').update({img:url}).eq('id', id);
      alert("Image uploaded! LIVE for everyone");
    }catch(e){ alert(e.message); }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Delete this product?")) return;
    try{
      const supabase = await getSupabase();
      if(supabase) await supabase.from('products').delete().eq('id', id);
      setProducts(prev=>prev.filter(p=> p && p.id!==id));
    }catch{}
  };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', padding:20}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin Login</h2>
          <p style={{fontSize:12, color:'#666'}}>Password: admin123</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter password" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, background:'#f5f5f7', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <h2>Admin ({products.length})</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:6, fontWeight:800}}>+ Add</button>
          <a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Buyer</a>
        </div>
      </div>

      {msg && <div style={{background:'#fee2e2', color:'#b91c1c', padding:12, borderRadius:8, marginTop:12, fontSize:13, whiteSpace:'pre-wrap'}}>{msg}</div>}
      {loading && <div style={{marginTop:20, background:'white', padding:12, borderRadius:8}}>Loading products from Supabase...</div>}
      
      {!loading && products.length===0 && !msg && <div style={{marginTop:20, background:'white', padding:12, borderRadius:8}}>No products yet. Click + Add</div>}

      {products.map(p=>{
        if(!p) return null;
        return(
          <div key={p.id} style={{background:'white', borderRadius:12, padding:16, marginTop:16, border:'1px solid #eee'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:14}}>{p.name || 'Unnamed'} - Available: {p.type==='digital' ? (p.logs?.length||0) : (p.stock||0)}</b><button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'6px 10px', borderRadius:4}}>Delete</button></div>
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
              <div><label style={{fontSize:11, fontWeight:700}}>Name</label><input value={p.name||''} onChange={e=>updateField(p.id,'name',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4, boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11, fontWeight:700}}>Price ₦</label><input type="number" value={p.price||0} onChange={e=>updateField(p.id,'price', Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4, boxSizing:'border-box'}}/></div>
              
              <div style={{gridColumn:'1 / -1', background:'#f0fdf4', padding:12, borderRadius:8, border:'2px solid #16a34a'}}>
                <label style={{fontSize:12, fontWeight:800, color:'#16a34a'}}>📷 UPLOAD PICTURE (From Phone - Shows for everyone)</label><br/>
                <label style={{background:'#16a34a', color:'white', padding:'12px 18px', borderRadius:8, fontWeight:800, cursor:'pointer', display:'inline-block', marginTop:8}}>TAP TO CHOOSE PICTURE<input type="file" accept="image/*" onChange={e=>handleUpload(p.id, e.target.files?.[0])} style={{display:'none'}}/></label>
                {p.img && <img src={p.img} style={{width:'100%', maxHeight:200, objectFit:'contain', marginTop:10, borderRadius:8, border:'1px solid #ddd'}} alt=""/>}
              </div>

              <div><label style={{fontSize:11, fontWeight:700}}>Type</label><select value={p.type||'digital'} onChange={e=>updateField(p.id,'type',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4}}><option value="digital">digital</option><option value="physical">physical</option></select></div>
              <div><label style={{fontSize:11, fontWeight:700}}>Stock (for physical)</label><input type="number" value={p.stock||0} onChange={e=>updateField(p.id,'stock', Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4, boxSizing:'border-box'}}/></div>

              <div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11, fontWeight:700}}>Description</label><textarea value={p.description||''} onChange={e=>updateField(p.id,'description',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:60, marginTop:4, boxSizing:'border-box'}}/></div>
              <div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11, fontWeight:700}}>Logs (separate with --- ) - Available = number of logs</label><textarea value={(p.logs||[]).join('\n---\n')} onChange={e=>{ const logs = e.target.value.split('\n---\n').map(s=>s.trim()).filter(Boolean); const stock = logs.length; setProducts(prev=>prev.map(x=> x.id===p.id ? {...x, logs, stock} : x)); (async()=>{ const sb = await getSupabase(); if(sb) await sb.from('products').update({logs, stock}).eq('id', p.id); })(); }} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:100, fontFamily:'monospace', fontSize:11, marginTop:4, boxSizing:'border-box'}}/></div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
