"use client";
import { useState, useEffect } from "react";
export default function Admin(){
const [products,setProducts]=useState([
{id:1,name:"Facebook",price:4000,type:"digital",qty:10,img:"https://images.unsplash.com/photo-1611162616475-46b76543ac5f?w=400"},
{id:2,name:"Instagram 0-100 followers",price:3000,type:"digital",qty:5,img:"https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400"},
]);
const [form,setForm]=useState({name:"",price:"",type:"digital",qty:"1",img:"",badge:""});
const [editId,setEditId]=useState(null);
useEffect(()=>{const s=localStorage.getItem("razzy_products"); if(s) setProducts(JSON.parse(s));},[]);
useEffect(()=>{localStorage.setItem("razzy_products",JSON.stringify(products));},[products]);
const save=()=>{
if(!form.name||!form.price) return alert("Add name & price");
if(editId){
setProducts(products.map(p=>p.id===editId?{...p,...form,price:Number(form.price),qty:Number(form.qty)}:p));
setEditId(null);
} else {
setProducts([...products,{id:Date.now(),...form,price:Number(form.price),qty:Number(form.qty)}]);
}
setForm({name:"",price:"",type:"digital",qty:"1",img:"",badge:""});
};
const edit=(p)=>{setForm({name:p.name,price:p.price,type:p.type,qty:p.qty,img:p.img,badge:p.badge||""});setEditId(p.id);window.scrollTo(0,0);};
const del=(id)=>{if(confirm("Delete?")) setProducts(products.filter(p=>p.id!==id));};
const changeQty=(id,delta)=>{setProducts(products.map(p=>p.id===id?{...p,qty:Math.max(0,p.qty+delta)}:p));};
return(
<div style={{padding:15,fontFamily:"sans-serif",maxWidth:650,margin:"0 auto",background:"#f5f5f5",minHeight:"100vh"}}>
<h2>Razzy Admin - PRO</h2>
<div style={{background:"white",padding:15,borderRadius:10}}>
<h4>{editId?"EDIT Product":"ADD New Product"}</h4>
<div style={{display:"grid",gap:10}}>
<input placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<div style={{display:"flex",gap:10}}>
<input placeholder="Price N" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<input placeholder="Qty" type="number" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
</div>
<input placeholder="Image Link https://..." value={form.img} onChange={e=>setForm({...form,img:e.target.value})} style={{padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<div style={{display:"flex",gap:10}}>
<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{flex:1,padding:12,borderRadius:6}}><option value="physical">Physical</option><option value="digital">Digital</option></select>
<input placeholder="Badge" value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
</div>
<button onClick={save} style={{background:editId?"#f68b1e":"black",color:"white",padding:14,borderRadius:6,fontWeight:"bold",border:"none"}}>{editId?"UPDATE":"ADD PRODUCT"}</button>
</div>
</div>
<h3 style={{marginTop:25}}>Products ({products.length})</h3>
{products.map(p=>(
<div key={p.id} style={{background:"white",padding:12,borderRadius:10,marginTop:12,display:"flex",gap:12,alignItems:"center"}}>
<img src={p.img||"https://via.placeholder.com/80"} style={{width:70,height:70,objectFit:"cover",borderRadius:8}}/>
<div style={{flex:1}}>
<b style={{fontSize:14}}>{p.name} {p.qty===0&&<span style={{color:"red"}}>(OUT)</span>}</b><br/>
<span style={{fontSize:12}}>N{p.price} - Qty: {p.qty}</span><br/>
<div style={{display:"flex",gap:6,marginTop:6}}>
<button onClick={()=>changeQty(p.id,-1)} style={{padding:"4px 10px"}}>-</button>
<span style={{padding:"4px 8px",background:"#f5f5f5"}}>{p.qty}</span>
<button onClick={()=>changeQty(p.id,1)} style={{padding:"4px 10px"}}>+</button>
<button onClick={()=>edit(p)} style={{marginLeft:10,padding:"4px 12px",background:"#f68b1e",color:"white",border:"none",borderRadius:4}}>Edit</button>
</div>
</div>
<button onClick={()=>del(p.id)} style={{background:"#ff3b30",color:"white",border:"none",padding:"8px 12px",borderRadius:6}}>DELETE</button>
</div>
))}
</div>
);
}
