'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');

  useEffect(()=>{
    const s = localStorage.getItem("razzy_products");
    if(s){ try{ setProducts(JSON.parse(s)); }catch{} }
  },[]);

  useEffect(()=>{ localStorage.setItem("razzy_products", JSON.stringify(products)); },[products]);

  const login = () => {
    if(pass==='admin123'){ setAuth(true); } else alert("Wrong admin password! Use admin123");
  };

  const updateField = (id, field, value) => {
    setProducts(prev=>prev.map(p=>p.id===id?{...p, [field]: value}:p));
  };

  const updateLogs = (id, text) => {
    const logs = text.split('\n---\n').map(s=>s.trim()).filter(Boolean);
    setProducts(prev=>prev.map(p=>p.id===id?{...p, logs, stock: p.type==='digital'? logs.length : p.stock}:p));
  };

  const addProduct = () => {
    const newP = {id:Date.now(), name:'New Product', price:1000, stock:10, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'Write description for buyers here...', logs:[]};
    setProducts(prev=>[newP,...prev]);
  };

  const deleteProduct = (id) => { if(confirm("Delete?")) setProducts(prev=>prev.filter(p=>p.id!==id)); };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320}}>
          <h2>Admin Dashboard</h2><p style={{fontSize:12}}>Enter password</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="admin123" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box', marginTop:8}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login as Admin</button>
          <div style={{fontSize:11, marginTop:8, color:'#666'}}>Buyer site: <a href="/">/ (home)</a><br/>Admin site: /admin</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h2>Admin - Manage Products</h2><div><button onClick={addProduct} style={{background:'black', color:'white', border:0, padding:'8px 12px', borderRadius:6, marginRight:8}}>Add Product</button><a href="/" style={{background:'#eee', padding:'8px 12px', borderRadius:6, textDecoration:'none', color:'black'}}>Go to Buyer Site</a></div></div>
      <p style={{fontSize:12, color:'#666'}}>Here you edit description, price, stock, images, logs. Changes show instantly on buyer site. Separate from buyer site.</p>
      {products.map(p=>(
        <div key={p.id} style={{background:'white', borderRadius:12, padding:16, marginTop:16, border:'1px solid #eee'}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><b>{p.name} (ID: {p.id})</b><button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'4px 8px', borderRadius:4}}>Delete</button></div>
          <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
            <div><label style={{fontSize:11}}>Name</label><input value={p.name} onChange={e=>updateField(p.id,'name',e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box'}}/></div>
            <div><label style={{fontSize:11}}>Price ₦</label><input type="number" value={p.price} onChange={e=>updateField(p.id,'price',Number(e.target.value))} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box'}}/></div>
            <div><label style={{fontSize:11}}>Image URL</label><input value={p.img} onChange={e=>updateField(p.id,'img',e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box'}}/></div>
            <div><label style={{fontSize:11}}>Type</label><select value={p.type} onChange={e=>updateField(p.id,'type',e.target.value)} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd'}}><option value="digital">digital</option><option value="physical">physical</option></select></div>
            <div><label style={{fontSize:11}}>Stock (for physical) or Auto for digital</label><input type="number" value={p.type==='digital'? p.logs?.length : p.stock} onChange={e=>updateField(p.id,'stock',Number(e.target.value))} disabled={p.type==='digital'} style={{width:'100%', padding:8, borderRadius:6, border:'1px solid #ddd', boxSizing:'border-box', background: p.type==='digital'?'#f5f5f7':'white'}}/></div>
            <div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11, fontWeight:700, color:'#ea580c'}}>Description - Buyers see this</label><textarea value={p.description||''} onChange={e=>updateField(p.id,'description',e.target.value)} placeholder="Write full description of item for buyers..." style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:80, boxSizing:'border-box'}}/></div>
            {p.type==='digital' && (<div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11, fontWeight:700}}>Logs / Accounts - Separate each account with new line containing --- </label><textarea value={(p.logs||[]).join('\n---\n')} onChange={e=>updateLogs(p.id,e.target.value)} placeholder="Account1 details&#10;---&#10;Account2 details" style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:120, boxSizing:'border-box', fontFamily:'monospace', fontSize:11}}/><div style={{fontSize:10, color:'#666'}}>Total logs: {(p.logs||[]).length} - This is available quantity</div></div>)}
          </div>
        </div>
      ))}
    </div>
  );
}
