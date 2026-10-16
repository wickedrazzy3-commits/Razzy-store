'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  {id:1, name:'UK WhatsApp Number', price:3000, oldPrice:4000, stock:20, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Number will be delivered instantly'},
  {id:2, name:'US Verified Paypal', price:5000, stock:15, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Logs delivered after payment'},
];

// 👇👇 PUT YOUR LIVE PUBLIC KEY HERE - REMOVE TEST KEY 👇👇
const PAYSTACK_PUBLIC_KEY = "pk_live_e53e70211b051a607dea27a34fe32091d35917c2";

export default function Home(){
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [qtys, setQtys] = useState({});
  const [wallet, setWallet] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [email, setEmail] = useState('');

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) setProducts(p); }
      const w = localStorage.getItem("razzy_wallet");
      if(w) setWallet(Number(w)||0);
      const td = localStorage.getItem("razzy_totalDeposited");
      if(td) setTotalDeposited(Number(td)||0);
      const tu = localStorage.getItem("razzy_totalUsed");
      if(tu) setTotalUsed(Number(tu)||0);
      const ti = localStorage.getItem("razzy_totalItems");
      if(ti) setTotalItems(Number(ti)||0);
      const em = localStorage.getItem("razzy_email");
      if(em) setEmail(em);
      // Load Paystack script
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      document.body.appendChild(script);
    }catch{}
  },[]);

  useEffect(()=>{ try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{} },[products]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_wallet", String(wallet)); }catch{} },[wallet]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalDeposited", String(totalDeposited)); }catch{} },[totalDeposited]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalUsed", String(totalUsed)); }catch{} },[totalUsed]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalItems", String(totalItems)); }catch{} },[totalItems]);

  const changeQty = (id, delta) => {
    setQtys(prev=>{
      const cur = prev[id]||1;
      const next = Math.max(1, Math.min(10, cur+delta));
      return {...prev, [id]: next};
    });
  };

  // REAL PAYSTACK DEPOSIT - NO MORE TEST KEY
  const handleDeposit = () => {
    const amt = Number(depositAmt);
    if(!amt || amt < 100) return alert("Enter minimum ₦100");
    if(!email ||!email.includes("@")) return alert("Enter valid email for Paystack receipt");
    const FEE = 50;
    if(amt <= FEE) return alert(`Minimum is ₦${FEE+100}`);
    if(!PAYSTACK_PUBLIC_KEY || PAYSTACK_PUBLIC_KEY.includes("YOUR_KEY_HERE")) return alert("Admin has not set LIVE Paystack public key yet!");
    if(!window.PaystackPop) return alert("Paystack loading... wait 2 secs and try again");

    localStorage.setItem("razzy_email", email);

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY, // LIVE KEY NOW
      email: email,
      amount: amt * 100, // kobo
      currency: "NGN",
      ref: "RAZZY_" + Date.now(),
      callback: function(response){
        const credit = amt - FEE;
        setWallet(prev=>prev+credit);
        setTotalDeposited(prev=>prev+amt);
        setDepositAmt('');
        setShowDeposit(false);
        alert(`REAL PAYMENT SUCCESS! Ref: ${response.reference}\nYou paid ₦${amt} - ₦${FEE} fee = ₦${credit} credited to wallet`);
      },
      onClose: function(){
        alert("Payment cancelled");
      }
    });
    handler.openIframe();
  };

  const handleBuy = async (product) => {
    const qty = qtys[product.id]||1;
    const total = product.price * qty;
    if(product.stock < qty) return alert(`Out of stock! Only ${product.stock} left`);
    if(wallet < total) return alert(`Insufficient! Have ₦${wallet} need ₦${total}. Deposit first.`);
    if(!confirm(`Buy ${product.name} x${qty} = ₦${total}?\nBalance after: ₦${wallet-total}`)) return;
    setWallet(prev=>prev-total);
    setTotalUsed(prev=>prev+total);
    setTotalItems(prev=>prev+qty);
    setProducts(prev=>prev.map(p=>p.id===product.id?{...p, stock: p.stock - qty}:p));
    alert(`Purchase Successful! Wallet: ₦${wallet-total}`);
  };

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{background:'black', color:'white', padding:12, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <b>RAZZY STORE - LIVE</b>
        <div style={{display:'flex', gap:10, alignItems:'center'}}>
          <div style={{background:'#222', padding:'6px 10px', borderRadius:6, fontSize:12}}>Wallet: <b style={{color:'#16a34a'}}>₦{wallet}</b></div>
          <button onClick={()=>setShowDeposit(true)} style={{background:'#16a34a', color:'white', border:0, padding:'8px 14px', borderRadius:6, fontSize:12, fontWeight:800}}>Deposit (Live)</button>
        </div>
      </div>

      <div style={{padding:12}}>
        <div style={{background:'white', borderRadius:12, padding:12, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, border:'1px solid #eee'}}>
          <div style={{background:'#f0fdf4', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>TOTAL DEPOSITED</div><div style={{fontSize:14, fontWeight:900, color:'#16a34a'}}>₦{totalDeposited}</div></div>
          <div style={{background:'#fef2f2', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>TOTAL USED</div><div style={{fontSize:14, fontWeight:900, color:'#dc2626'}}>₦{totalUsed}</div></div>
          <div style={{background:'#eff6ff', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>ITEMS BOUGHT</div><div style={{fontSize:14, fontWeight:900, color:'#2563eb'}}>{totalItems}</div></div>
        </div>
      </div>

      {showDeposit && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:360}}>
            <h3 style={{margin:0}}>Real Deposit - Paystack Live</h3>
            <p style={{fontSize:11, color:'green'}}>✓ LIVE MODE - Real money will enter your pre-approved Paystack</p>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Your email for receipt" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input type="number" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)} placeholder="Amount e.g 5000" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            {depositAmt && <div style={{fontSize:11, marginTop:8, background:'#f5f5f7', padding:8, borderRadius:6}}>Pay ₦{depositAmt} - ₦50 fee = <b>₦{Number(depositAmt)-50} credited</b></div>}
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={handleDeposit} style={{flex:1, background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800}}>Pay ₦{depositAmt||0} with Paystack Live</button>
              <button onClick={()=>setShowDeposit(false)} style={{flex:1, background:'#eee', padding:12, borderRadius:8, border:0}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div style={{padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12}}>
        {products.map(p=>(
          <div key={p.id} style={{background:'white', borderRadius:12, overflow:'hidden', border:'1px solid #eee', borderLeft:`4px solid ${p.type==='physical'?'#2563eb':'#16a34a'}`}}>
            <img src={p.img} style={{width:'100%', height:140, objectFit:'cover'}}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700, fontSize:13}}>{p.name}</div>
              <div style={{fontSize:12, marginTop:4}}><b>₦{p.price}</b></div>
              <div style={{fontSize:10, color: p.stock<3? 'red' : 'green'}}>Stock: {p.stock} - {p.type?.toUpperCase()}</div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8, justifyContent:'center', background:'#f5f5f7', borderRadius:6, padding:4}}>
                <button onClick={()=>changeQty(p.id,-1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4}}>-</button>
                <span style={{fontSize:12, fontWeight:700}}>{qtys[p.id]||1}</span>
                <button onClick={()=>changeQty(p.id,1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4}}>+</button>
              </div>
              <button onClick={()=>handleBuy(p)} style={{width:'100%', marginTop:8, background:'black', color:'white', border:0, padding:10, borderRadius:6, fontSize:12, fontWeight:800}}>Buy Now</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
