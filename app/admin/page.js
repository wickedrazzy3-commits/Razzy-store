"use client";
import { useState, useEffect } from "react";

const DEFAULTS=[
 {id:1,name:"UK Physical SIM - Ready for WhatsApp",price:15000,oldPrice:18000,type:"physical",img:"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400"},
 {id:2,name:"USA T-Mobile SIM - 5G Unlimited",price:20000,oldPrice:25000,type:"physical",img:"https://images.unsplash.com/photo-1581993192872-14d6f2e1e0d4?w=400"},
 {id:3,name:"Voice Changer Device - 8 Voices",price:35000,oldPrice:45000,type:"physical",img:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400"},
 {id:4,name:"Aged TikTok Account 1k Followers",price:12000,oldPrice:15000,type:"digital",img:"https://images.unsplash.com/photo-1611162616475-46b76543ac5f?w=400"},
];

export default function Admin(){
 const [products,setProducts]=useState(DEFAULTS);
 const [form,setForm]=useState({name:"",price:"",oldPrice:"",type:"physical",img:""});

 useEffect(()=>{const s=localStorage.getItem("razzy_products"); if(s) setProducts(JSON.parse(s));},[]);
 useEffect(()=>{localStorage.setItem("razzy_products",JSON.stringify(products));},[products]);

 const add=()=>{
   if(!form.name||!form.price) return alert("Enter name & price");
   setProducts([...products,{id:Date.now(),...form,price:Number(form.price),oldPrice:Number(form.oldPrice||form.price)}]);
   setForm({name:"",price:"",oldPrice:"",type:"physical",img:""});
 };
 const del=(id)=>setProducts(products.filter(p=>p.id!==id));
 const updatePrice=(id,newPrice)=>setProducts(products.map(p=>p.id===id?{...p,price:Number(newPrice)}:p));

 return(
  <div style={{padding:15,fontFamily:"sans-serif",maxWidth:600,margin:"0 auto"}}>
   <h2>RAZZY ADMIN - Control Prices</h2>
   <div style={{background:"#fff3e0",padding:10,borderRadius:8,marginBottom:15,fontSize:13}}>
     💡 <b>How it works:</b> Change price here → Go to main shop page → It will use new price. For customers worldwide to see new price forever, after editing, copy products and paste to <b>app/page.js</b> (I will show you).
   </div>
   <div style={{display:"grid",gap:8,background:"white",padding:15,borderRadius:8,boxShadow:"0 2px 5px rgba(0,0,0,0.1)"}}>
     <input placeholder="Product Name e.g UK SIM" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{padding:10,border:"1px solid #ddd",borderRadius:4}}/>
     <div style={{display:"flex",gap:8}}>
       <input placeholder="Your Price ₦" type="number" value={form.price} onChange={e=>setForm({...form,price:e.target.value})} style={{flex:1,padding:10,border:"1px solid #ddd",borderRadius:4}}/>
       <input placeholder="Old Price ₦" type="number" value={form.oldPrice} onChange={e=>setForm({...form,oldPrice:e.target.value})} style={{flex:1,padding:10,border:"1px solid #ddd",borderRadius:4}}/>
     </div>
     <input placeholder="Image Link (https://...)" value={form.img} onChange={e=>setForm({...form,img:e.target.value})} style={{padding:10,border:"1px solid #ddd",borderRadius:4}}/>
     <select value={form.type} onChange={e=>setForm({...form,type:e.target.value})} style={{padding:10}}><option value="physical">Physical - SIM / Voice Changer</option><option value="digital">Digital - Social Account</option></select>
     <button onClick={add} style={{background:"black",color:"white",padding:12,borderRadius:4,fontWeight:"bold"}}>ADD / UPDATE PRODUCT</button>
   </div>

   <h3 style={{marginTop:20}}>Your Products ({products.length}) - Tap to change price</h3>
   {products.map(p=>(
     <div key={p.id} style={{background:"white",padding:10,marginTop:10,borderRadius:8,display:"flex",gap:10,alignItems:"center",boxShadow:"0 1px 3px rgba(0,0,0,0.1)"}}>
       <img src={p.img||"https://via.placeholder.com/60"} style={{width:60,height:60,objectFit:"cover",borderRadius:6}}/>
       <div style={{flex:1}}>
         <div style={{fontSize:13,fontWeight:"bold"}}>{p.name}</div>
         <div style={{fontSize:12}}>{p.type} - ₦{p.price.toLocaleString()} <input type="number" value={p.price} onChange={e=>updatePrice(p.id,e.target.value)} style={{width:80,marginLeft:10,padding:4}}/></div>
       </div>
       <button onClick={()=>del(p.id)} style={{background:"red",color:"white",border:"none",padding:"8px 10px",borderRadius:4}}>X</button>
     </div>
   ))}

   <div style={{marginTop:20,padding:15,background:"#e8f5e9",borderRadius:8}}>
     <b>Want it live for all customers?</b><br/>After you set your desired prices, tell me "Export" — I will generate the new code for your main shop page.js so it stays permanent on Vercel.
   </div>

   <a href="/" style={{display:"block",marginTop:20,textAlign:"center",background:"#f68b1e",color:"white",padding:12,borderRadius:4,textDecoration:"none",fontWeight:"bold"}}>← Go to Shop</a>
  </div>
 );
}
