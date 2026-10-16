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
      if(s){
        const p = JSON.parse(s);
        if(Array.isArray(p)) setProducts(p);
      }
    }catch{}
    setTimeout(()=>{ loadedRef.current = true; }, 800);
  },[]);

  useEffect(()=>{
    if(!loadedRef.current) return;
    try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{}
  },[products]);

  const login = () => {
    if(pass==='admin123'){ setAuth(true); } else alert("Wrong! Use admin123");
  };

  const updateField = (id, field, value) => {
    setProducts(prev=>prev.map(p=>p.id===id?{...p, [field]: value}:p));
  };

  const updateLogs = (id, text) => {
    const logs = text.split('\n---\n').map(s=>s.trim()).filter(Boolean);
    setProducts(prev=>prev.map(p=>p.id===id?{...p, logs, stock: p.type==='digital'? logs.length : p.stock}:p));
  };

  const addProduct = () => {
    const newP = {
      id: Date.now(),
      name:'New Product',
      price:1000,
      stock:10,
      img:'https://i.imgur.com/8Km9tLL.png',
      type:'digital',
      description:'WRITE DESCRIPTION HERE - Buyers will see this on buyer site. Example: High quality... Fast delivery...',
      logs:["Sample Account 1 - Username: test\nPassword: test123"]
    };
    setProducts(prev=>[newP,...prev]);
    alert("New product added! Now edit its description below and scroll down to save automatically");
  };

  const deleteProduct = (id) => { if(confirm("Delete product?")) setProducts(prev=>prev.filter(p=>p.id!==id)); };

  const clearAll = () => { if(confirm("Clear ALL products? This cannot be undone")) { localStorage.removeItem("razzy_products"); setProducts([]); } };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin Dashboard</h2><p style={{fontSize:12}}>Password is admin123</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="admin123" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box', marginTop:8}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login as Admin</button>
          <div style={{fontSize:11, marginTop:12}}>Buyer site: / <br/>Admin: /admin</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <h2>Admin Dashboard ({products.length} items)</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:6, fontWeight:800}}> + Add New Item</button>
          <button onClick={clearAll} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'10px 14px', borderRadius:6}}>Clear All</button>
          <a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Buyer Site</a>
        </div>
      </div>
      <div style={{background:'#fff7ed', border:'1px solid #fed7aa', padding:10, borderRadius:8, marginTop:12, fontSize:12}}>
        <b>How to add description:</b> Each product below has <b style={{color:'#ea580c'}}>Description</b> box (orange label). Type there. It saves automatically and shows on buyer site. Add as many items as you want - they will NOT disappear after refresh now (bug fixed).
      </div>

      {products.length===0 && <div style={{textAlign:'center', marginTop:40, color:'#888'}}>No products. Click Add New Item</div>}

      {products.map(p=>(
        <div key={p.id} style={{background:'white', borderRadius:12, padding:16, marginTop:16, border:'1px solid #eee'}}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><b style={{fontSize:14}}>{p.name} (ID: {p.id}) - Available: {p.type==='digital'? (p.logs?.length||0) : p.stock}</b><button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'6px 10px', borderRadius:4, fontSize:11}}>Delete</button></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
            <div><label style={{fontSize:11, fontWeight:700}}>Name</label><input value={p.name} onChange={e=>updateField(p.id,'name',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>
            <div><label style={{fontSize:11, fontWeight:700}}>Price ₦</label><input type="number" value={p.price} onChange={e=>updateField(p.id,'price',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>
            <div><label style={{fontSize:11, fontWeight:700}}>Image URL</label><input value={p.img} onChange={e=>updateField(p.id,'img',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>
            <div><label style={{fontSize:11, fontWeight:700}}>Type</label><select value={p.type} onChange={e=>updateField(p.id,'type',e.target.value)} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4}}><option value="digital">digital (logs)</option><option value="physical">physical (stock)</option></select></div>
            {p.type==='physical' && <div><label style={{fontSize:11, fontWeight:700}}>Stock Quantity</label><input type="number" value={p.stock} onChange={e=>updateField(p.id,'stock',Number(e.target.value))} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', marginTop:4}}/></div>}
            <div style={{gridColumn:'1 / -1', background:'#fff7ed', padding:12, borderRadius:8, border:'1px solid #fed7aa'}}>
              <label style={{fontSize:12, fontWeight:800, color:'#ea580c'}}>★ DESCRIPTION - Buyers see this on product card</label>
              <textarea value={p.description||''} onChange={e=>updateField(p.id,'description',e.target.value)} placeholder="Write full description here... e.g. High quality UK numbers, instant delivery, 100% verified, VPN guide included..." style={{width:'100%', padding:12, borderRadius:6, border:'1px solid #ea580c', minHeight:90, boxSizing:'border-box', marginTop:6, fontSize:13}}/>
              <div style={{fontSize:10, color:'#666', marginTop:4}}>This shows under price on buyer site</div>
            </div>
            {p.type==='digital' && (
              <div style={{gridColumn:'1 / -1'}}>
                <label style={{fontSize:11, fontWeight:700}}>Logs / Accounts (Separate with line containing --- )</label>
                <textarea value={(p.logs||[]).join('\n---\n')} onChange={e=>updateLogs(p.id,e.target.value)} placeholder="Account 1 details here&#10;---&#10;Account 2 details here" style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:140, boxSizing:'border-box', fontFamily:'monospace', fontSize:11, marginTop:4}}/>
                <div style={{fontSize:11, color:'#16a34a', fontWeight:700}}>Total available: {(p.logs||[]).length} - This is stock for digital</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}
