'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [oldPrice, setOldPrice] = useState('');
  const [delivery, setDelivery] = useState('Logs will be delivered after purchase. Check My Orders');
  const [img, setImg] = useState('');
  const [logsText, setLogsText] = useState('');
  const [previewCount, setPreviewCount] = useState(0);
  const [isAdmin, setIsAdmin] = useState(false);
  const [passInput, setPassInput] = useState('');
  const [type, setType] = useState('digital');
  const [manualStock, setManualStock] = useState('');

  // EDIT STATES
  const [editingId, setEditingId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editPrice, setEditPrice] = useState('');
  const [editOldPrice, setEditOldPrice] = useState('');
  const [editDelivery, setEditDelivery] = useState('');
  const [editImg, setEditImg] = useState('');
  const [editLogsText, setEditLogsText] = useState('');
  const [editPreviewCount, setEditPreviewCount] = useState(0);
  const [editType, setEditType] = useState('digital');
  const [editManualStock, setEditManualStock] = useState('');

  const ADMIN_PASS = "razzy123";

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s) setProducts(JSON.parse(s));
    }catch{}
  },[]);

  const saveProducts = (newProducts) => {
    setProducts(newProducts);
    localStorage.setItem("razzy_products", JSON.stringify(newProducts));
  };

  const parseLogs = (text) => {
    if(!text.trim()) return [];
    const blocks = text.split(/\n\s*\n/).filter(b=>b.trim().length>3);
    let finalBlocks = blocks;
    if(blocks.length <=1 && text.toLowerCase().includes("username")){
      finalBlocks = text.split(/(?=Username\s*:-)/i).filter(b=>b.trim());
    }
    return finalBlocks.map(b=>b.trim()).filter(b=>b);
  };

  useEffect(()=>{ setPreviewCount(parseLogs(logsText).length); },[logsText]);
  useEffect(()=>{ setEditPreviewCount(parseLogs(editLogsText).length); },[editLogsText]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setImg(ev.target.result);
    reader.readAsDataURL(file);
  };
  const handleEditImageUpload = (e) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setEditImg(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handleAddProduct = () => {
    if(!name ||!price) return alert("Enter Name and Price");
    if(!img) return alert("Upload Picture");

    let logsArray = [];
    let stock = 0;

    if(type==='digital'){
      logsArray = parseLogs(logsText);
      if(logsArray.length===0) return alert("Paste at least 1 log for Digital");
      stock = logsArray.length;
    } else {
      // physical
      if(!manualStock) return alert("Enter Stock for Physical item");
      stock = Number(manualStock);
      logsArray = [];
    }

    const newProduct = {
      id: Date.now(),
      name, price: Number(price), oldPrice: oldPrice? Number(oldPrice) : null,
      img, stock, logs: logsArray, delivery, type
    };
    saveProducts([newProduct,...products]);
    alert(`Added! Type: ${type} - Stock: ${stock}`);
    setName(''); setPrice(''); setOldPrice(''); setImg(''); setLogsText(''); setManualStock('');
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditName(p.name);
    setEditPrice(String(p.price));
    setEditOldPrice(p.oldPrice? String(p.oldPrice) : '');
    setEditDelivery(p.delivery);
    setEditImg(p.img);
    setEditType(p.type||'digital');
    setEditManualStock(String(p.stock));
    setEditLogsText(p.logs? p.logs.join("\n\n") : '');
  };

  const saveEdit = () => {
    let logsArray = [];
    let stock = 0;
    if(editType==='digital'){
      logsArray = parseLogs(editLogsText);
      if(logsArray.length===0) return alert("Logs cannot be empty for Digital");
      stock = logsArray.length;
    } else {
      stock = Number(editManualStock)||0;
      logsArray = [];
    }
    const updated = products.map(p=>{
      if(p.id===editingId){
        return {...p, name: editName, price: Number(editPrice), oldPrice: editOldPrice? Number(editOldPrice):null, delivery: editDelivery, img: editImg, logs: logsArray, stock, type: editType}
      }
      return p;
    });
    saveProducts(updated);
    setEditingId(null);
    alert(`Updated! Type: ${editType} - Stock: ${stock}`);
  };

  const deleteProduct = (id) => {
    if(!confirm("Delete?")) return;
    saveProducts(products.filter(p=>p.id!==id));
  };

  if(!isAdmin){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:320, border:'1px solid #ddd'}}>
          <h3>Admin Login</h3>
          <input type="password" value={passInput} onChange={e=>setPassInput(e.target.value)} placeholder="Enter admin password" style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #ddd', marginTop:10}}/>
          <button onClick={()=>{ if(passInput===ADMIN_PASS) setIsAdmin(true); else alert("Wrong"); }} style={{width:'100%', marginTop:10, background:'black', color:'white', padding:10, borderRadius:8, border:0, fontWeight:800}}>Login</button>
        </div>
      </div>
    )
  }

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh', padding:16}}>
      <div style={{display:'flex', justifyContent:'space-between'}}>
        <h2>Admin Dashboard</h2>
        <a href="/" style={{background:'black', color:'white', padding:'8px 14px', borderRadius:8, textDecoration:'none', fontSize:12}}>View Store</a>
      </div>

      {/* ADD PRODUCT */}
      <div style={{background:'white', border:'2px solid #16a34a', borderRadius:12, padding:16, marginTop:16}}>
        <h3 style={{margin:0, color:'#16a34a'}}>UPLOAD NEW PRODUCT</h3>

        {/* TYPE SELECTOR - DIFFERENTIATION */}
        <div style={{display:'flex', gap:8, marginTop:12}}>
          <button onClick={()=>setType('digital')} style={{flex:1, padding:10, borderRadius:8, border:type==='digital'?'2px solid #16a34a':'1px solid #ddd', background:type==='digital'?'#dcfce7':'white', fontWeight:800, fontSize:12}}>📱 DIGITAL (Logs)</button>
          <button onClick={()=>setType('physical')} style={{flex:1, padding:10, borderRadius:8, border:type==='physical'?'2px solid #2563eb':'1px solid #ddd', background:type==='physical'?'#dbeafe':'white', fontWeight:800, fontSize:12}}>📦 PHYSICAL (Shipping)</button>
        </div>

        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12}}>
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="Product Name" style={{padding:10, borderRadius:8, border:'1px solid #ddd'}}/>
          <input value={price} onChange={e=>setPrice(e.target.value)} type="number" placeholder="Price" style={{padding:10, borderRadius:8, border:'1px solid #ddd'}}/>
          <input value={oldPrice} onChange={e=>setOldPrice(e.target.value)} type="number" placeholder="Old Price" style={{padding:10, borderRadius:8, border:'1px solid #ddd'}}/>
          <input value={delivery} onChange={e=>setDelivery(e.target.value)} placeholder={type==='digital'?'Delivery Note for logs':'Shipping Note'} style={{padding:10, borderRadius:8, border:'1px solid #ddd'}}/>
        </div>

        <div style={{marginTop:12}}>
          <label style={{fontWeight:700, fontSize:12}}>Upload Picture</label>
          <input type="file" accept="image/*" onChange={handleImageUpload} style={{display:'block', marginTop:6}}/>
          {img && <img src={img} style={{width:80, height:80, objectFit:'cover', borderRadius:8, marginTop:8}}/>}
        </div>

        {type==='digital'? (
          <div style={{marginTop:12}}>
            <label style={{fontWeight:800, fontSize:13}}>📱 DIGITAL - Paste ALL Logs Here - Big Box</label>
            <textarea value={logsText} onChange={e=>setLogsText(e.target.value)} placeholder={`Username:- lhemr
Password:- temal
2fa:- jehsyh62728
How to login:- jsksieb

Username:- pleats
Password:- marek
2fa:- jskjwh6262
How to login:- nnajajdb`} style={{width:'100%', height:240, padding:12, borderRadius:8, border:'2px solid #16a34a', marginTop:8, fontSize:12, fontFamily:'monospace', boxSizing:'border-box'}}/>
            <div style={{background:'#dcfce7', padding:8, borderRadius:6, marginTop:6, fontSize:12, fontWeight:700}}>Digital Detected: {previewCount} → Stock Auto {previewCount}</div>
          </div>
        ) : (
          <div style={{marginTop:12, background:'#eff6ff', padding:12, borderRadius:8, border:'1px solid #2563eb'}}>
            <label style={{fontWeight:800, fontSize:13}}>📦 PHYSICAL - Manual Stock</label>
            <input value={manualStock} onChange={e=>setManualStock(e.target.value)} type="number" placeholder="Enter Stock Quantity e.g 50" style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #ddd', marginTop:8, boxSizing:'border-box'}}/>
            <div style={{fontSize:11, color:'#666', marginTop:6}}>Physical items don't need logs. Buyer will need to provide shipping address. Stock set manually.</div>
          </div>
        )}

        <button onClick={handleAddProduct} style={{width:'100%', marginTop:12, background:'black', color:'white', padding:14, borderRadius:8, border:0, fontWeight:900}}>ADD {type.toUpperCase()} - Stock {type==='digital'? previewCount : manualStock||0}</button>
      </div>

      {/* EXISTING */}
      <div style={{background:'white', borderRadius:12, padding:16, marginTop:20, border:'1px solid #ddd'}}>
        <h3>Existing ({products.length}) - Digital & Physical</h3>
        {products.map(p=>(
          <div key={p.id} style={{border:'1px solid #eee', borderRadius:8, padding:10, marginTop:10, borderLeft: `4px solid ${p.type==='physical'?'#2563eb':'#16a34a'}`}}>
            {editingId===p.id? (
              <div style={{background:'#fffbeb', padding:12, borderRadius:8, border:'1px solid #f59e0b'}}>
                <b>EDITING: {p.name}</b>
                <div style={{display:'flex', gap:8, marginTop:8}}>
                  <button onClick={()=>setEditType('digital')} style={{flex:1, padding:8, borderRadius:6, border:editType==='digital'?'2px solid #16a34a':'1px solid #ddd', background:editType==='digital'?'#dcfce7':'white', fontSize:11, fontWeight:700}}>DIGITAL</button>
                  <button onClick={()=>setEditType('physical')} style={{flex:1, padding:8, borderRadius:6, border:editType==='physical'?'2px solid #2563eb':'1px solid #ddd', background:editType==='physical'?'#dbeafe':'white', fontSize:11, fontWeight:700}}>PHYSICAL</button>
                </div>
                <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:8, marginTop:10}}>
                  <input value={editName} onChange={e=>setEditName(e.target.value)} style={{padding:8, borderRadius:6, border:'1px solid #ddd'}}/>
                  <input value={editPrice} onChange={e=>setEditPrice(e.target.value)} type="number" style={{padding:8, borderRadius:6, border:'1px solid #ddd'}}/>
                  <input value={editOldPrice} onChange={e=>setEditOldPrice(e.target.value)} type="number" placeholder="Old" style={{padding:8, borderRadius:6, border:'1px solid #ddd'}}/>
                  <input value={editDelivery} onChange={e=>setEditDelivery(e.target.value)} style={{padding:8, borderRadius:6, border:'1px solid #ddd'}}/>
                </div>
                <input type="file" accept="image/*" onChange={handleEditImageUpload} style={{marginTop:8}}/>
                {editType==='digital'? (
                  <div style={{marginTop:10}}>
                    <label style={{fontWeight:800, fontSize:12}}>EDIT DIGITAL LOGS - BIG BOX</label>
                    <textarea value={editLogsText} onChange={e=>setEditLogsText(e.target.value)} style={{width:'100%', height:300, padding:12, borderRadius:8, border:'2px solid #000', marginTop:6, fontSize:12, fontFamily:'monospace', boxSizing:'border-box'}}/>
                    <div style={{background:'#dcfce7', padding:6, borderRadius:4, marginTop:4, fontSize:11}}>Count: {editPreviewCount} → Stock {editPreviewCount}</div>
                  </div>
                ) : (
                  <div style={{marginTop:10}}>
                    <label style={{fontWeight:800, fontSize:12}}>PHYSICAL STOCK</label>
                    <input value={editManualStock} onChange={e=>setEditManualStock(e.target.value)} type="number" style={{width:'100%', padding:10, borderRadius:8, border:'1px solid #ddd', marginTop:4, boxSizing:'border-box'}}/>
                  </div>
                )}
                <div style={{display:'flex', gap:8, marginTop:10}}>
                  <button onClick={saveEdit} style={{flex:1, background:'#16a34a', color:'white', padding:10, borderRadius:6, border:0, fontWeight:800}}>SAVE</button>
                  <button onClick={()=>setEditingId(null)} style={{flex:1, background:'#eee', padding:10, borderRadius:6, border:0}}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{display:'flex', gap:10}}>
                <img src={p.img} style={{width:60, height:60, objectFit:'cover', borderRadius:6}}/>
                <div style={{flex:1}}>
                  <div style={{fontWeight:800, fontSize:13}}><span style={{background:p.type==='physical'?'#dbeafe':'#dcfce7', padding:'2px 6px', borderRadius:4, fontSize:10, marginRight:6}}>{p.type?.toUpperCase()||'DIGITAL'}</span>{p.name} - ₦{p.price} - Stock: {p.stock}</div>
                  <div style={{fontSize:10, color:'#666', marginTop:4}}>{p.type==='digital'? `Logs: ${p.logs?.length||0} accounts` : `Physical item - Manual stock`}</div>
                </div>
                <div style={{display:'flex', flexDirection:'column', gap:6}}>
                  <button onClick={()=>startEdit(p)} style={{background:'#dbeafe', color:'#2563eb', border:0, padding:'6px 12px', borderRadius:6, fontSize:11, fontWeight:700}}>Edit</button>
                  <button onClick={()=>deleteProduct(p.id)} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'6px 12px', borderRadius:6, fontSize:11}}>Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
