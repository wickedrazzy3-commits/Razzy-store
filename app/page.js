"use client";
import { useState, useEffect } from "react";

const PAYSTACK_KEY="pk_test_xxxxxxx"; // <- put your real pk_live_ here later

const defaultProducts=[
 {id:1,name:"UK Physical SIM - Ready for WhatsApp",price:15000,oldPrice:18000,type:"physical",img:"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400",badge:"Bestseller"},
 {id:2,name:"USA T-Mobile SIM - 5G Unlimited",price:20000,oldPrice:25000,type:"physical",img:"https://images.unsplash.com/photo-1581993192872-14d6f2e1e0d4?w=400",badge:"New"},
 {id:3,name:"Voice Changer Device - 8 Voices Live",price:35000,oldPrice:45000,type:"physical",img:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400",badge:"Hot"},
 {id:4,name:"Aged TikTok Account 1k Followers + Live",price:12000,oldPrice:15000,type:"digital",img:"https://images.unsplash.com/photo-1611162616475-46b76543ac5f?w=400",badge:"Digital"},
 {id:5,name:"Monetized YouTube Channel",price:50000,oldPrice:70000,type:"digital",img:"https://images.unsplash.com/photo-1611162616305-c69b3fa7fbe0?w=400",badge:"Premium"},
 {id:6,name:"USA Instagram + Original Email",price:8000,oldPrice:10000,type:"digital",img:"https://images.unsplash.com/photo-1611262588024-d12430b98920?w=400",badge:"Digital"},
];

export default function Page(){
 const [cart,setCart]=useState([]);
 const [filter,setFilter]=useState("all");
 const [search,setSearch]=useState("");
 const [showCart,setShowCart]=useState(false);
 const [PRODUCTS,setPRODUCTS]=useState(defaultProducts);

 // THIS IS THE PART YOU ASKED - It reads from admin!
 useEffect(()=>{
   const saved=localStorage.getItem("razzy_products");
   if(saved){try{setPRODUCTS(JSON.parse(saved));}catch(e){}}
 },[]);

 const filtered=PRODUCTS.filter(p=>{
   if(filter!=="all"&&p.type!==filter)return false;
   if(search&&!p.name.toLowerCase().includes(search.toLowerCase()))return false;
   return true;
 });
 const addToCart=(p)=>{setCart([...cart,p]);setShowCart(true);};
 const total=cart.reduce((s,i)=>s+i.price,0);
 const pay=()=>{
   if(typeof window.PaystackPop==="undefined"){alert("Paystack loading, wait 2 sec");return;}
   const h=window.PaystackPop.setup({
     key:PAYSTACK_KEY,email:"customer@razzystore.com",amount:total*100,currency:"NGN",
     callback:()=>{alert("Payment Success! Send proof on WhatsApp");setCart([]);setShowCart(false);},
     onClose:()=>{}
   });h.openIframe();
 };

 return(
 <>
 <script src="https://js.paystack.co/v1/inline.js"></script>
 <div style={{background:"#f5f5f5",minHeight:"100vh",fontFamily:"sans-serif"}}>
  <div style={{background:"white",position:"sticky",top:0,zIndex:10,boxShadow:"0 2px 5px rgba(0,0,0,0.1)"}}>
   <div style={{background:"#f68b1e",padding:8,textAlign:"center",color:"white",fontWeight:"bold"}}>RAZZY STORE - #1 SIM & SOCIAL PLUG</div>
   <div style={{display:"flex",alignItems:"center",padding:"12px 15px",gap:10}}>
    <b style={{fontSize:22}}>RAZZY<span style={{color:"#f68b1e"}}>STORE</span></b>
    <div style={{flex:1,display:"flex",border:"1px solid #ddd",borderRadius:4,overflow:"hidden",marginLeft:10}}>
     <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search SIM, TikTok..." style={{flex:1,padding:10,border:"none",outline:"none"}}/>
     <button style={{background:"#f68b1e",color:"white",border:"none",padding:"0 20px",fontWeight:"bold"}}>SEARCH</button>
    </div>
    <button onClick={()=>setShowCart(true)} style={{background:"none",border:"none",fontSize:20,position:"relative"}}>🛒<span style={{position:"absolute",top:-8,right:-8,background:"#f68b1e",color:"white",borderRadius:"50%",fontSize:12,padding:"2px 6px"}}>{cart.length}</span></button>
   </div>
  </div>
  <div style={{display:"flex",gap:10,padding:"10px 15px"}}>{["all","physical","digital"].map(f=><button key={f} onClick={()=>setFilter(f)} style={{padding:"8px 18px",borderRadius:20,border:"none",background:filter===f?"#f68b1e":"white",color:filter===f?"white":"black",fontWeight:"bold"}}>{f}</button>)}</div>
  <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,padding:"10px 15px"}}>{filtered.map(p=><div key={p.id} style={{background:"white",borderRadius:8,overflow:"hidden"}}><img src={p.img} style={{width:"100%",height:150,objectFit:"cover"}}/><div style={{padding:8}}><div style={{fontSize:12,height:32,overflow:"hidden"}}>{p.name}</div><div style={{fontWeight:"bold",marginTop:6}}>₦{p.price.toLocaleString()}</div><button onClick={()=>addToCart(p)} style={{width:"100%",marginTop:8,background:"#f68b1e",color:"white",border:"none",padding:8,borderRadius:4,fontWeight:"bold"}}>ADD TO CART</button></div></div>)}</div>
  {showCart&&<div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.5)",zIndex:20,display:"flex",justifyContent:"flex-end"}}><div style={{background:"white",width:"85%",maxWidth:400,padding:20}}><div style={{display:"flex",justifyContent:"space-between"}}><h3>Cart ({cart.length})</h3><button onClick={()=>setShowCart(false)}>✕</button></div>{cart.map((c,i)=><div key={i} style={{display:"flex",justifyContent:"space-between",padding:"10px 0",borderBottom:"1px solid #eee"}}><span style={{fontSize:13}}>{c.name}</span><b>₦{c.price.toLocaleString()}</b></div>)}<div style={{fontWeight:"bold",marginTop:15}}>Total: ₦{total.toLocaleString()}</div><button onClick={pay} style={{width:"100%",background:"#00b517",color:"white",border:"none",padding:14,borderRadius:4,marginTop:15,fontWeight:"bold"}}>PAY WITH PAYSTACK</button><a href={`https://wa.me/2348030000000?text=Hi Razzy I want ${cart.map(c=>c.name).join(", ")}`} style={{display:"block",textAlign:"center",marginTop:10,background:"#25D366",color:"white",padding:12,borderRadius:4,textDecoration:"none",fontWeight:"bold"}}>ORDER ON WHATSAPP</a></div></div>}
 </div>
 </>
 );
}
