"use client";
import { useState, useEffect } from "react";

export default function Shop(){
const PAYSTACK_KEY="pk_live_e53e70211b051a607dea27a34fe32091d35917c2";
const [products,setProducts]=useState([]);
const [search,setSearch]=useState("");
const [delivered,setDelivered]=useState(null);
const [customer,setCustomer]=useState({name:"",email:"",phone:""});
const [qtys,setQtys]=useState({});

useEffect(()=>{
 // AUTO CLEAR IF?clear
 if(window.location.search.includes("clear")){
   localStorage.removeItem("razzy_products");
   localStorage.removeItem("razzy_orders");
   alert("Cleared broken data! Now go back to /");
   window.location.href="/";
   return;
 }
 try{
   const s=localStorage.getItem("razzy_products");
   if(s){
     const p=JSON.parse(s);
     if(Array.isArray(p)) setProducts(p);
   }
 }catch(e){
   console.log("Bad data, clearing",e);
   localStorage.removeItem("razzy_products");
   setProducts([]);
 }
 const script=document.createElement("script");
 script.src="https://js.paystack.co/v1/inline.js";
 document.body.appendChild(script);
},[]);

useEffect(()=>{
 try{
  localStorage.setItem("razzy_products",JSON.stringify(products));
 }catch(e){ console.log(e); }
},[products]);

const filtered=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

const getQty=(id)=> qtys[id]||1;
const changeQty=(id,delta,stock)=>{
 const cur=getQty(id);
 let n=cur+delta;
 if(n<1) n=1;
 if(n>stock) n=stock;
 setQtys({...qtys,[id]:n});
};

const buyNow=(product)=>{
 const buyCount=getQty(product.id);
 if(product.qty<=0) return alert("Sold out");
 if(!customer.name||!customer.email) return alert("Enter your name & email first");

 // Check digital stock lines
 let lines=[];
 if(product.type==="digital"){
   lines=product.delivery? product.delivery.split("\n\n").filter(l=>l.trim()!=="") : [];
   // fallback to \n if no double \n
   if(lines.length<=1){
     const singleLines=product.delivery.split("\n").filter(l=>l.trim()!=="");
     // Group every 3 lines as 1 account if they pasted uid+pass+link
     if(singleLines.length>=buyCount){
       lines=singleLines; // we will slice
     }
   }
   if(lines.length===0) return alert("No delivery stock. Contact admin.");
   if(lines.length < buyCount) return alert(`Only ${lines.length} accounts left, you asked for ${buyCount}`);
 }

 const total=product.price*buyCount;

 const handler=window.PaystackPop.setup({
  key:PAYSTACK_KEY,
  email:customer.email,
  amount:total*100,
  currency:"NGN",
  metadata:{custom_fields:[{display_name:"Product",variable_name:"product",value:product.name+" x"+buyCount}]},
  callback:function(response){
    let deliveryText="";
    let newProducts=[...products];
    let idx=newProducts.findIndex(p=>p.id===product.id);
    if(idx>-1){
      if(newProducts[idx].type==="digital"){
        // Deliver buyCount accounts
        let allBlocks=newProducts[idx].delivery.split("\n\n").filter(l=>l.trim()!=="");
        if(allBlocks.length<=1){
          // if user pasted without double newline, treat each non-empty line block as needed, but deliver as raw lines
          // Better: deliver first buyCount lines joined
          let rawLines=newProducts[idx].delivery.split("\n").filter(l=>l.trim()!=="");
          deliveryText=rawLines.slice(0,buyCount).join("\n");
          let remaining=rawLines.slice(buyCount).join("\n");
          newProducts[idx].delivery=remaining;
        } else {
          deliveryText=allBlocks.slice(0,buyCount).join("\n\n");
          let remaining=allBlocks.slice(buyCount).join("\n\n");
          newProducts[idx].delivery=remaining;
        }
        newProducts[idx].qty=Math.max(0,newProducts[idx].qty-buyCount);
      } else {
        deliveryText=`PHYSICAL ITEM: ${product.name} x${buyCount} - We will call you on ${customer.phone} for delivery.`;
        newProducts[idx].qty=Math.max(0,newProducts[idx].qty-buyCount);
      }
      setProducts(newProducts);
      const orders=JSON.parse(localStorage.getItem("razzy_orders")||"[]");
      orders.push({id:Date.now(),product:product.name+" x"+buyCount,price:total,customer,delivery:deliveryText,ref:response.reference,date:new Date().toLocaleString()});
      localStorage.setItem("razzy_orders",JSON.stringify(orders));
    }
    setDelivered({productName:product.name+" x"+buyCount,total,text:deliveryText,ref:response.reference});
  },
  onClose:function(){},
 });
 handler.openIframe();
};

return(
<div style={{fontFamily:"sans-serif",background:"#f5f5f5",minHeight:"100vh"}}>
<div style={{background:"black",color:"white",padding:12,position:"sticky",top:0,zIndex:10}}>
<div style={{maxWidth:1000,margin:"0 auto",display:"flex",gap:8,alignItems:"center"}}>
<b>RAZZY STORE</b>
<input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,padding:8,borderRadius:6,border:"none"}}/>
<a href="/admin" style={{color:"white",fontSize:11,textDecoration:"none"}}>Admin</a>
</div>
</div>

<div style={{maxWidth:1000,margin:"0 auto",padding:12}}>
<div style={{background:"white",padding:12,borderRadius:8,marginBottom:12,display:"grid",gap:8}}>
<input placeholder="Your Name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} style={{padding:10,border:"1px solid #ddd",borderRadius:6}}/>
<input placeholder="Your Email" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} style={{padding:10,border:"1px solid #ddd",borderRadius:6}}/>
<input placeholder="Phone (for UK SIM)" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} style={{padding:10,border:"1px solid #ddd",borderRadius:6}}/>
</div>

<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:10}}>
{filtered.length===0&&<p>No products. Go to /admin to add. If you saw crash before, open /?clear first.</p>}
{filtered.map(p=>{
 const stockLines=p.type==="digital"? (p.delivery.split("\n\n").filter(l=>l.trim()).length || p.delivery.split("\n").filter(l=>l.trim()).length) : p.qty;
 const stockLeft=p.type==="digital"? stockLines : p.qty;
 const qty=getQty(p.id);
 return(
 <div key={p.id} style={{background:"white",borderRadius:10,overflow:"hidden",border:"1px solid #eee"}}>
 <div style={{position:"relative"}}><img src={p.img} style={{width:"100%",height:140,objectFit:"cover"}}/>{p.badge&&<span style={{position:"absolute",top:6,left:6,background:"#f68b1e",color:"white",fontSize:10,padding:"3px 6px",borderRadius:4}}>{p.badge}</span>}{stockLeft<=0&&<span style={{position:"absolute",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.7)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold"}}>SOLD OUT</span>}</div>
 <div style={{padding:8}}>
 <div style={{fontSize:12,fontWeight:"bold",height:32,overflow:"hidden"}}>{p.name}</div>
 <div style={{fontSize:10,color:"#666"}}>{p.type==="digital"?`${stockLeft} accounts left`:`Qty: ${p.qty}`} </div>
 <div style={{display:"flex",alignItems:"center",gap:6,margin:"6px 0"}}>
  <button onClick={()=>changeQty(p.id,-1,stockLeft)} style={{width:28,height:28,border:"1px solid #ddd",borderRadius:4}}>-</button>
  <span style={{fontSize:13,fontWeight:"bold"}}>{qty}</span>
  <button onClick={()=>changeQty(p.id,1,stockLeft)} style={{width:28,height:28,border:"1px solid #ddd",borderRadius:4}}>+</button>
  <span style={{marginLeft:"auto",fontWeight:"bold",fontSize:13}}>₦{(p.price*qty).toLocaleString()}</span>
 </div>
 <button onClick={()=>buyNow(p)} disabled={stockLeft<=0} style={{width:"100%",padding:9,background:stockLeft<=0?"#ccc":"black",color:"white",border:"none",borderRadius:6,fontWeight:"bold",fontSize:12}}>{stockLeft<=0?"SOLD OUT":`BUY ${qty} NOW`}</button>
 </div>
 </div>
 );
})}
</div>
</div>

{delivered&&(
<div style={{position:"fixed",top:0,left:0,right:0,bottom:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:15,overflow:"auto"}}>
<div style={{background:"white",padding:18,borderRadius:12,maxWidth:450,width:"100%"}}>
<h3 style={{marginTop:0,color:"green"}}>✅ Paid ₦{delivered.total.toLocaleString()}</h3>
<p style={{fontSize:13}}><b>{delivered.productName}</b> - Ref: {delivered.ref}</p>
<div style={{background:"#f0fff0",border:"1px solid #4CAF50",padding:10,borderRadius:8}}>
<p style={{margin:"0 0 6px",fontWeight:"bold",fontSize:12}}>Your Delivery (x{getQty(delivered.productName)}):</p>
<pre style={{background:"white",padding:10,borderRadius:6,whiteSpace:"pre-wrap",wordBreak:"break-all",fontSize:12,border:"1px dashed #ccc",maxHeight:200,overflow:"auto"}}>{delivered.text}</pre>
<button onClick={()=>{navigator.clipboard.writeText(delivered.text); alert("Copied!");}} style={{marginTop:8,width:"100%",padding:10,background:"#4CAF50",color:"white",border:"none",borderRadius:6,fontWeight:"bold"}}>COPY</button>
</div>
<button onClick={()=>setDelivered(null)} style={{width:"100%",padding:12,background:"black",color:"white",borderRadius:6,marginTop:10}}>Close</button>
</div>
</div>
)}
</div>
);
}
