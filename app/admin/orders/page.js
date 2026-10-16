"use client";
import { useState, useEffect } from "react";
export default function Orders(){
const [orders,setOrders]=useState([]);
useEffect(()=>{ try{ const s=localStorage.getItem("razzy_orders"); if(s) setOrders(JSON.parse(s).reverse()); }catch(e){} },[]);
return(
<div style={{fontFamily:"sans-serif",padding:12,maxWidth:700,margin:"0 auto"}}>
<h2>All Orders ({orders.length})</h2>
<a href="/admin" style={{background:"black",color:"white",padding:"7px 10px",borderRadius:6,textDecoration:"none",fontSize:12}}>← Admin</a>
<a href="/" style={{marginLeft:8,background:"#f68b1e",color:"white",padding:"7px 10px",borderRadius:6,textDecoration:"none",fontSize:12}}>Shop</a>
<div style={{marginTop:12,display:"grid",gap:8}}>
{orders.length===0&&<p>No orders yet.</p>}
{orders.map(o=>(
<div key={o.id} style={{background:"white",border:"1px solid #ddd",padding:10,borderRadius:8,fontSize:12}}>
<b>{o.product}</b> - ₦{o.price?.toLocaleString()}<br/>
Customer: {o.customer?.name} | {o.customer?.email} | {o.customer?.phone}<br/>
User Account: {o.user}<br/>
Ref: {o.ref} - {o.date}<br/>
<div style={{background:"#f5f5f5",padding:8,borderRadius:6,marginTop:6,whiteSpace:"pre-wrap",wordBreak:"break-all"}}>{o.delivery}</div>
</div>
))}
</div>
</div>
);
}
