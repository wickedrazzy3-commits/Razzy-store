'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  {id:1, name:'UK WhatsApp Number', price:3000, oldPrice:4000, stock:20, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Number will be delivered instantly'},
  {id:2, name:'US Verified Paypal', price:5000, stock:15, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Logs delivered after payment'},
];

export default function Home(){
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [qtys, setQtys] = useState({});
  const [wallet, setWallet] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) setProducts(p); }
      const w = localStorage.getItem("razzy_wallet");
      if(w) setWallet(Number(w)||0);
    }catch{}
  },[]);

  useEffect(()=>{ try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{} },[products]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_wallet", String(wallet)); }catch{} },[wallet]);

  const changeQty = (id, delta) => {
    setQtys(prev=>{
      const cur = prev[id]||1;
      const next = Math.max(1, Math.min(10, cur+delta));
      return {...prev, [id]: next};
    });
  };

  const handleDeposit = () => {
    const amt = Number(depositAmt);
    if(!amt || amt < 100) return alert("Enter minimum ₦100");
    // HERE you will put Paystack inline later. For now it adds directly after "payment"
    setWallet(prev=>prev+amt);
    setDepositAmt('');
    setShowDeposit(false);
    alert(`Deposit Successful! ₦${amt} added to wallet`);
  };

  const handleBuy = async (product) => {
    const qty = qtys[product.id]||1;
    const total = product.price * qty;
    if(product.stock < qty) return alert(`Out of stock! Only ${product.stock} left`);
    if(wallet < total) return alert(`Insufficient balance! You have ₦${wallet} but need ₦${total}. Please Deposit first.`);

    if(!confirm(`Buy ${product.name} x${qty} = ₦${total}?\nBalance after: ₦${wallet-total}`)) return;

    setWallet(prev=>prev-total);
    setProducts(prev=>prev.map(p=>p.id===product.id?{...p, stock: p.stock - qty}:p));
    alert(`Purchase Successful!\n${product.name}\n${product.delivery}\nWallet Balance: ₦${wallet-total}`);
  };

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      {/* HEADER - No Admin Button */}
      <div style={{background:'black', color:'white', padding:12, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <b style={{letterSpacing:1}}>RAZZY STORE</b>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{background:'#222', padding:'6px 10px', borderRadius:6, fontSize:12}}>Wallet: <b style={{color:'#16a34a'}}>₦{wallet}</b></div>
          <button onClick={()=>setShowDeposit(true)} style={{background:'#16a34a', color:'white', border:0, padding:'8px 14px', borderRadius:6, fontSize:12, fontWeight:800}}>Deposit</button>
        </div>
      </div>

      {/* DEPOSIT MODAL */}
      {showDeposit && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:340}}>
            <h3 style={{margin:0}}>Deposit to Wallet</h3>
            <p style={{fontSize:12, color:'#666'}}>You must deposit before you can buy. Deposit with Paystack.</p>
            <input type="number" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)} placeholder="Amount e.g 5000" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={handleDeposit} style={{flex:1, background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800}}>Pay with Paystack</button>
              <button onClick={()=>setShowDeposit(false)} style={{flex:1, background:'#eee', padding:12, borderRadius:8, border:0}}>Cancel</button>
            </div>
            <p style={{fontSize:10, color:'#888', marginTop:10}}>Test mode: Money adds instantly. When you add real Paystack, replace handleDeposit with Paystack popup.</p>
          </div>
        </div>
      )}

      {/* PRODUCTS */}
      <div style={{padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12}}>
        {products.map(p=>(
          <div key={p.id} style={{background:'white', borderRadius:12, overflow:'hidden', border:'1px solid #eee'}}>
            <img src={p.img} style={{width:'100%', height:140, objectFit:'cover', background:'#fff'}}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700, fontSize:13, height:32, overflow:'hidden'}}>{p.name}</div>
              <div style={{fontSize:12, marginTop:4}}><b>₦{p.price}</b> {p.oldPrice? <span style={{textDecoration:'line-through', color:'#888', fontSize:10}}> ₦{p.oldPrice}</span> : null}</div>
              <div style={{fontSize:10, color: p.stock<3? 'red' : 'green', marginTop:2}}>Stock: {p.stock} left</div>

              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8, justifyContent:'center', background:'#f5f5f7', borderRadius:6, padding:4}}>
                <button onClick={()=>changeQty(p.id,-1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4, fontWeight:700}}>-</button>
                <span style={{fontSize:12, fontWeight:700, minWidth:20, textAlign:'center'}}>{qtys[p.id]||1}</span>
                <button onClick={()=>changeQty(p.id,1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4, fontWeight:700}}>+</button>
              </div>

              <button onClick={()=>handleBuy(p)} style={{width:'100%', marginTop:8, background:'black', color:'white', border:0, padding:10, borderRadius:6, fontSize:12, fontWeight:800}}>Buy Now</button>
              <div style={{fontSize:9, color:'#888', marginTop:4, textAlign:'center'}}>Wallet must have ₦{p.price*(qtys[p.id]||1)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
