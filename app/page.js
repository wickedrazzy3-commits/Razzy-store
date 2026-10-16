'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  {id:1, name:'UK WhatsApp Number', price:3000, oldPrice:4000, stock:20, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Number will be delivered instantly'},
  {id:2, name:'US Verified Paypal', price:5000, stock:15, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Logs delivered after payment'},
];

export default function Home(){
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [qtys, setQtys] = useState({});
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) setProducts(p); }
      const c = localStorage.getItem("razzy_cart");
      if(c) setCart(JSON.parse(c));
    }catch{}
  },[]);

  useEffect(()=>{ try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{} },[products]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_cart", JSON.stringify(cart)); }catch{} },[cart]);

  const changeQty = (id, delta) => {
    setQtys(prev=>{
      const cur = prev[id]||1;
      const next = Math.max(1, Math.min(10, cur+delta));
      return {...prev, [id]: next};
    });
  };

  const handlePaystackDeposit = () => {
    const amt = prompt("Enter deposit amount:");
    if(!amt) return;
    alert("Paystack deposit ₦"+amt+" - Integrate Paystack here");
  };

  const handlePay = async (product) => {
    const qty = qtys[product.id]||1;
    if(product.stock < qty) return alert("Out of stock! Only "+product.stock+" left");

    // Reduce stock
    setProducts(prev=>prev.map(p=>p.id===product.id?{...p, stock: p.stock - qty}:p));

    alert(`Paid for ${product.name} x${qty} = ₦${product.price*qty}\n${product.delivery}`);
  };

  const addToCart = (product) => {
    const qty = qtys[product.id]||1;
    setCart(prev=>[...prev, {...product, cartQty: qty}]);
    alert("Added to cart");
  };

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh', paddingBottom:80}}>
      <div style={{background:'black', color:'white', padding:12, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <b>RAZZY STORE</b>
        <div style={{display:'flex', gap:10}}>
          <button onClick={handlePaystackDeposit} style={{background:'#16a34a', color:'white', border:0, padding:'6px 12px', borderRadius:6, fontSize:12}}>Deposit</button>
          <button onClick={()=>setShowCart(!showCart)} style={{background:'white', color:'black', border:0, padding:'6px 12px', borderRadius:6, fontSize:12}}>Cart ({cart.length})</button>
          <a href="/admin" style={{background:'#333', color:'white', padding:'6px 12px', borderRadius:6, fontSize:12, textDecoration:'none'}}>Admin</a>
        </div>
      </div>

      <div style={{padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12}}>
        {products.map(p=>(
          <div key={p.id} style={{background:'white', borderRadius:12, overflow:'hidden', border:'1px solid #eee'}}>
            <img src={p.img} style={{width:'100%', height:140, objectFit:'cover'}}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700, fontSize:13, height:32, overflow:'hidden'}}>{p.name}</div>
              <div style={{fontSize:12, marginTop:4}}><b>₦{p.price}</b> {p.oldPrice? <span style={{textDecoration:'line-through', color:'#888', fontSize:10}}>₦{p.oldPrice}</span> : null}</div>
              <div style={{fontSize:10, color: p.stock<5? 'red' : 'green', marginTop:2}}>Stock: {p.stock} left</div>

              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8, justifyContent:'center', background:'#f5f5f7', borderRadius:6, padding:4}}>
                <button onClick={()=>changeQty(p.id,-1)} style={{border:0, background:'white', width:24, height:24, borderRadius:4}}>-</button>
                <span style={{fontSize:12, fontWeight:700}}>{qtys[p.id]||1}</span>
                <button onClick={()=>changeQty(p.id,1)} style={{border:0, background:'white', width:24, height:24, borderRadius:4}}>+</button>
              </div>

              <button onClick={()=>handlePay(p)} style={{width:'100%', marginTop:8, background:'black', color:'white', border:0, padding:8, borderRadius:6, fontSize:12, fontWeight:700}}>Buy Now</button>
              <button onClick={()=>addToCart(p)} style={{width:'100%', marginTop:6, background:'white', border:'1px solid #ddd', padding:6, borderRadius:6, fontSize:11}}>Add to Cart</button>
            </div>
          </div>
        ))}
      </div>

      {showCart && (
        <div style={{position:'fixed', bottom:0, left:0, right:0, background:'white', borderTop:'1px solid #ddd', padding:12, maxHeight:'60vh', overflow:'auto', zIndex:20}}>
          <div style={{display:'flex', justifyContent:'space-between'}}><b>Cart ({cart.length})</b><button onClick={()=>setShowCart(false)}>X</button></div>
          {cart.map((c,i)=><div key={i} style={{display:'flex', justifyContent:'space-between', fontSize:12, marginTop:6}}><span>{c.name} x{c.cartQty}</span><span>₦{c.price*c.cartQty}</span></div>)}
        </div>
      )}
    </div>
  );
}
