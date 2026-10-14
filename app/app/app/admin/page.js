"use client";
import { useState, useEffect } from 'react';
export default function Admin(){
  const [products,setProducts]=useState([]);
  const [form,setForm]=useState({name:'',price:'',type:'physical',image:'https://via.placeholder.com/300',file:'',desc:''});
  useEffect(()=>{setProducts(JSON.parse(localStorage.getItem('razzy_products')||'[]'))},[]);
  const save=()=>{
    if(!form.name||!form.price) return alert('Add name and price');
    const newP={id:Date.now(),...form,price:Number(form.price)};
    const updated=[...products,newP];
    setProducts(updated); localStorage.setItem('razzy_products',JSON.stringify(updated));
    alert('Product added!'); setForm({name:'',price:'',type:'physical',image:'https://via.placeholder.com/300',file:'',desc:''});
  };
  const del=(id)=>{const u=products.filter(p=>p.id!==id); setProducts(u); localStorage.setItem('razzy_products',JSON.stringify(u));}
  return(
    <div style={{padding:'15px',fontFamily:'sans-serif'}}>
      <h1>Admin - Set Prices</h1><a href="/">← Back to Shop</a>
      <div style={{background:'#eee',padding:'15px',margin:'15px 0',borderRadius:'10px'}}>
        <input placeholder="Product Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{width:'100%',padding:'10px',margin:'5px 0'}}/>
        <input placeholder="Price e.g 5000" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={{width:'100%',padding:'10px',margin:'5px 0'}}/>
        <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{width:'100%',padding:'10px'}}><option value="physical">Physical - Needs Delivery</option><option value="digital">Digital - Instant</option></select>
        <input placeholder="Image URL" value={form.image} onChange={e=>setForm({...form,image:e.target.value})} style={{width:'100%',padding:'10px',margin:'5px 0'}}/>
        <input placeholder="File link for digital (Drive link)" value={form.file} onChange={e=>setForm({...form,file:e.target.value})} style={{width:'100%',padding:'10px'}}/>
        <button onClick={save} style={{width:'100%',background:'black',color:'white',padding:'12px',marginTop:'10px',borderRadius:'6px'}}>Add Product</button>
      </div>
      {products.map(p=>(<div key={p.id} style={{borderBottom:'1px solid #ddd',padding:'10px',display:'flex',justifyContent:'space-between'}}><span>{p.name} - ₦{p.price}</span><button onClick={()=>del(p.id)} style={{color:'red'}}>Delete</button></div>))}
    </div>
  )
}
