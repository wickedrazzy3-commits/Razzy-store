'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [editingId, setEditingId] = useState(null);
  const [newForm, setNewForm] = useState({name:'',price:'',oldPrice:'',stock:'10',type:'physical',delivery:'',img:''});
  const [newPrev, setNewPrev] = useState('');
  const [editForm, setEditForm] = useState({name:'',price:'',oldPrice:'',stock:'',type:'physical',delivery:'',img:''});
  const [editPrev, setEditPrev] = useState('');

  useEffect(()=>{
    try{
      const s=localStorage.getItem("razzy_products");
      if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) setProducts(p); }
    }catch{}
  },[]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{} },[products]);

  const compress = (file, cb) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if(typeof window==='undefined') return cb(e.target.result);
      const imgEl = new window.Image();
      imgEl.src = e.target.result;
      imgEl.onload = () => {
        const canvas = document.createElement('canvas');
        let w=imgEl.width, h=imgEl.height;
        const max=800;
        if(w>max||h>max){ if(w>h){ h*=max/w; w=max; } else { w*=max/h; h=max; } }
        canvas.width=w; canvas.height=h;
        canvas.getContext('2d').drawImage(imgEl,0,0,w,h);
        cb(canvas.toDataURL('image/jpeg',0.6));
      };
    };
    reader.readAsDataURL(file);
  };

  const onNewImg = (e)=>{ const f=e.target.files[0]; if(!f) return; if(f.size>6*1024*1024) return alert('Max 6MB'); compress(f,(r)=>{ setNewForm(s=>({...s,img:r})); setNewPrev(r); }); };
  const onEditImg = (e)=>{ const f=e.target.files[0]; if(!f) return; compress(f,(r)=>{ setEditForm(s=>({...s,img:r})); setEditPrev(r); }); };

  const addProduct = ()=>{
    if(!newForm.name||!newForm.price||!newForm.img) return alert('Name, Price & Picture required');
    const np={id:Date.now(), name:newForm.name, price:Number(newForm.price), oldPrice:Number(newForm.oldPrice)||0, stock:Number(newForm.stock)||0, img:newForm.img, type:newForm.type, delivery:newForm.delivery||'No info'};
    setProducts(p=>[np,...p]); setNewForm({name:'',price:'',oldPrice:'',stock:'10',type:'physical',delivery:'',img:''}); setNewPrev(''); alert('Added ✅');
  };

  const startEdit = (p)=>{ setEditingId(p.id); setEditForm({name:p.name,price:p.price,oldPrice:p.oldPrice||'',stock:p.stock,type:p.type,delivery:p.delivery,img:p.img}); setEditPrev(p.img); window.scrollTo({top:0,behavior:'smooth'}); };
  const saveEdit = ()=>{ setProducts(prev=>prev.map(x=>x.id===editingId?{...x, name:editForm.name, price:Number(editForm.price), oldPrice:Number(editForm.oldPrice)||0, stock:Number(editForm.stock), type:editForm.type, delivery:editForm.delivery, img:editForm.img}:x)); setEditingId(null); setEditPrev(''); alert('Edited ✅'); };

  if(!isAuth){
    return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f5f5f7',fontFamily:'sans-serif'}}><div style={{background:'white',padding:24,borderRadius:12,width:320}}><h2>Admin</h2><p style={{fontSize:12}}>Password: razzy123</p><input type="password" value={pass} onChange={e=>setPass(e.target.value)} style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ddd'}}/><button onClick={()=>pass==='razzy123'?setIsAuth(true):alert('Wrong')} style={{width:'100%',marginTop:10,background:'black',color:'white',padding:10,borderRadius:8,border:0}}>Login</button></div></div>);
  }

  return(
    <div style={{fontFamily:'sans-serif',padding:16,background:'#f5f5f7',minHeight:'100vh'}}>
      <h1 style={{fontWeight:900,fontSize:20}}>RAZZY ADMIN - Old Setup</h1>

      <div style={{background:'white',padding:16,borderRadius:12,marginTop:12,border:'2px solid #16a34a'}}>
        <h3 style={{margin:0,color:'#16a34a'}}>📤 SECTION 1: UPLOAD NEW (Separate)</h3>
        <input value={newForm.name} onChange={e=>setNewForm({...newForm,name:e.target.value})} placeholder="Product Name" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginTop:8}}>
          <input type="number" value={newForm.price} onChange={e=>setNewForm({...newForm,price:e.target.value})} placeholder="Price" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          <input type="number" value={newForm.stock} onChange={e=>setNewForm({...newForm,stock:e.target.value})} placeholder="Qty" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          <input type="number" value={newForm.oldPrice} onChange={e=>setNewForm({...newForm,oldPrice:e.target.value})} placeholder="Old Price" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
        </div>
        <input value={newForm.delivery} onChange={e=>setNewForm({...newForm,delivery:e.target.value})} placeholder="Content / Logs" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
        <div style={{marginTop:10}}><b style={{fontSize:12}}>Upload Picture (Auto Compress)</b><br/><input type="file" accept="image/*" onChange={onNewImg} style={{marginTop:6}}/>{newPrev&&<img src={newPrev} style={{width:'100%',maxHeight:200,objectFit:'contain',marginTop:10,borderRadius:8,border:'1px solid #eee'}}/>}</div>
        <button onClick={addProduct} style={{width:'100%',marginTop:12,background:'#16a34a',color:'white',padding:12,borderRadius:8,border:0,fontWeight:800}}>+ Add Product</button>
      </div>

      {editingId&&(
        <div style={{background:'white',padding:16,borderRadius:12,marginTop:16,border:'2px solid #2563eb'}}>
          <h3 style={{margin:0,color:'#2563eb'}}>✏️ SECTION 2: EDIT PRODUCT (Separate)</h3>
          <p style={{fontSize:11}}>Editing ID: {editingId} - Edit Price/Picture/Qty/Content here</p>
          <input value={editForm.name} onChange={e=>setEditForm({...editForm,name:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:6,marginTop:8}}>
            <input type="number" value={editForm.price} onChange={e=>setEditForm({...editForm,price:e.target.value})} style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
            <input type="number" value={editForm.stock} onChange={e=>setEditForm({...editForm,stock:e.target.value})} style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
            <input type="number" value={editForm.oldPrice} onChange={e=>setEditForm({...editForm,oldPrice:e.target.value})} style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          </div>
          <input value={editForm.delivery} onChange={e=>setEditForm({...editForm,delivery:e.target.value})} style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
          <div style={{marginTop:10}}><b style={{fontSize:12}}>Change Picture (Auto Compress)</b><br/><input type="file" accept="image/*" onChange={onEditImg} style={{marginTop:6}}/>{editPrev&&<img src={editPrev} style={{width:'100%',maxHeight:200,objectFit:'contain',marginTop:10,borderRadius:8}}/>}</div>
          <div style={{display:'flex',gap:8,marginTop:12}}><button onClick={saveEdit} style={{flex:1,background:'#2563eb',color:'white',padding:12,borderRadius:8,border:0,fontWeight:800}}>Save Edit</button><button onClick={()=>setEditingId(null)} style={{flex:1,background:'#eee',padding:12,borderRadius:8,border:0}}>Cancel</button></div>
        </div>
      )}

      <div style={{marginTop:20}}><h3>📦 Products ({products.length})</h3>
        {products.map(p=>(
          <div key={p.id} style={{background:'white',padding:12,borderRadius:12,marginTop:10,display:'flex',gap:10,alignItems:'center'}}>
            <img src={p.img} style={{width:60,height:60,borderRadius:8,objectFit:'cover'}}/>
            <div style={{flex:1}}><div style={{fontWeight:800,fontSize:13}}>{p.name}</div><div style={{fontSize:11}}>₦{p.price} • Stock: {p.stock}</div><div style={{fontSize:10,color:'#666'}}>Logs: {p.delivery}</div></div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}><button onClick={()=>startEdit(p)} style={{background:'black',color:'white',border:0,padding:'6px 12px',borderRadius:6,fontSize:11}}>Edit</button><button onClick={()=>setProducts(prev=>prev.filter(x=>x.id!==p.id))} style={{background:'#fee2e2',border:0,padding:'6px 12px',borderRadius:6,fontSize:11}}>Del</button></div>
          </div>
        ))}
      </div>
    </div>
  );
}
