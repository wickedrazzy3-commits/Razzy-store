"use client";
import { useState } from "react";
export default function Admin(){
 const [products,setProducts]=useState([]);
 const [name,setName]=useState("");const [price,setPrice]=useState("");const [type,setType]=useState("physical");
 const add=()=>{if(!name||!price)return;setProducts([...products,{id:Date.now(),name,price,type}]);setName("");setPrice("");};
 return(<div style={{padding:20,fontFamily:'sans-serif'}}><h1>Razzy Admin - Add Products</h1><input placeholder="Product name" value={name} onChange={e=>setName(e.target.value)} style={{padding:10,marginRight:10}}/><input placeholder="Price N" type="number" value={price} onChange={e=>setPrice(e.target.value)} style={{padding:10,marginRight:10}}/><select value={type} onChange={e=>setType(e.target.value)} style={{padding:10}}><option value="physical">Physical</option><option value="digital">Digital</option></select><button onClick={add} style={{padding:10,marginLeft:10,background:'black',color:'white'}}>Add</button><div style={{marginTop:20}}>{products.map(p=><div key={p.id} style={{border:'1px solid #ddd',padding:10,marginTop:10}}>{p.name} - ₦{p.price} - {p.type}</div>)}</div><p style={{marginTop:20}}>These will show in main shop after we connect database.</p></div>);
}
