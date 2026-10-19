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
      if(!supabase){ setMsg("Supabase not connected - check Vercel ENV"); setLoading(false); return; }
      const { data, error } = await supabase.from('products').select('*').order('id', {ascending:false});
      if(error) setMsg(error.message);
      else setProducts(data||[]);
    }catch(e){ setMsg(e.message); }
    setLoading(false);
  };

  useEffect(()=>{ if(auth) fetchProducts(); },[auth]);

  const login = () => {
    if(pass==='admin123'){ setAuth(true); }
    else alert("Password is admin123");
  };

  const addProduct = async () => {
    try{
      const supabase = await getSupabase();
      const { data, error } = await supabase.from('products').insert([{name:'New Product', price:1000, stock:10, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'Best quality logs', logs:[]}]).select();
      if(error) alert(error.message);
      else setProducts(p=>[data[0], ...p]);
    }catch(e){ alert(e.message); }
  };

  const updateField = async (id, field, value) => {
    setProducts(prev=>prev.map(p=>p.id===id?{...p, [field]:value}:p));
    const supabase = await getSupabase();
    if(supabase) await supabase.from('products').update({[field]:value}).eq('id', id);
  };

  const updateLogs = async (id, text) => {
    const logs = text.split('\n---\n').map(s=>s.trim()).filter(Boolean);
    const stock = logs.length;
    setProducts(prev=>prev.map(p=>p.id===id?{...p, logs, stock}:p));
    const supabase = await getSupabase();
    if(supabase) await supabase.from('products').update({logs, stock}).eq('id', id);
  };

  const handleUpload = async (id, file) => {
    if(!file) return;
    try{
      const supabase = await getSupabase();
      if(!supabase){ alert("Supabase not connected"); return; }
      const name = `${id}_${Date.now()}_${file.name}`;
      const { error } = await supabase.storage.from('product-images').upload(name, file);
      if(error){ alert("Upload failed: "+error.message); return; }
      const { data } = supabase.storage.from('product-images').getPublicUrl(name);
      const url = data.publicUrl;
      setProducts(prev=>prev.map(p=>p.id===id?{...p, img:url}:p));
      await supabase.from('products').update({img:url}).eq('id', id);
      alert("Image LIVE for everyone!");
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
          <h2>Admin Login</h2><p style={{fontSize:12, color:'#666'}}>Password: admin123</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Enter password" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, background:'#f5f5f7', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <h2>Admin - All Features ({products.length})</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:6, fontWeight:800}}>+ Add Item</button>
          <a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Buyer Site</a>
        </div>
      </div>
      {msg && <div style={{background:'#fee2e2', color:'#dc2626', padding:10, borderRadius:6, marginTop:10}}>{msg}</div>}
      {loading && <div style={{marginTop:20}}>Loading products...</div>}

      {products.map(p=>(
        <div key={p.id} style={{background:'white', borderRadius:12, padding:16, marginTop:16, border:'1px solid #eee'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><b>{p.name} - Available: {p.type==='digital'? (p.logs?.length||0) : p.stock}</b><button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'6px 10px', borderRadius:4}}>Delete</button></div>
          
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
            <div><label style={{fontSize:11, fontWeight:700}}>Name</label><input value={p.name} onChange={e=>updateField(p.id,'name',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>
            <div><label style={{fontSize:11, fontWeight:700}}>Price ₦</label><input type="number" value={p.price} onChange={e=>updateField(p.id,'price',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>

            <div style={{gridColumn:'1 / -1', background:'#f0fdf4', padding:14, borderRadius:10, border:'2px solid #16a34a'}}>
              <label style={{fontSize:13, fontWeight:800, color:'#16a34a'}}>📱 UPLOAD PICTURE FROM PHONE - Shows for everyone</label><br/>
              <label style={{background:'#16a34a', color:'white', padding:'14px 20px', borderRadius:8, fontWeight:800, cursor:'pointer', display:'inline-block', marginTop:10}}>📷 TAP TO CHOOSE PICTURE<input type="file" accept="image/*" onChange={e=>handleUpload(p.id, e.target.files[0])} style={{display:'none'}}/></label>
              {p.img && <img src={p.img} style={{width:'100%', maxHeight:220, objectFit:'contain', marginTop:12, borderRadius:8, border:'1px solid #ddd'}}/>}
            </div>

            <div><label style={{fontSize:11, fontWeight:700}}>Type</label><select value={p.type} onChange={e=>updateField(p.id,'type',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4}}><option value="digital">digital</option><option value="physical">physical</option></select></div>
            {p.type==='physical' && <div><label style={{fontSize:11, fontWeight:700}}>Stock Quantity (Number)</label><input type="number" value={p.stock} onChange={e=>updateField(p.id,'stock',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4}}/></div>}

            <div style={{gridColumn:'1 / -1', background:'#fff7ed', padding:12, borderRadius:8, border:'1px solid #fed7aa'}}>
              <label style={{fontSize:12, fontWeight:800, color:'#ea580c'}}>★ DESCRIPTION - What customer sees</label>
              <textarea value={p.description||''} onChange={e=>updateField(p.id,'description',e.target.value)} style={{width:'100%', padding:12, borderRadius:6, border:'1px solid #ea580c', minHeight:90, marginTop:6, boxSizing:'border-box'}} placeholder="Write details..."/>
            </div>

            {p.type==='digital' && (
              <div style={{gridColumn:'1 / -1'}}>
                <label style={{fontSize:11, fontWeight:700}}>Logs - Separate each log with --- on new line | Available = count of logs</label>
                <textarea value={(p.logs||[]).join('\n---\n')} onChange={e=>updateLogs(p.id, e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:140, fontFamily:'monospace', fontSize:11, marginTop:4, boxSizing:'border-box'}} placeholder="log1&#10;---&#10;log2"/>
                <div style={{fontSize:11, color:'green', marginTop:4, fontWeight:700}}>Available: {(p.logs||[]).length} logs</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
