"use client";
import { useState, useEffect, useRef } from "react";
export default function Admin(){
const [products,setProducts]=useState([]);
const [form,setForm]=useState({name:"",price:"",type:"digital",qty:"1",img:"",badge:"",delivery:""});
const [editId,setEditId]=useState(null);
const fileRef=useRef(null);
useEffect(()=>{const s=localStorage.getItem("razzy_products"); if(s) setProducts(JSON.parse(s));},[]);
useEffect(()=>{localStorage.setItem("razzy_products",JSON.stringify(products));},[products]);
const handleFile=(e)=>{
 const file=e.target.files[0]; if(!file) return;
 const reader=new FileReader(); reader.onload=()=>{setForm({...form,img:reader.result});}; reader.readAsDataURL(file);
};
const save=()=>{
if(!form.name||!form.price) return alert("Add name & price");
if(!form.img) return alert("Upload image");
if(form.type==="digital" &&!form.delivery) return alert("For DIGITAL, add what customer will get after payment in Delivery box");
if(editId){setProducts(products.map(p=>p.id===editId?{...p,...form,price:Number(form.price),qty:Number(form.qty)}:p)); setEditId(null);}
else {setProducts([...products,{id:Date.now(),...form,price:Number(form.price),qty:Number(form.qty)}]);}
setForm({name:"",price:"",type:"digital",qty:"1",img:"",badge:"",delivery:""}); if(fileRef.current) fileRef.current.value="";
};
const edit=(p)=>{setForm({name:p.name,price:p.price,type:p.type,qty:p.qty,img:p.img,badge:p.badge||"",delivery:p.delivery||""});setEditId(p.id);window.scrollTo(0,0);};
const del=(id)=>{if(confirm("Delete?")) setProducts(products.filter(p=>p.id!==id));};
return(
<div style={{padding:15,maxWidth:650,margin:"0 auto",background:"#f5f5f5",minHeight:"100vh",fontFamily:"sans-serif"}}>
<h2>Razzy Admin - Auto Delivery</h2>
<div style={{background:"white",padding:15,borderRadius:10}}>
<h4>{editId?"EDIT":"ADD New Product"}</h4>
<div style={{display:"grid",gap:10}}>
<input placeholder="Product name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<div style={{display:"flex",gap:10}}>
<input placeholder="Price N" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<input placeholder="Qty" type="number" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ddd",borderRadius:6}}/>
</div>
<div style={{border:"2px dashed #f68b1e",padding:12,borderRadius:8,textAlign:"center"}}><input ref={fileRef} type="file" accept="image/*" onChange={handleFile} style={{width:"100%"}}/></div>
{form.img&&<img src={form.img} style={{width:"100%",height:150,objectFit:"cover",borderRadius:8}}/>}
<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{padding:12,borderRadius:6}}><option value="digital">DIGITAL - Auto deliver on site</option><option value="physical">PHYSICAL - Needs shipping</option></select>
<textarea placeholder={form.type==="digital"?"WHAT CUSTOMER GETS AFTER PAYING (Important!) e.g Email: xxx@gmail.com Pass: 12345 OR Download link: https://...":"For physical, leave empty or add tracking info"} value={form.delivery} onChange={e=>setForm({...form,delivery:e.target.value})} style={{padding:12,border:"1px solid #ddd",borderRadius:6,minHeight:90}}></textarea>
<input placeholder="Badge e.g HOT (optional)" value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})} style={{padding:12,border:"1px solid #ddd",borderRadius:6}}/>
<button onClick={save} style={{background:"black",color:"white",padding:14,borderRadius:6,fontWeight:"bold",border:"none"}}>{editId?"UPDATE":"ADD PRODUCT"}</button>
</div>
</div>
<h3>Products ({products.length})</h3>
{products.map(p=>(<div key={p.id} style={{background:"white",padding:12,borderRadius:10,marginTop:10,display:"flex",gap:10}}><img src={p.img} style={{width:60,height:60,objectFit:"cover",borderRadius:6}}/><div style={{flex:1,fontSize:13}}><b>{p.name}</b><br/>N{p.price} - Qty:{p.qty} - {p.type}<br/>{p.delivery&&<span style={{color:"green",fontSize:11}}>Has delivery: {p.delivery.substring(0,40)}...</span>}</div><button onClick={()=>edit(p)} style={{height:35}}>Edit</button><button onClick={()=>del(p.id)} style={{background:"#ff3b30",color:"white",border:"none",borderRadius:6,height:35}}>DEL</button></div>))}
</div>
);
}
