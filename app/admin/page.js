'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [editingId, setEditingId] = useState(null);

  // New Product Form (Separate)
  const [newForm, setNewForm] = useState({name:'',price:'',oldPrice:'',stock:'10',type:'physical',delivery:'',img:''});
  const [newImgPreview, setNewImgPreview] = useState('');

  // Edit Form (Separate from upload)
  const [editForm, setEditForm] = useState({name:'',price:'',oldPrice:'',stock:'',type:'physical',delivery:'',img:''});
  const [editImgPreview, setEditImgPreview] = useState('');

  useEffect(()=>{
    const s=localStorage.getItem("razzy_products");
    if(s){ try{ const p=JSON.parse(s); if(p.length>0) setProducts(p); }catch{} }
  },[]);
  useEffect(()=>{ if(products.length>0) localStorage.setItem("razzy_products", JSON.stringify(products)); },[products]);

  const compressImage = (file, callback) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width; let height = img.height;
        const max = 800;
        if(width>max||height>max){ if(width>height){ height*=max/width; width=max; } else { width*=max/height; height=max; } }
        canvas.width = width; canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img,0,0,width,height);
        const compressed = canvas.toDataURL('image/jpeg', 0.6); // auto compress 60%
        callback(compressed);
      };
    };
  };

  const handleNewImage = (e) => {
    const file = e.target.files[0]; if(!file) return;
    if(file.size>5*1024*1024) return alert('Image too big! Max 5MB');
    compressImage(file, (result)=>{
      setNewForm({...newForm, img:result});
      setNewImgPreview(result);
    });
  };

  const handleEditImage = (e) => {
    const file = e.target.files[0]; if(!file) return;
    compressImage(file, (result)=>{
      setEditForm({...editForm, img:result});
      setEditImgPreview(result);
    });
  };

  const addProduct = () => {
    if(!newForm.name||!newForm.price||!newForm.img) return alert('Name, Price & Picture required!');
    const newP = { id:Date.now(), name:newForm.name, price:Number(newForm.price), oldPrice:Number(newForm.oldPrice)||0, stock:Number(newForm.stock)||0, img:newForm.img, type:newForm.type, delivery:newForm.delivery||'No delivery info' };
    setProducts([newP,...products]);
    setNewForm({name:'',price:'',oldPrice:'',stock:'10',type:'physical',delivery:'',img:''}); setNewImgPreview('');
    alert('Product Added! ✅ Compressed & Saved');
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditForm({name:p.name,price:p.price,oldPrice:p.oldPrice||'',stock:p.stock,type:p.type,delivery:p.delivery,img:p.img});
    setEditImgPreview(p.img);
    window.scrollTo({top:0, behavior:'smooth'});
  };

  const saveEdit = () => {
    setProducts(prev=>prev.map(pr=>pr.id===editingId?{...pr, name:editForm.name, price:Number(editForm.price), oldPrice:Number(editForm.oldPrice)||0, stock:Number(editForm.stock), type:editForm.type, delivery:editForm.delivery, img:editForm.img}:pr));
    setEditingId(null); setEditImgPreview(''); alert('Product Edited! Price/Qty/Picture/Content updated ✅');
  };

  const deleteProd = (id) => { if(confirm('Delete this product?')) setProducts(prev=>prev.filter(p=>p.id!==id)); };

  if(!isAuth){
    return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif',background:'#f5f5f7'}}><div style={{background:'white',padding:24,borderRadius:12,width:320}}><h2>Admin Login</h2><p style={{fontSize:12}}>Password: razzy123</p><input type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/><button onClick={()=>pass==="razzy123"?setIsAuth(true):alert('Wrong!')} style={{width:'100%',marginTop:10,background:'black',color:'white',padding:10,borderRadius:8,border:0}}>Login</button></div></div>);
  }

  return(
    <div style={{fontFamily:'sans-serif',padding:20,background:'#f5f5f7',minHeight:'100vh'}}>
      <h1 style={{fontWeight:900}}>RAZZY ADMIN - Old Setup</h1>
      <p style={{fontSize:12,color:'#666'}}>Upload with auto compress • Edit separate from Upload</p>

      {/* SECTION 1: UPLOAD NEW PRODUCT - SEPARATE */}
      <div style={{background:'white',padding:16,borderRadius:12,marginTop:16,border:'2px solid #16a34a'}}>
        <h3 style={{margin:0,color:'#16a34a'}}>📤 SECTION 1: UPLOAD NEW PRODUCT</h3>
        <p style={{fontSize:11,color:'#888'}}>This is ONLY for adding new product</p>
        <input value={newForm.name} onChange={e=>setNewForm({...newForm,name:e.target.value})} placeholder="Product Name" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:8}}>
          <input type="number" value={newForm.price} onChange={e=>setNewForm({...newForm,price:e.target.value})} placeholder="Price" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          <input type="number" value={newForm.stock} onChange={e=>setNewForm({...newForm,stock:e.target.value})} placeholder="Qty" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          <input type="number" value={newForm.oldPrice} onChange={e=>setNewForm({...newForm,oldPrice:e.target.value})} placeholder="Old Price" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
        </div>
        <select value={newForm.type} onChange={e=>setNewForm({...newForm,type:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd'}}><option value="physical">Physical</option><option value="digital">Digital</option></select>
        <input value={newForm.delivery} onChange={e=>setNewForm({...newForm,delivery:e.target.value})} placeholder="Content / Logs / Delivery info" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
        <div style={{marginTop:10}}>
          <div style={{fontSize:12,fontWeight:700}}>Upload Picture (Auto Compress)</div>
          <input type="file" accept="image/*" onChange={handleNewImage} style={{marginTop:6}}/>
          {newImgPreview&&<img src={newImgPreview} style={{width:'100%',maxHeight:200,objectFit:'contain',marginTop:10,borderRadius:8,border:'1px solid #eee'}}/>}
        </div>
        <button onClick={addProduct} style={{width:'100%',marginTop:12,background:'#16a34a',color:'white',padding:12,borderRadius:8,border:0,fontWeight:800}}> + Add Product (Compressed) </button>
      </div>

      {/* SECTION 2: EDIT EXISTING - SEPARATE */}
      {editingId&&(
        <div style={{background:'white',padding:16,borderRadius:12,marginTop:20,border:'2px solid #2563eb'}}>
          <h3 style={{margin:0,color:'#2563eb'}}>✏️ SECTION 2: EDIT PRODUCT (ID: {editingId})</h3>
          <p style={{fontSize:11,color:'#888'}}>Edit Price, Picture, Qty, Content - Separate from Upload</p>
          <input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} placeholder="Product Name" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:8}}>
            <input type="number" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})} placeholder="Price" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
            <input type="number" value={editForm.stock} onChange={e=>setEditForm({...editForm,stock:e.target.value})} placeholder="Qty - Add more here" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
            <input type="number" value={editForm.oldPrice} onChange={e=>setEditForm({...editForm,oldPrice:e.target.value})} placeholder="Old Price" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          </div>
          <input value={editForm.delivery} onChange={e=>setEditForm({...editForm,delivery:e.target.value})} placeholder="Edit Content / Logs" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
          <div style={{marginTop:10}}>
            <div style={{fontSize:12,fontWeight:700}}>Change Picture (Auto Compress)</div>
            <input type="file" accept="image/*" onChange={handleEditImage} style={{marginTop:6}}/>
            {editImgPreview&&<img src={editImgPreview} style={{width:'100%',maxHeight:200,objectFit:'contain',marginTop:10,borderRadius:8}}/>}
          </div>
          <div style={{display:'flex',gap:8,marginTop:12}}>
            <button onClick={saveEdit} style={{flex:1,background:'#2563eb',color:'white',padding:12,borderRadius:8,border:0,fontWeight:800}}>Save Edit ✅</button>
            <button onClick={()=>setEditingId(null)} style={{flex:1,background:'#eee',padding:12,borderRadius:8,border:0}}>Cancel</button>
          </div>
        </div>
      )}

      {/* SECTION 3: LIST */}
      <div style={{marginTop:20}}>
        <h3>📦 All Uploaded Products ({products.length})</h3>
        <p style={{fontSize:11,color:'#888'}}>Click Edit to edit in Section 2 - Qty auto reduces when bought</p>
        {products.map(p=>(
          <div key={p.id} style={{background:'white',padding:12,borderRadius:12,marginTop:10,display:'flex',gap:12,alignItems:'center'}}>
            <img src={p.img} style={{width:70,height:70,borderRadius:8,objectFit:'cover'}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14}}>{p.name}</div>
              <div style={{fontSize:12}}>₦{p.price} • Stock: <b style={{color:p.stock<5?'red':'green'}}>{p.stock}</b> qty • {p.type}</div>
              <div style={{fontSize:11,color:'#666',marginTop:2,whiteSpace:'nowrap',overflow:'hidden',textOverflow:'ellipsis',maxWidth:200}}>Logs: {p.delivery}</div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <button onClick={()=>startEdit(p)} style={{background:'black',color:'white',border:0,padding:'6px 14px',borderRadius:6,fontSize:12}}>Edit</button>
              <button onClick={()=>deleteProd(p.id)} style={{background:'#fee2e2',border:0,padding:'6px 14px',borderRadius:6,fontSize:12}}>Del</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
