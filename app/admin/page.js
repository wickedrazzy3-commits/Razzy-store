'use client';
import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(()=>{ fetchProducts(); },[]);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', {ascending:false});
    if(!error && data) setProducts(data);
    setLoading(false);
  };

  const login = () => { if(pass==='admin123') setAuth(true); else alert("Use admin123"); };

  const updateField = async (id, field, value) => {
    setProducts(prev=>prev.map(p=>p.id===id?{...p, [field]: value}:p));
    await supabase.from('products').update({[field]: value}).eq('id', id);
  };

  const updateLogs = async (id, text) => {
    const logs = text.split('\n---\n').map(s=>s.trim()).filter(Boolean);
    const stock = logs.length;
    setProducts(prev=>prev.map(p=>p.id===id?{...p, logs, stock}:p));
    await supabase.from('products').update({logs, stock}).eq('id', id);
  };

  const handlePhoneUpload = async (id, file) => {
    if(!file) return;
    if(file.size > 5*1024*1024){ alert("Too big! Use under 5MB"); return; }
    const fileName = `${id}_${Date.now()}_${file.name}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(fileName, file);
    if(uploadError){ alert("Upload failed: "+uploadError.message); return; }
    const { data } = supabase.storage.from('product-images').getPublicUrl(fileName);
    const publicUrl = data.publicUrl;
    setProducts(prev=>prev.map(p=>p.id===id?{...p, img: publicUrl}:p));
    await supabase.from('products').update({img: publicUrl}).eq('id', id);
    alert("Image uploaded!");
  };

  const addProduct = async () => {
    const newP = {id: Date.now(), name:'New Product', price:1000, stock:10, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'', logs:[]};
    const { error } = await supabase.from('products').insert([newP]);
    if(!error) setProducts(prev=>[newP,...prev]);
    else alert(error.message);
  };

  const deleteProduct = async (id) => {
    if(!confirm("Delete?")) return;
    await supabase.from('products').delete().eq('id', id);
    setProducts(prev=>prev.filter(p=>p.id!==id));
  };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin</h2>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="admin123" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box', marginTop:8}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
        </div>
      </div>
    );
  }

  if(loading) return <div style={{padding:20}}>Loading products from Supabase...</div>;

  return(
    <div style={{padding:16, fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h2>Admin ({products.length})</h2><div style={{display:'flex', gap:8}}><button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:6, fontWeight:800}}> + Add Item</button><a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Buyer Site</a></div></div>
      {products.map(p=>(
        <div key={p.id} style={{background:'white', borderRadius:12, padding:16, marginTop:16, border:'1px solid #eee'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><b>{p.name} - Available: {p.type==='digital'? (p.logs?.length||0) : p.stock}</b><button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'6px 10px', borderRadius:4}}>Delete</button></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
            <div><label style={{fontSize:11, fontWeight:700}}>Name</label><input value={p.name} onChange={e=>updateField(p.id,'name',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>
            <div><label style={{fontSize:11, fontWeight:700}}>Price ₦</label><input type="number" value={p.price} onChange={e=>updateField(p.id,'price',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>
            <div style={{gridColumn:'1 / -1', background:'#f0fdf4', padding:14, borderRadius:10, border:'2px solid #16a34a'}}>
              <label style={{fontSize:13, fontWeight:800, color:'#16a34a', display:'block'}}>📱 UPLOAD PICTURE FROM YOUR PHONE</label>
              <div style={{display:'flex', gap:10, marginTop:10}}>
                <label style={{background:'#16a34a', color:'white', padding:'14px 20px', borderRadius:8, fontWeight:800, fontSize:14, cursor:'pointer'}}>
                  📷 TAP TO CHOOSE PICTURE
                  <input type="file" accept="image/*" onChange={e=>handlePhoneUpload(p.id, e.target.files[0])} style={{display:'none'}}/>
                </label>
              </div>
              {p.img && <img src={p.img} style={{width:'100%', maxHeight:220, objectFit:'contain', marginTop:12, borderRadius:8, border:'1px solid #ddd'}}/>}
            </div>
            <div><label style={{fontSize:11, fontWeight:700}}>Type</label><select value={p.type} onChange={e=>updateField(p.id,'type',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4}}><option value="digital">digital</option><option value="physical">physical</option></select></div>
            {p.type==='physical' && <div><label style={{fontSize:11, fontWeight:700}}>Stock Quantity</label><input type="number" value={p.stock} onChange={e=>updateField(p.id,'stock',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>}
            <div style={{gridColumn:'1 / -1', background:'#fff7ed', padding:12, borderRadius:8, border:'1px solid #fed7aa'}}>
              <label style={{fontSize:12, fontWeight:800, color:'#ea580c'}}>★ DESCRIPTION - Buyers see this</label>
              <textarea value={p.description||''} onChange={e=>updateField(p.id,'description',e.target.value)} placeholder="Write description..." style={{width:'100%', padding:12, borderRadius:6, border:'1px solid #ea580c', minHeight:90, boxSizing:'border-box', marginTop:6}}/>
            </div>
            {p.type==='digital' && (
              <div style={{gridColumn:'1 / -1'}}>
                <label style={{fontSize:11, fontWeight:700}}>Logs (Separate with ---)</label>
                <textarea value={(p.logs||[]).join('\n---\n')} onChange={e=>updateLogs(p.id,e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:120, boxSizing:'border-box', fontFamily:'monospace', fontSize:11, marginTop:4}}/>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
