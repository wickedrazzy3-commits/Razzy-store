'use client';
import { useState, useEffect } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({name:'',price:'',oldPrice:'',stock:'',img:'',type:'physical',delivery:''});
  const [isAuth, setIsAuth] = useState(false);
  const [pass, setPass] = useState('');

  useEffect(()=>{
    const s=localStorage.getItem("razzy_products");
    if(s){ try{ setProducts(JSON.parse(s)); }catch{} }
  },[]);
  useEffect(()=>{ localStorage.setItem("razzy_products", JSON.stringify(products)); },[products]);

  const login=()=>{
    if(pass==="razzy123"){ setIsAuth(true); } else alert('Wrong! Password is razzy123');
  };

  const startEdit=(p)=>{
    setEditing(p.id);
    setForm({name:p.name,price:p.price,oldPrice:p.oldPrice||'',stock:p.stock,img:p.img,type:p.type||'physical',delivery:p.delivery||''});
  };

  const saveEdit=()=>{
    if(!form.name||!form.price) return alert('Name & Price required');
    setProducts(prev=>prev.map(pr=>pr.id===editing?{...pr, name:form.name, price:Number(form.price), oldPrice:Number(form.oldPrice)||0, stock:Number(form.stock), img:form.img, type:form.type, delivery:form.delivery }:pr));
    setEditing(null); alert('Updated! ✅ Customers will see new stock/price instantly');
  };

  const addStock=(id,amount)=>{
    setProducts(prev=>prev.map(pr=>pr.id===id?{...pr, stock:pr.stock+amount}:pr));
  };

  const addNew=()=>{
    const newId=Date.now();
    const newP={id:newId, name:form.name||"New Product", price:Number(form.price)||1000, oldPrice:Number(form.oldPrice)||0, stock:Number(form.stock)||10, img:form.img||"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400", type:form.type||'physical', delivery:form.delivery||"Delivery info"};
    setProducts(prev=>[newP,...prev]); setForm({name:'',price:'',oldPrice:'',stock:'',img:'',type:'physical',delivery:''}); alert('Added!');
  };

  const deleteProd=(id)=>{ if(confirm('Delete?')) setProducts(prev=>prev.filter(p=>p.id!==id)); };

  if(!isAuth){
    return(<div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',fontFamily:'sans-serif'}}><div style={{background:'white',padding:24,borderRadius:12,width:320}}><h2>Admin Login</h2><p style={{fontSize:12}}>Password: razzy123</p><input type="password" value={pass} onChange={e=>setPass(e.target.value)} placeholder="Password" style={{width:'100%',padding:10,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/><button onClick={login} style={{width:'100%',marginTop:10,background:'black',color:'white',padding:10,borderRadius:8,border:0}}>Login</button></div></div>);
  }

  return(
    <div style={{fontFamily:'sans-serif',padding:20,background:'#f5f5f7',minHeight:'100vh'}}>
      <h1 style={{fontWeight:900}}>RAZZY ADMIN - Edit Products & Stock</h1>
      <div style={{background:'white',padding:16,borderRadius:12,marginTop:16}}>
        <h3>{editing?'Edit Product':'Add New Product'}</h3>
        <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="Product Name" style={{width:'100%',padding:10,marginTop:6,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:8,marginTop:8}}>
          <input type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} placeholder="Price e.g 4000" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          <input type="number" value={form.stock} onChange={e=>setForm({...form,stock:e.target.value})} placeholder="Qty e.g 10" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
          <input type="number" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})} placeholder="Old Price" style={{padding:10,borderRadius:8,border:'1px solid #ddd'}}/>
        </div>
        <input value={form.img} onChange={e=>setForm({...form,img:e.target.value})} placeholder="Image URL" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
        <input value={form.delivery} onChange={e=>setForm({...form,delivery:e.target.value})} placeholder="Delivery info e.g Tracking or Page Key" style={{width:'100%',padding:10,marginTop:8,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
        <div style={{display:'flex',gap:8,marginTop:10}}>
          {editing?<><button onClick={saveEdit} style={{flex:1,background:'#16a34a',color:'white',padding:12,borderRadius:8,border:0,fontWeight:800}}>Save Changes ✅</button><button onClick={()=>setEditing(null)} style={{flex:1,background:'#eee',padding:12,borderRadius:8,border:0}}>Cancel</button></>:<button onClick={addNew} style={{flex:1,background:'black',color:'white',padding:12,borderRadius:8,border:0,fontWeight:800}}>+ Add Product</button>}
        </div>
      </div>

      <div style={{marginTop:20}}>
        <h3>All Products ({products.length}) - Stock auto reduces when customer buys</h3>
        {products.map(p=>(
          <div key={p.id} style={{background:'white',padding:12,borderRadius:12,marginTop:10,display:'flex',gap:12,alignItems:'center'}}>
            <img src={p.img} style={{width:60,height:60,borderRadius:8,objectFit:'cover'}}/>
            <div style={{flex:1}}>
              <div style={{fontWeight:800,fontSize:14}}>{p.name}</div>
              <div style={{fontSize:12}}>₦{p.price} • Stock: <b style={{color:p.stock<5?'red':'green'}}>{p.stock}</b> left • Type: {p.type}</div>
              <div style={{display:'flex',gap:6,marginTop:6}}>
                <button onClick={()=>addStock(p.id,1)} style={{background:'#dcfce7',border:0,padding:'4px 8px',borderRadius:6,fontSize:11,fontWeight:700}}>+1 Stock</button>
                <button onClick={()=>addStock(p.id,5)} style={{background:'#dcfce7',border:0,padding:'4px 8px',borderRadius:6,fontSize:11,fontWeight:700}}>+5 Stock</button>
                <button onClick={()=>addStock(p.id,10)} style={{background:'#dcfce7',border:0,padding:'4px 8px',borderRadius:6,fontSize:11,fontWeight:700}}>+10</button>
              </div>
            </div>
            <div style={{display:'flex',flexDirection:'column',gap:6}}>
              <button onClick={()=>startEdit(p)} style={{background:'black',color:'white',border:0,padding:'6px 12px',borderRadius:6,fontSize:12}}>Edit</button>
              <button onClick={()=>deleteProd(p.id)} style={{background:'#fee2e2',border:0,padding:'6px 12px',borderRadius:6,fontSize:12}}>Delete</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
