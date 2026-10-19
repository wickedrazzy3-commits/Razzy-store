'use client';
import { useState, useEffect } from 'react';
export default function Home(){
  const [products,setProducts]=useState([]);
  useEffect(()=>{ 
    (async()=>{
      try{
        const m=await import('./lib/supabase'); 
        const sb=m.supabase;
        if(sb){ const r=await sb.from('products').select('*'); if(r.data) setProducts(r.data); }
      }catch(e){}
    })();
  },[]);
  return(
    <div style={{padding:16, fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <h2>Razzy Store - Buyer Site ✅</h2>
      <p>Products: {products.length}</p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12}}>
        {products.map(p=>(
          <div key={p.id} style={{background:'white', padding:12, borderRadius:8}}>
            <b>{p.name}</b><br/>N{p.price}
          </div>
        ))}
      </div>
      <a href="/admin" style={{display:'inline-block', marginTop:20, background:'black', color:'white', padding:'10px 14px', borderRadius:6, textDecoration:'none'}}>Go to Admin /admin</a>
    </div>
  );
}
