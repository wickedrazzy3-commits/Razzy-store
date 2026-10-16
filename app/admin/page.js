"use client";
import { useState, useEffect } from "react";

export default function Admin(){
const [products,setProducts]=useState([]);
const [form,setForm]=useState({name:"",price:"",qty:"1",img:"",badge:"",type:"digital",delivery:""});
const [editing,setEditing]=useState(null);

useEffect(()=>{
 try{
  const s=localStorage.getItem("razzy_products");
  if(s) setProducts(JSON.parse(s));
 }catch(e){ localStorage.removeItem("razzy_products"); }
},[]);

useEffect(()=>{
 try{
  localStorage.setItem("razzy_products",JSON.stringify(products));
 }catch(e){
  alert("Image too big! Use smaller image. Error: "+e.message);
 }
},[products]);

const compressImage=(file,cb)=>{
 const reader=new FileReader();
 reader.onload=(e)=>{
  const img=new Image();
  img.onload=()=>{
   const canvas=document.createElement("canvas");
   const maxW=500;
   const scale=maxW/img.width;
   canvas.width=maxW;
   canvas.height=img.height*scale;
   const ctx=canvas.getContext("2d");
   ctx.drawImage(img,0,0,canvas.width,canvas.height);
   cb(canvas.toDataURL("image/jpeg",0.6));
  };
  img.src=e.target.result;
 };
 reader.readAsDataURL(file);
};

const handleAdd=()=>{
 if(!form.name||!form.price||!form.img) return alert("Fill name, price, image");
 if(form.type==="digital" &&!form.delivery) return alert("For DIGITAL, paste accounts in delivery box");

 let newP;
 if(editing!==null){
  newP=[...products];
  newP[editing]={...form,id:products[editing].id,price:Number(form.price),qty:Number(form.qty)};
  setEditing(null);
 } else {
  newP=[...products,{...form,id:Date.now(),price:Number(form.price),qty:Number(form.qty)}];
 }
 setProducts(newP);
 setForm({name:"",price:"",qty:"1",img:"",badge:"",type:"digital",delivery:""});
 alert("Product Added!");
};

const delProduct=(i)=>{
 if(confirm("Delete?")){ const n=[...products]; n.splice(i,1); setProducts(n); }
};

return(
<div style={{fontFamily:"sans-serif",padding:15,maxWidth:600,margin:"0 auto"}}>
<h2>RAZZY ADMIN - FIXED</h2>
<a href="/" style={{display:"inline-block",marginBottom:10,background:"black",color:"white",padding:"8px 12px",borderRadius:6,textDecoration:"none"}}>← View Shop</a>
<a href="/admin/orders" style={{display:"inline-block",marginLeft:10,background:"#f68b1e",color:"white",padding:"8px 12px",borderRadius:6,textDecoration:"none"}}>Orders</a>

<div style={{background:"white",padding:15,borderRadius:8,border:"1px solid #ddd",display:"grid",gap:10}}>
<input placeholder="Product Name e.g UK Physical Sim" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{padding:12,border:"1px solid #ccc",borderRadius:6}}/>
<div style={{display:"flex",gap:8}}>
<input type="number" placeholder="Price 4000" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ccc",borderRadius:6}}/>
<input type="number" placeholder="Qty 10" value={form.qty} onChange={e=>setForm({...form,qty:e.target.value})} style={{flex:1,padding:12,border:"1px solid #ccc",borderRadius:6}}/>
</div>

<div style={{border:"2px dashed orange",padding:10,borderRadius:6}}>
<p style={{fontSize:12,margin:"0 0 5px"}}>Product Image (will auto compress)</p>
<input type="file" accept="image/*" onChange={e=>{
 if(e.target.files[0]) compressImage(e.target.files[0],(compressed)=>setForm({...form,img:compressed}));
}}/>
{form.img&&<img src={form.img} style={{width:"100%",height:200,objectFit:"cover",marginTop:10,borderRadius:6}}/>}
</div>

<select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{padding:12,border:"1px solid #ccc",borderRadius:6}}>
<option value="digital">DIGITAL - Auto deliver on site</option>
<option value="physical">PHYSICAL - UK SIM etc</option>
</select>

<textarea placeholder={form.type==="digital"?"Paste ACCOUNTS here, 1 account per BLOCK with empty line\n\nExample:\nuid:123 pass:abc\n\nuid:456 pass:def":"For physical, delivery note e.g Will call you for delivery"} value={form.delivery} onChange={e=>setForm({...form,delivery:e.target.value})} style={{padding:12,border:"1px solid #ccc",borderRadius:6,minHeight:120}}/>

<input placeholder="Badge e.g HOT (optional)" value={form.badge} onChange={e=>setForm({...form,badge:e.target.value})} style={{padding:12,border:"1px solid #ccc",borderRadius:6}}/>

<button onClick={handleAdd} style={{padding:14,background:"black",color:"white",border:"none",borderRadius:6,fontWeight:"bold"}}>{editing!==null?"UPDATE PRODUCT":"ADD PRODUCT"}</button>
</div>

<h3>Products ({products.length})</h3>
{products.map((p,i)=>(
<div key={p.id} style={{background:"white",padding:10,borderRadius:6,border:"1px solid #eee",marginBottom:8,display:"flex",gap:10,alignItems:"center"}}>
<img src={p.img} style={{width:50,height:50,objectFit:"cover",borderRadius:6}}/>
<div style={{flex:1}}><b>{p.name}</b><br/><small>{p.type} - ₦{p.price} - Qty:{p.qty} - Stock lines:{p.delivery?p.delivery.split("\n").filter(l=>l.trim()).length:0}</small></div>
<button onClick={()=>delProduct(i)} style={{background:"red",color:"white",border:"none",padding:"6px 10px",borderRadius:4}}>Del</button>
</div>
))}
</div>
);
}
