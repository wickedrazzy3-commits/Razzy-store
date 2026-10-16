'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newForm, setNewForm] = useState({name:'',price:'',stock:'10',img:'',delivery:''});
  const [editForm, setEditForm] = useState({name:'',price:'',stock:'',img:'',delivery:''});

  useEffect(()=>{
    const s = localStorage.getItem("razzy_products");
    if(s){ try{ setProducts(JSON.parse(s)); }catch{} }
  },[]);
  useEffect(()=>{ localStorage.setItem("razzy_products", JSON.stringify(products)); },[products]);

  const handleImg = (e, setter) => {
    const file = e.target.files[0];
    if(!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setter(prev=>({...prev, img: ev.target.result})); };
    reader.readAsDataURL(file);
  };

  if(!isAuth){
    return(
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f7'}}>
        <div style={{background:'white',padding:20,borderRadius:12,width:300}}>
          <h3>Admin Login</h3>
          <p style={{fontSize:12}}>Password: razzy123</p>
          <input type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:10,border:'1px solid #ddd',borderRadius:8}}/>
          <button onClick={()=>{if(pass==='razzy123') setIsAuth(true); else alert('wrong');}} style={{width:'100%',marginTop:10,background:'black',color:'white',padding:10,borderRadius:8,border:0}}>Login</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16,background:'#f5f5f7',minHeight:'100vh',fontFamily:'sans-serif'}}>
      <h2>RAZZY ADMIN - Old Setup</h2>

      <div style={{background:'white',padding:12,borderRadius:12,border:'2px solid green',marginTop:10}}>
        <h3 style={{color:'green',margin:0}}>SECTION 1: UPLOAD NEW PRODUCT</h3>
        <input value={newForm.name} onChange={e=>setNewForm({...newForm,name:e.target.value})} placeholder="Name" style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
        <input type="number" value={newForm.price} onChange={e=>setNewForm({...newForm,price:e.target.value})} placeholder="Price" style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
        <input type="number" value={newForm.stock} onChange={e=>setNewForm({...newForm,stock:e.target.value})} placeholder="Qty e.g 10" style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
        <input value={newForm.delivery} onChange={e=>setNewForm({...newForm,delivery:e.target.value})} placeholder="Content / Logs" style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
        <div style={{marginTop:8}}><b style={{fontSize:12}}>Upload Picture (not link)</b><br/><input type="file" accept="image/*" onChange={e=>handleImg(e,setNewForm)} /></div>
        {newForm.img && <img src={newForm.img} style={{width:'100%',height:150,objectFit:'contain',marginTop:8,border:'1px solid #eee',borderRadius:8}}/>}
        <button onClick={()=>{
          if(!newForm.name||!newForm.price||!newForm.img) return alert('Need name, price, picture');
          const np={id:Date.now(),name:newForm.name,price:Number(newForm.price),stock:Number(newForm.stock)||10,img:newForm.img,delivery:newForm.delivery,type:'physical',oldPrice:0};
          setProducts([np,...products]); setNewForm({name:'',price:'',stock:'10',img:'',delivery:''}); alert('Added');
        }} style={{width:'100%',marginTop:10,background:'green',color:'white',padding:12,border:0,borderRadius:8,fontWeight:800}}>+ Add Product</button>
      </div>

      {editingId && (
        <div style={{background:'white',padding:12,borderRadius:12,border:'2px solid blue',marginTop:16}}>
          <h3 style={{color:'blue',margin:0}}>SECTION 2: EDIT PRODUCT - Separate</h3>
          <p style={{fontSize:11}}>Edit price, picture, qty, content here</p>
          <input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
          <input type="number" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})} placeholder="Price" style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
          <input type="number" value={editForm.stock} onChange={e=>setEditForm({...editForm,stock:e.target.value})} placeholder="Qty" style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
          <input value={editForm.delivery} onChange={e=>setEditForm({...editForm,delivery:e.target.value})} style={{width:'100%',padding:10,marginTop:8,border:'1px solid #ddd',borderRadius:8,boxSizing:'border-box'}}/>
          <div style={{marginTop:8}}><b style={{fontSize:12}}>Change Picture</b><br/><input type="file" accept="image/*" onChange={e=>handleImg(e,setEditForm)} /></div>
          {editForm.img && <img src={editForm.img} style={{width:'100%',height:150,objectFit:'contain',marginTop:8,border:'1px solid #eee',borderRadius:8}}/>}
          <div style={{display:'flex',gap:8,marginTop:10}}>
            <button onClick={()=>{ setProducts(prev=>prev.map(p=>p.id===editingId?{...p,name:editForm.name,price:Number(editForm.price),stock:Number(editForm.stock),delivery:editForm.delivery,img:editForm.img}:p)); setEditingId(null); alert('Edited'); }} style={{flex:1,background:'blue',color:'white',padding:10,border:0,borderRadius:8}}>Save Edit</button>
            <button onClick={()=>setEditingId(null)} style={{flex:1,background:'#eee',padding:10,border:0,borderRadius:8}}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{marginTop:20}}>
        <h3>All Products ({products.length})</h3>
        {products.map(p=>(
          <div key={p.id} style={{background:'white',padding:10,borderRadius:10,marginTop:8,display:'flex',gap:8,alignItems:'center'}}>
            <img src={p.img} style={{width:50,height:50,objectFit:'cover',borderRadius:6}}/>
            <div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{p.name}</div><div style={{fontSize:11}}>₦{p.price} • Stock:{p.stock}</div></div>
            <button onClick={()=>{ setEditingId(p.id); setEditForm({name:p.name,price:p.price,stock:p.stock,img:p.img,delivery:p.delivery}); }} style={{background:'black',color:'white',border:0,padding:'6px 10px',borderRadius:6}}>Edit</button>
            <button onClick={()=>setProducts(prev=>prev.filter(x=>x.id!==p.id))} style={{background:'#fee2e2',border:0,padding:'6px 10px',borderRadius:6}}>Del</button>
          </div>
        ))}
      </div>
    </div>
  );
}
