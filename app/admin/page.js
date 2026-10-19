'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const getSupabase = async () => {
    const mod = await import('../lib/supabase');
    return mod.supabase;
  };

  const fetchProducts = async () => {
    setLoading(true);
    try{
      const supabase = await getSupabase();
      if(!supabase){ setMsg("Supabase env missing - check Vercel env vars"); setLoading(false); return; }
      const { data, error } = await supabase.from('products').select('*').order('id', {ascending:false});
      if(error) setMsg(error.message);
      else setProducts(data||[]);
    }catch(e){ setMsg(e.message); }
    setLoading(false);
  };

  const login = () => {
    if(pass==='admin123'){ setAuth(true); setTimeout(fetchProducts, 100); }
    else alert("Password is admin123");
  };

  const addProduct = async () => {
    try{
      const supabase = await getSupabase();
      if(!supabase){ alert("Supabase not connected"); return; }
      const { data, error } = await supabase.from('products').insert([{name:'New Product', price:1000, stock:10, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'', logs:[]}]).select();
      if(error) alert(error.message);
      else setProducts(p=>[data[0], ...p]);
    }catch(e){ alert(e.message); }
  };

  const updateField = async (id, field, value) => {
    setProducts(prev=>prev.map(p=>p.id===id?{...p, [field]:value}:p));
    const supabase = await getSupabase();
    if(supabase) await supabase.from('products').update({[field]:value}).eq('id', id);
  };

  const handleUpload = async (id, file) => {
    if(!file) return;
    try{
      const supabase = await getSupabase();
      if(!supabase){ alert("Supabase not connected"); return; }
      const name = `${id}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('product-images').upload(name, file);
      if(error){ alert(error.message); return; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(name);
      const url = data.publicUrl;
      setProducts(prev=>prev.map(p=>p.id===id?{...p, img:url}:p));
      await supabase.from('products').update({img:url}).eq('id', id);
      alert("Uploaded! Live for everyone");
    }catch(e){ alert(e.message); }
  };

  const deleteProduct = async (id) => {
    if(!confirm("Delete?")) return;
    const supabase = await getSupabase();
    if(supabase) await supabase.from('products').delete().eq('id', id);
    setProducts(prev=>prev.filter(p=>p.id!==id));
  };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin Login</h2>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="admin123" style={{width:'100%', padding:12, marginTop:10, borderRadius:8, border:'1px solid #ddd'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, background:'#f5f5f7', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between'}}><h2>Admin ({products.length})</h2><div style={{display:'flex', gap:8}}><button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:6, fontWeight:800}}>+ Add</button><a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Buyer</a></div></div>
      {msg && <div style={{background:'#fee2e2', color:'#dc2626', padding:10, borderRadius:6, marginTop:10}}>{msg}</div>}
      {loading && <div style={{marginTop:20}}>Loading...</div>}
      {products.map(p=>(
        <div key={p.id} style={{background:'white', padding:16, borderRadius:12, marginTop:16}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><b>{p.name}</b><button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'red', border:0, padding:'6px 10px', borderRadius:4}}>Delete</button></div>
          <input value={p.name} onChange={e=>updateField(p.id,'name',e.target.value)} style={{width:'100%', padding:10, marginTop:10, borderRadius:6, border:'1px solid #ddd'}}/>
          <div style={{background:'#f0fdf4', padding:12, borderRadius:8, border:'2px solid #16a34a', marginTop:12}}>
            <label style={{background:'#16a34a', color:'white', padding:'12px 18px', borderRadius:8, fontWeight:800, cursor:'pointer', display:'inline-block'}}>📷 TAP TO CHOOSE PICTURE<input type="file" accept="image/*" onChange={e=>handleUpload(p.id, e.target.files[0])} style={{display:'none'}}/></label>
            {p.img && <img src={p.img} style={{width:'100%', maxHeight:200, objectFit:'contain', marginTop:10, borderRadius:8}}/>}
          </div>
        </div>
      ))}
    </div>
  );
}
