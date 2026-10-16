'use client';
import { useState, useEffect, useRef } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const loadedRef = useRef(false);

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){ const p = JSON.parse(s); if(Array.isArray(p)) setProducts(p); }
    }catch{}
    setTimeout(()=>{ loadedRef.current = true; }, 800);
  },[]);

  useEffect(()=>{
    if(!loadedRef.current) return;
    try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{}
  },[products]);

  const login = () => { if(pass==='admin123') setAuth(true); else alert("Use admin123"); };

  const updateField = (id, field, value) => {
    setProducts(prev=>prev.map(p=>p.id===id?{...p, [field]: value}:p));
  };

  const updateLogs = (id, text) => {
    const logs = text.split('\n---\n').map(s=>s.trim()).filter(Boolean);
    setProducts(prev=>prev.map(p=>p.id===id?{...p, logs, stock: p.type==='digital'? logs.length : p.stock}:p));
  };

  // UPLOAD FROM PHONE - WORKS ON ANDROID/IPHONE
  const handlePhoneUpload = (id, file) => {
    if(!file) return;
    if(file.size > 5*1024*1024){ alert("Image too big! Use image under 5MB"); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
      updateField(id, 'img', e.target.result);
      alert("✅ Picture uploaded from phone! Saved to product");
    };
    reader.onerror = () => alert("Failed to read image");
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    const newP = {
      id: Date.now(),
      name:'New Product',
      price:1000,
      stock:10,
      img:'https://i.imgur.com/8Km9tLL.png',
      type:'digital',
      description:'',
      logs:[]
    };
    setProducts(prev=>[newP,...prev]);
  };

  const deleteProduct = (id) => { if(confirm("Delete?")) setProducts(prev=>prev.filter(p=>p.id!==id)); };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin Dashboard</h2>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="admin123" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box', marginTop:8}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <h2>Admin ({products.length})</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:6, fontWeight:800}}> + Add Item</button>
          <a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Buyer Site</a>
        </div>
      </div>

      {products.map(p=>(
        <div key={p.id} style={{background:'white', borderRadius:12, padding:16, marginTop:16, border:'1px solid #eee'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><b>{p.name}</b><button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'6px 10px', borderRadius:4}}>Delete</button></div>

          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
            <div><label style={{fontSize:11, fontWeight:700}}>Name</label><input value={p.name} onChange={e=>updateField(p.id,'name',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>
            <div><label style={{fontSize:11, fontWeight:700}}>Price ₦</label><input type="number" value={p.price} onChange={e=>updateField(p.id,'price',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>

            {/* PHONE UPLOAD - BIG BUTTON */}
            <div style={{gridColumn:'1 / -1', background:'#f0fdf4', padding:14, borderRadius:10, border:'2px dashed #16a34a'}}>
              <label style={{fontSize:13, fontWeight:800, color:'#16a34a', display:'block'}}>📱 UPLOAD PICTURE FROM YOUR PHONE</label>
              <p style={{fontSize:11, margin:'4px 0 10px', color:'#666'}}>Tap button below → Choose Gallery or Camera → Picture will appear instantly</p>

              <div style={{display:'flex', gap:8, flexWrap:'wrap'}}>
                <label style={{background:'#16a34a', color:'white', padding:'12px 18px', borderRadius:8, fontWeight:800, fontSize:13, cursor:'pointer', display:'inline-block'}}>
                  📷 CHOOSE FROM PHONE
                  <input type="file" accept="image/*" capture="environment" onChange={e=>handlePhoneUpload(p.id, e.target.files[0])} style={{display:'none'}}/>
                </label>

                <label style={{background:'#2563eb', color:'white', padding:'12px 18px', borderRadius:8, fontWeight:800, fontSize:13, cursor:'pointer', display:'inline-block'}}>
                  🖼️ GALLERY
                  <input type="file" accept="image/*" onChange={e=>handlePhoneUpload(p.id, e.target.files[0])} style={{display:'none'}}/>
                </label>
              </div>

              <div style={{marginTop:12}}>
                <label style={{fontSize:10}}>Or paste image link (optional)</label>
                <input value={p.img.startsWith('data:')?'':p.img} onChange={e=>updateField(p.id,'img',e.target.value)} placeholder="https://..." style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4, fontSize:12}}/>
              </div>

              {p.img && <div style={{marginTop:10}}><div style={{fontSize:11, fontWeight:700}}>Preview:</div><img src={p.img} style={{width:'100%', maxHeight:200, objectFit:'contain', marginTop:6, borderRadius:8, border:'1px solid #ddd'}}/></div>}
            </div>

            <div><label style={{fontSize:11, fontWeight:700}}>Type</label><select value={p.type} onChange={e=>updateField(p.id,'type',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4}}><option value="digital">digital</option><option value="physical">physical</option></select></div>
            {p.type==='physical' && <div><label style={{fontSize:11, fontWeight:700}}>Stock</label><input type="number" value={p.stock} onChange={e=>updateField(p.id,'stock',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>}

            <div style={{gridColumn:'1 / -1', background:'#fff7ed', padding:12, borderRadius:8, border:'1px solid #fed7aa'}}>
              <label style={{fontSize:12, fontWeight:800, color:'#ea580c'}}>★ DESCRIPTION</label>
              <textarea value={p.description||''} onChange={e=>updateField(p.id,'description',e.target.value)} placeholder="Write description for buyers..." style={{width:'100%', padding:12, borderRadius:6, border:'1px solid #ea580c', minHeight:90, boxSizing:'border-box', marginTop:6}}/>
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
