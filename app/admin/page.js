"use client";
import { useState, useEffect, useRef } from "react";
export default function Admin(){
const [products,setProducts]=useState([]);
const [form,setForm]=useState({name:"",price:"",type:"digital",qty:"1",img:"",badge:""});
const [editId,setEditId]=useState(null);
const fileRef=useRef(null);
useEffect(()=>{const s=localStorage.getItem("razzy_products"); if(s) setProducts(JSON.parse(s));},[]);
useEffect(()=>{localStorage.setItem("razzy_products",JSON.stringify(products));},[products]);

const handleFile=(e)=>{
 const file=e.target.files[0];
 if(!file) return;
 if(file.size> 700000) return alert("Image too big, choose smaller pic under 700kb");
 const reader=new FileReader();
 reader.onload=()=>{setForm({...form,img:reader.result});};
 reader.readAsDataURL(file);
};

const save=()=>{
if(!form.name||!form.price) return alert("Add name & price");
if(!form.img) return alert("Please upload image");
if(editId){
setProducts(products.map(p=>p.id===editId?{...p,...form,price:Number(form.price),qty:Number(form.qty)}:p));
setEditId(null);
} else {
setProducts([...products,{id:Date.now(),...form,price:Number(form.price),qty:Number(form.qty)}]);
}
setForm({name:"",price:"",type:"digital",qty:"1",img:"",badge:""});
if(fileRef.current) fileRef.current.value="";
};
const edit=(p)=>{setForm({name:p.name,price:p.price,type:p.type,qty:p.qty,img:p.img,badge:p.badge||""});setEditId(p.id);window.scrollTo(0,0);};
const del=(id)=>{if(confirm("Delete this product?")) setProducts(products.filter(p=>p.id!==id));};
const changeQty=(id,delta)=>{setProducts(products.map(p=>p.id===id?{...p,qty:Math.max(0,p.qty+delta)}:p));};

return(
<div style={{padding:15,fontFamily:"sans-serif",maxWidth:650,margin:"0 auto",background:"#f5f5f5",minHeight:"100vh"}}>
<h2>Razzy Admin - PRO</h2>
<div style={{background:"white",padding:15,borderRadius:10}}>
<h4 style={{marginTop:0}}>{editId?"✏️ EDIT Product":"➕ ADD New Product"}</h4>
<div style={{display:"grid",gap:10}}>
<input placeholder="Product name e.g UK SIM" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<div style={{display:"flex",gap:10}}>
<input placeholder="Price N" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<input placeholder="Qty" type="number" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
</div>

{/* UPLOAD BUTTON */}
<div style={{border:"2px dashed #f68b1e",padding:12,borderRadius:8,textAlign:"center",background:"#fff8f0"}}>
<input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{width:"100%"}}/>
<p style={{fontSize:11,margin:"6px 0 0",color:"#666"}}>Tap to choose picture from gallery</p>
</div>

{form.img&&<img src={form.img} style={{width:"100%",height:180,objectFit:"cover",borderRadius:8,border:"1px solid #ddd"}}/>}

<div style={{display:"flex",gap:10}}>
<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{flex:1,padding:12,borderRadius:6}}><option value="physical">Physical - SIM / Voice Changer</option><option value="digital">Digital</option></select>
<input placeholder="Badge (optional) e.g HOT" value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
</div>
<button onClick={save} style={{background:editId?"#f68b1e":"black",color:"white",padding:14,borderRadius:6,fontWeight:"bold",border:"none"}}>{editId?"UPDATE PRODUCT":"ADD PRODUCT"}</button>
{editId&&<button onClick={()=>{setEditId(null);setForm({name:"",price:"",type:"digital",qty:"1",img:"",badge:""}); if(fileRef.current) fileRef.current.value="";}} style={{background:"#eee",padding:10,borderRadius:6,border:"none"}}>Cancel</button>}
</div>
</div>

<h3 style={{marginTop:25}}>Products ({products.length}) - Qty with +/- | Delete removes from shop</h3>
{products.map(p=>(
<div key={p.id} style={{background:"white",padding:12,borderRadius:10,marginTop:12,display:"flex",gap:12,alignItems:"center"}}>
<img src={p.img} style={{width:70,height:70,objectFit:"cover",borderRadius:8}}/>
<div style={{flex:1}}>
<b style={{fontSize:14}}>{p.name} {p.qty===0&&<span style={{color:"red"}}> OUT</span>} {p.badge&&<span style={{background:"#f68b1e",color:"white",fontSize:10,padding:"2px 6px",borderRadius:4,marginLeft:6}}>{p.badge}</span>}</b><br/>
<span style={{fontSize:12}}>N{p.price.toLocaleString()} - Qty: {p.qty}</span><br/>
<div style={{display:"flex",gap:6,marginTop:6}}>
<button onClick={()=>changeQty(p.id,-1)} style={{padding:"4px 10px",border:"1px solid #ddd",borderRadius:4}}>-</button>
<span style={{padding:"4px 8px",background:"#f5f5f5",borderRadius:4,fontSize:12}}>{p.qty}</span>
<button onClick={()=>changeQty(p.id,1)} style={{padding:"4px 10px",border:"1px solid #ddd",borderRadius:4}}>+</button>
<button onClick={()=>edit(p)} style={{marginLeft:8,padding:"4px 12px",background:"#f68b1e",color:"white",border:"none",borderRadius:4,fontSize:12}}>Edit</button>
</div>
</div>
<button onClick={()=>del(p.id)} style={{background:"#ff3b30",color:"white",border:"none",padding:"8px 12px",borderRadius:6,fontWeight:"bold"}}>DELETE</button>
</div>
))}
<a href="/" style={{display:"block",marginTop:25,textAlign:"center",background:"black",color:"white",padding:14,borderRadius:8,textDecoration:"none",fontWeight:"bold"}}>Go to Shop →</a>
</div>
);
}
