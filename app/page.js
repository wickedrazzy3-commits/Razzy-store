"use client";
import { useState, useEffect } from "react";

export default function Shop(){
const PAYSTACK_KEY="pk_live_e53e70211b051a607dea27a34fe32091d35917c2";
const WA_NUMBER="2340000000000";
const [products,setProducts]=useState([]);
const [search,setSearch]=useState("");
const [delivered,setDelivered]=useState(null);
const [customer,setCustomer]=useState({name:"",email:"",phone:""});
const [qtys,setQtys]=useState({});
const [currentUser,setCurrentUser]=useState(null);

useEffect(()=>{
 if(window.location.search.includes("clear")){
   localStorage.removeItem("razzy_products");
   localStorage.removeItem("razzy_orders");
   alert("Cleared! Go to /");
   window.location.href="/";
   return;
 }
 try{
   const s=localStorage.getItem("razzy_products");
   if(s){ const p=JSON.parse(s); if(Array.isArray(p)) setProducts(p); }
   const cur=localStorage.getItem("razzy_current");
   if(cur){ const u=JSON.parse(cur); setCurrentUser(u); setCustomer({name:u.name||"",email:u.email||"",phone:""}); }
 }catch(e){ localStorage.removeItem("razzy_products"); }
 const sc=document.createElement("script");
 sc.src="https://js.paystack.co/v1/inline.js";
 document.body.appendChild(sc);
},[]);

useEffect(()=>{ try{ localStorage.setItem("razzy_products",JSON.stringify(products)); }catch(e){} },[products]);

const filtered=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
const getQty=(id)=> qtys[id]||1;
const changeQty=(id,delta,stock)=>{
 let n=(qtys[id]||1)+delta; if(n<1) n=1; if(n>stock) n=stock; setQtys({...qtys,[id]:n});
};
const logout=()=>{ localStorage.removeItem("razzy_current"); setCurrentUser(null); window.location.reload(); };

const buyNow=(product)=>{
 const buyCount=getQty(product.id);
 if(product.qty<=0) return alert("Sold out");
 if(!customer.name||!customer.email) return alert("Enter name & email");
 let lines=[];
 if(product.type==="digital"){
   let blocks=product.delivery.split("\n\n").filter(l=>l.trim()!=="");
   if(blocks.length<=1) blocks=product.delivery.split("\n").filter(l=>l.trim()!=="").length>=buyCount? product.delivery.split("\n").filter(l=>l.trim()!=="") : blocks;
   if(blocks.length<buyCount) return alert(`Only ${blocks.length} left, you asked ${buyCount}`);
 }
 const total=product.price*buyCount;
 const handler=window.PaystackPop.setup({
  key:PAYSTACK_KEY, email:customer.email, amount:total*100, currency:"NGN",
  metadata:{custom_fields:[{display_name:"Product",variable_name:"product",value:product.name+" x"+buyCount}]},
  callback:function(res){
    let text=""; let newP=[...products]; let idx=newP.findIndex(p=>p.id===product.id);
    if(idx>-1){
      let blocks=newP[idx].delivery.split("\n\n").filter(l=>l.trim()!=="");
      let isDouble=blocks.length>1;
      if(isDouble){
        text=blocks.slice(0,buyCount).join("\n\n");
        newP[idx].delivery=blocks.slice(buyCount).join("\n\n");
      } else {
        let raw=newP[idx].delivery.split("\n").filter(l=>l.trim()!=="");
        text=raw.slice(0,buyCount).join("\n");
        newP[idx].delivery=raw.slice(buyCount).join("\n");
      }
      if(newP[idx].type==="physical") text=`PHYSICAL: ${product.name} x${buyCount} - We will call ${customer.phone} for delivery.`;
      newP[idx].qty=Math.max(0,newP[idx].qty-buyCount);
      setProducts(newP);
      const orders=JSON.parse(localStorage.getItem("razzy_orders")||"[]");
      orders.push({id:Date.now(),product:product.name+" x"+buyCount,price:total,customer,delivery:text,ref:res.reference,date:new Date().toLocaleString(),user:currentUser?.email||"guest"});
      localStorage.setItem("razzy_orders",JSON.stringify(orders));
    }
    setDelivered({productName:product.name+" x"+buyCount,total,text,ref:res.reference});
  },
  onClose:()=>{},
 });
 handler.openIframe();
};

return(
<div style={{fontFamily:"sans-serif",background:"#f5f5f5",minHeight:"100vh"}}>
<div style={{background:"black",color:"white",padding:10,position:"sticky",top:0,zIndex:10}}>
<div style={{maxWidth:1000,margin:"0 auto",display:"flex",gap:6,alignItems:"center",flexWrap:"wrap"}}>
<b style={{fontSize:14}}>RAZZY STORE</b>
<input placeholder="Search..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,padding:7,borderRadius:6,border:"none",minWidth:100,fontSize:13}}/>
<a href="/support" style={{color:"#25D366",fontSize:10,background:"white",padding:"5px 7px",borderRadius:4,textDecoration:"none",fontWeight:"bold"}}>Support</a>
{currentUser?(
<>
<span style={{fontSize:10}}>Hi {currentUser.name?.split(" ")[0]}</span>
<button onClick={logout} style={{fontSize:10,background:"#333",color:"white",border:"none",padding:"5px 7px",borderRadius:4}}>Logout</button>
</>
):(
<>
<a href="/login" style={{color:"white",fontSize:10,textDecoration:"none",border:"1px solid #444",padding:"5px 7px",borderRadius:4}}>Login</a>
<a href="/signup" style={{color:"black",fontSize:10,textDecoration:"none",background:"white",padding:"5px 7px",borderRadius:4,fontWeight:"bold"}}>SignUp</a>
</>
)}
<a href="/admin" style={{color:"#666",fontSize:10,textDecoration:"none"}}>Admin</a>
</div>
</div>

<div style={{maxWidth:1000,margin:"0 auto",padding:10}}>
<div style={{background:"white",padding:10,borderRadius:8,marginBottom:10,display:"grid",gap:6}}>
<div style={{fontSize:11,fontWeight:"bold"}}>{currentUser?`Logged as ${currentUser.email}`:"Guest Checkout - Enter details:"}</div>
<input placeholder="Your Name" value={customer.name} onChange={e=>setCustomer({...customer,name:e.target.value})} style={{padding:9,border:"1px solid #ddd",borderRadius:6,fontSize:13}}/>
<input placeholder="Your Email" value={customer.email} onChange={e=>setCustomer({...customer,email:e.target.value})} style={{padding:9,border:"1px solid #ddd",borderRadius:6,fontSize:13}}/>
<input placeholder="Phone (for UK SIM delivery)" value={customer.phone} onChange={e=>setCustomer({...customer,phone:e.target.value})} style={{padding:9,border:"1px solid #ddd",borderRadius:6,fontSize:13}}/>
</div>

<div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(160px,1fr))",gap:9}}>
{filtered.length===0&&<p style={{fontSize:13}}>No products yet. Add in /admin. If crash, open /?clear</p>}
{filtered.map(p=>{
 const blocks=p.delivery.split("\n\n").filter(l=>l.trim()!=="");
 const raw=p.delivery.split("\n").filter(l=>l.trim()!=="");
 const stockLeft=p.type==="digital"? (blocks.length>1?blocks.length:raw.length) : p.qty;
 const qty=getQty(p.id);
 return(
 <div key={p.id} style={{background:"white",borderRadius:10,overflow:"hidden",border:"1px solid #eee"}}>
 <div style={{position:"relative"}}><img src={p.img} style={{width:"100%",height:135,objectFit:"cover"}}/>{p.badge&&<span style={{position:"absolute",top:5,left:5,background:"#f68b1e",color:"white",fontSize:9,padding:"2px 5px",borderRadius:4}}>{p.badge}</span>}{stockLeft<=0&&<span style={{position:"absolute",inset:0,background:"rgba(0,0,0,0.7)",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:"bold",fontSize:12}}>SOLD OUT</span>}</div>
 <div style={{padding:7}}>
 <div style={{fontSize:11,fontWeight:"bold",height:30,overflow:"hidden"}}>{p.name}</div>
 <div style={{fontSize:9,color:"#666",marginBottom:4}}>{p.type==="digital"?`${stockLeft} accounts left`:`Stock: ${p.qty}`} | ₦{p.price.toLocaleString()} each</div>
 <div style={{display:"flex",alignItems:"center",gap:5,margin:"5px 0"}}>
  <button onClick={()=>changeQty(p.id,-1,stockLeft)} style={{width:26,height:26,border:"1px solid #ddd",borderRadius:4,background:"white"}}>-</button>
  <span style={{fontSize:12,fontWeight:"bold"}}>{qty}</span>
  <button onClick={()=>changeQty(p.id,1,stockLeft)} style={{width:26,height:26,border:"1px solid #ddd",borderRadius:4,background:"white"}}>+</button>
  <span style={{marginLeft:"auto",fontWeight:"bold",fontSize:11}}>₦{(p.price*qty).toLocaleString()}</span>
 </div>
 <button onClick={()=>buyNow(p)} disabled={stockLeft<=0} style={{width:"100%",padding:8,background:stockLeft<=0?"#ccc":"black",color:"white",border:"none",borderRadius:6,fontWeight:"bold",fontSize:11}}>{stockLeft<=0?"SOLD OUT":`BUY ${qty} - ₦${(p.price*qty).toLocaleString()}`}</button>
 </div>
 </div>
 );
})}
</div>
</div>

{delivered&&(
<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",display:"flex",alignItems:"center",justifyContent:"center",zIndex:100,padding:12,overflow:"auto"}}>
<div style={{background:"white",padding:16,borderRadius:12,maxWidth:420,width:"100%"}}>
<h3 style={{marginTop:0,color:"green",fontSize:15}}>✅ Paid ₦{delivered.total.toLocaleString()}</h3>
<p style={{fontSize:11}}><b>{delivered.productName}</b> - {delivered.ref}</p>
<div style={{background:"#f0fff0",border:"1px solid #4CAF50",padding:9,borderRadius:8}}>
<pre style={{background:"white",padding:9,borderRadius:6,whiteSpace:"pre-wrap",wordBreak:"break-all",fontSize:11,border:"1px dashed #ccc",maxHeight:180,overflow:"auto"}}>{delivered.text}</pre>
<button onClick={()=>{navigator.clipboard.writeText(delivered.text); alert("Copied!");}} style={{marginTop:7,width:"100%",padding:9,background:"#4CAF50",color:"white",border:"none",borderRadius:6,fontWeight:"bold",fontSize:12}}>COPY DELIVERY</button>
</div>
<button onClick={()=>setDelivered(null)} style={{width:"100%",padding:11,background:"black",color:"white",borderRadius:6,marginTop:10,fontSize:13}}>Close</button>
</div>
</div>
)}

<a href={`https://wa.me/${WA_NUMBER}?text=Hello%20Razzy%20Store`} target="_blank" style={{position:"fixed",bottom:18,right:18,background:"#25D366",color:"white",width:54,height:54,borderRadius:"50%",display:"flex",alignItems:"center",justifyContent:"center",fontSize:26,textDecoration:"none",boxShadow:"0 4px 12px rgba(0,0,0,0.3)",zIndex:50}}>💬</a>
</div>
);
}
