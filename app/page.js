'use client';
import { useState, useEffect } from 'react';
export default function Home(){
  const [products,setProducts]=useState([]);
  useEffect(()=>{
    (async()=>{
      try{
        const m=await import('./lib/supabase');
        const sb=m.supabase;
        if(sb){
          const r=await sb.from('products').select('*');
          if(r.data) setProducts(r.data);
        }
      }catch(e){}
    })();
  },[]);
  return(
    <div style={{padding:16, fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <h2 style={{textAlign:'center'}}>Razzy Store - Buyer ✅</h2>
      <p style={{textAlign:'center'}}>{products.length} products</p>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16}}>
        {products.map(function(p){
          return(
            <div key={p.id} style={{background:'white', padding:12, borderRadius:12}}>
              <img src={p.img} style={{width:'100%', height:100, objectFit:'contain'}} alt=""/>
              <div style={{fontWeight:700, fontSize:13, marginTop:6}}>{p.name}</div>
              <div style={{fontWeight:800}}>N{p.price}</div>
            </div>
          );
        })}
      </div>
      <div style={{textAlign:'center', marginTop:20}}>
        <a href="/admin" style={{background:'black', color:'white', padding:'12px 18px', borderRadius:8, textDecoration:'none'}}>Go to Admin Dashboard</a>
      </div>
    </div>
  );
}
