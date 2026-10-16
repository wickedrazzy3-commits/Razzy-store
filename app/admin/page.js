"use client";
import { useState, useEffect } from "react";

export default function Shop(){
const PAYSTACK_KEY="pk_live_e53e70211b051a607dea27a34fe32091d35917c2";
const [products,setProducts]=useState([]);
const [search,setSearch]=useState("");
const [showPay,setShowPay]=useState(null);
const [delivered,setDelivered]=useState(null);
const [customer,setCustomer]=useState({name:"",email:"",phone:""});

useEffect(()=>{
 const s=localStorage.getItem("razzy_products");
 if(s) setProducts(JSON.parse(s));
 const script=document.createElement("script");
 script.src="https://js.paystack.co/v1/inline.js";
 document.body.appendChild(script);
},[]);

useEffect(()=>{localStorage.setItem("razzy_products",JSON.stringify(products));},[products]);

const filtered=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));

const buyNow=(product)=>{
 if(product.qty<=0) return alert("Sold out");
 if(!customer.name||!customer.email) return alert("Enter your name & email first");
 if(product.type==="digital"){
   const lines=product.delivery? product.delivery.split("\n").filter(l=>l.trim()!=="") : [];
   if(lines.length===0) return alert("This digital product has no delivery stock. Contact admin.");
 }

 const handler=window.PaystackPop.setup({
  key:PAYSTACK_KEY,
  email:customer.email,
  amount:product.price*100,
  currency:"NGN",
  metadata:{custom_fields:[{display_name:"Product",variable_name:"product",value:product.name}]},
  callback:function(response){
    // PAYMENT SUCCESS - DELIVER 1
    let deliveryText="";
    let newProducts=[...products];
    let idx=newProducts.findIndex(p=>p.id===product.id);
    if(idx>-1){
      if(newProducts[idx].type==="digital"){
        let lines=newProducts[idx].delivery.split("\n").filter(l=>l.trim()!=="");
        deliveryText=lines[0]; // Give first line
        let remaining=lines.slice(1).join("\n");
        newProducts[idx].delivery=remaining;
        newProducts[idx].qty=Math.max(0,newProducts[idx].qty-1);
      } else {
        deliveryText="Order Received! We will contact you for delivery. Phone: "+customer.phone;
        newProducts[idx].qty=Math.max(0,newProducts[idx].qty-1);
      }
      setProducts(newProducts);
      // Save order history
      const orders=JSON.parse(localStorage.getItem("razzy_orders")||"[]");
      orders.push({id:Date.now(),product:product.name,price:product.price,customer,delivery:deliveryText,ref:response.reference,date:new Date().toLocaleString()});
      localStorage.setItem("razzy_orders",JSON.stringify(orders));
    }
    setDelivered({productName:product.name,text:deliveryText,ref:response.reference});
    setShowPay(null);
  },
  onClose:function(){alert("Payment closed");},
 });
 handler.openIframe();
};

return(
<div style={{fontFamily:"sans-serif",background:"#f5f5f5",minHeight:"100vh"}}>
<div style={{background:"black",color:"white",padding:15,position:"sticky",top:0,zIndex:10}}>
<div style={{maxWidth:1000,margin:"0 auto",display:"flex",gap:10,alignItems:"center"}}>
<b style={{fontSize:18}}>RAZZY STORE</b>
<input placeholder="Search product..." value={search} onChange={e=>setSearch(e.target.value)} style={{flex:1,padding:10,borderRadius:6,border:"none"}}/>
<a href="/admin" style={{color:"white",fontSize:12}}>Admin</a>
</div>
</div>

<div style={{maxWidth:1000,margin:"0 auto",
