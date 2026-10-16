'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  {id:1, name:'UK WhatsApp Number', price:3000, oldPrice:4000, stock:20, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Number will be delivered instantly', logs:["Username:- uk123\nPassword:- pass123\n2fa:- 123456\nHow to login:- Use VPN"]},
];

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
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [addressData, setAddressData] = useState({fullName:'', phone:'', address:'', city:'', note:''});

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) setProducts(p); }
      const w = localStorage.getItem("razzy_wallet"); if(w) setWallet(Number(w)||0);
      const td = localStorage.getItem("razzy_totalDeposited"); if(td) setTotalDeposited(Number(td)||0);
      const tu = localStorage.getItem("razzy_totalUsed"); if(tu) setTotalUsed(Number(tu)||0);
      const ti = localStorage.getItem("razzy_totalItems"); if(ti) setTotalItems(Number(ti)||0);
      const em = localStorage.getItem("razzy_email"); if(em) setEmail(em);
      const ord = localStorage.getItem("razzy_orders"); if(ord) setOrders(JSON.parse(ord));
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      document.body.appendChild(script);
    }catch{}
  },[]);

  useEffect(()=>{ localStorage.setItem("razzy_products", JSON.stringify(products)); },[products]);
  useEffect(()=>{ localStorage.setItem("razzy_wallet", String(wallet)); },[wallet]);
  useEffect(()=>{ localStorage.setItem("razzy_totalDeposited", String(totalDeposited)); },[totalDeposited]);
  useEffect(()=>{ localStorage.setItem("razzy_totalUsed", String(totalUsed)); },[totalUsed]);
  useEffect(()=>{ localStorage.setItem("razzy_totalItems", String(totalItems)); },[totalItems]);
  useEffect(()=>{ localStorage.setItem("razzy_orders", JSON.stringify(orders)); },[orders]);

  // FIXED: Cannot buy more than available stock
  const changeQty = (id, delta) => {
    const product = products.find(p=>p.id===id);
    const available = product? (product.type==='digital'? (product.logs?.length||product.stock) : product.stock) : 10;
    setQtys(prev=>{
      const cur=prev[id]||1;
      let next = cur+delta;
      if(next < 1) next = 1;
      if(next > available){
        if(cur < available) next = available;
        else { alert(`Only ${available} available for ${product?.name}!`); return prev; }
      }
      return {...prev,[id]:next};
    });
  };

  const handleDeposit = () => {
    const amt = Number(depositAmt);
    if(!amt || amt < 100) return alert("Enter minimum ₦100");
    if(!email ||!email.includes("@")) return alert("Enter valid email");
    const FEE = 50;
    if(amt <= FEE) return alert(`Minimum is ₦${FEE+100}`);
    if(!window.PaystackPop) return alert("Paystack loading... wait 2 secs");
    localStorage.setItem("razzy_email", email);
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: email,
      amount: amt * 100,
      currency: "NGN",
      ref: "RAZZY_" + Date.now(),
      callback: function(response){
        const credit = amt - FEE;
        setWallet(prev=>prev+credit);
        setTotalDeposited(prev=>prev+amt);
        setDepositAmt(''); setShowDeposit(false);
        alert(`SUCCESS! Ref: ${response.reference}\nPaid ₦${amt} - ₦${FEE} = ₦${credit} credited`);
      },
      onClose: function(){ alert("Payment cancelled"); }
    });
    handler.openIframe();
  };

  // FIXED: Check stock before buy
  const startBuy = (product) => {
    const qty = qtys[product.id]||1;
    const available = product.type==='digital'? (product.logs?.length||0) : product.stock;
    const total = product.price * qty;
    if(available <=0) return alert(`OUT OF STOCK! ${product.name} sold out`);
    if(qty > available) return alert(`Cannot buy ${qty}. Only ${available} left for ${product.name}`);
    if(wallet < total) return alert(`Insufficient! Have ₦${wallet} need ₦${total}. Deposit first.`);
    if(product.type==='physical'){
      setPendingProduct({product, qty, total});
      setShowAddressForm(true);
    } else {
      confirmBuyDigital(product, qty, total);
    }
  };

  const confirmBuyDigital = (product, qty, total) => {
    if(!confirm(`Buy ${product.name} x${qty} = ₦${total}?\nBalance after: ₦${wallet-total}`)) return;
    const availableLogs = product.logs || [];
    const boughtLogs = availableLogs.slice(0, qty);
    const remainingLogs = availableLogs.slice(qty);
    const newOrder = {id: Date.now(), productName: product.name, price: product.price, qty, total, type: 'digital', logs: boughtLogs, date: new Date().toLocaleString(), img: product.img};
    setOrders(prev=>[newOrder,...prev]);
    setWallet(prev=>prev-total);
    setTotalUsed(prev=>prev+total);
    setTotalItems(prev=>prev+qty);
    setProducts(prev=>prev.map(p=>p.id===product.id?{...p, logs: remainingLogs, stock: remainingLogs.length}:p));
    alert(`Digital Success! Check My Orders to copy logs`);
  };

  const confirmBuyPhysical = () => {
    if(!addressData.fullName ||!addressData.phone ||!addressData.address) return alert("Fill Full Name, Phone, Address");
    const {product, qty, total} = pendingProduct;
    if(!confirm(`Buy ${product.name} x${qty} = ₦${total} to ${addressData.address}?`)) return;
    const newOrder = {id: Date.now(), productName: product.name, price: product.price, qty, total, type: 'physical', address: {...addressData}, date: new Date().toLocaleString(), img: product.img, status: 'Processing - Will be shipped'};
    setOrders(prev=>[newOrder,...prev]);
    setWallet(prev=>prev-total);
    setTotalUsed(prev=>prev+total);
    setTotalItems(prev=>prev+qty);
    setProducts(prev=>prev.map(p=>p.id===product.id?{...p, stock: p.stock - qty}:p));
    setShowAddressForm(false); setAddressData({fullName:'', phone:'', address:'', city:'', note:''}); setPendingProduct(null);
    alert(`Physical Order Placed! Check My Orders`);
  };

  const copyLog = (logText) => { navigator.clipboard.writeText(logText); alert("Copied!"); };

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{background:'black', color:'white', padding:12, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <b>RAZZY STORE</b>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <div style={{background:'#222', padding:'6px 10px', borderRadius:6, fontSize:11}}>Wallet: <b style={{color:'#16a34a'}}>₦{wallet}</b></div>
          <button onClick={()=>setShowOrders(true)} style={{background:'white', color:'black', border:0, padding:'6px 10px', borderRadius:6, fontSize:11, fontWeight:800}}>My Orders ({orders.length})</button>
          <button onClick={()=>setShowDeposit(true)} style={{background:'#16a34a', color:'white', border:0, padding:'6px 10px', borderRadius:6, fontSize:11, fontWeight:800}}>Deposit</button>
        </div>
      </div>

      <div style={{padding:12}}>
        <div style={{background:'white', borderRadius:12, padding:12, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, border:'1px solid #eee'}}>
          <div style={{background:'#f0fdf4', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>DEPOSITED</div><div style={{fontSize:13, fontWeight:900, color:'#16a34a'}}>₦{totalDeposited}</div></div>
          <div style={{background:'#fef2f2', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>USED</div><div style={{fontSize:13, fontWeight:900, color:'#dc2626'}}>₦{totalUsed}</div></div>
          <div style={{background:'#eff6ff', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>ITEMS</div><div style={{fontSize:13, fontWeight:900, color:'#2563eb'}}>{totalItems}</div></div>
        </div>
      </div>

      {showDeposit && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:360}}>
            <h3 style={{margin:0}}>Real Deposit - Live</h3>
            <p style={{fontSize:11, color:'green'}}>✓ Live Paystack</p>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input type="number" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)} placeholder="Amount" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            {depositAmt && <div style={{fontSize:11, marginTop:8, background:'#f5f5f7', padding:8, borderRadius:6}}>Pay ₦{depositAmt} - ₦50 = <b>₦{Number(depositAmt)-50} credited</b></div>}
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={handleDeposit} style={{flex:1, background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800}}>Pay with Paystack</button>
              <button onClick={()=>setShowDeposit(false)} style={{flex:1, background:'#eee', padding:12, borderRadius:8, border:0}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddressForm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:380}}>
            <h3 style={{margin:0}}>Delivery Details</h3>
            <p style={{fontSize:11, color:'#666'}}>Buying: {pendingProduct?.product.name} x{pendingProduct?.qty} = ₦{pendingProduct?.total}</p>
            <input value={addressData.fullName} onChange={e=>setAddressData({...addressData, fullName:e.target.value})} placeholder="Full Name" style={{width:'100%', padding:10, marginTop:10, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input value={addressData.phone} onChange={e=>setAddressData({...addressData, phone:e.target.value})} placeholder="Phone" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input value={addressData.address} onChange={e=>setAddressData({...addressData, address:e.target.value})} placeholder="Full Address" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input value={addressData.city} onChange={e=>setAddressData({...addressData, city:e.target.value})} placeholder="City / State" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <textarea value={addressData.note} onChange={e=>setAddressData({...addressData, note:e.target.value})} placeholder="Note" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box', height:60}}/>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={confirmBuyPhysical} style={{flex:1, background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800}}>Confirm Pay ₦{pendingProduct?.total}</button>
              <button onClick={()=>setShowAddressForm(false)} style={{flex:1, background:'#eee', padding:12, borderRadius:8, border:0}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showOrders && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:70, padding:12}}>
          <div style={{background:'white', padding:16, borderRadius:12, width:'100%', maxWidth:500, maxHeight:'85vh', display:'flex', flexDirection:'column'}}>
            <div style={{display:'flex', justifyContent:'space-between'}}><h3 style={{margin:0}}>My Orders</h3><button onClick={()=>setShowOrders(false)} style={{background:'#eee', border:0, padding:'6px 10px', borderRadius:6}}>X</button></div>
            <div style={{marginTop:12, overflow:'auto', flex:1}}>
              {orders.length===0? <div style={{textAlign:'center', color:'#888', padding:20, fontSize:12}}>No purchases yet</div> :
                orders.map(order=>(
                  <div key={order.id} style={{border:'1px solid #eee', borderRadius:8, padding:10, marginTop:10, borderLeft:`4px solid ${order.type==='physical'?'#2563eb':'#16a34a'}`}}>
                    <div style={{display:'flex', gap:10}}><img src={order.img} style={{width:50, height:50, borderRadius:6, objectFit:'cover'}}/><div style={{flex:1}}><div style={{fontWeight:800, fontSize:12}}><span style={{background:order.type==='physical'?'#dbeafe':'#dcfce7', padding:'2px 5px', borderRadius:4, fontSize:9, marginRight:4}}>{order.type.toUpperCase()}</span>{order.productName} x{order.qty}</div><div style={{fontSize:11, color:'#666'}}>{order.date} - ₦{order.total}</div></div></div>
                    {order.type==='digital'? (
                      <div style={{marginTop:8}}>{order.logs.map((log, idx)=>(<div key={idx} style={{background:'#f9fafb', border:'1px solid #ddd', borderRadius:6, padding:8, marginTop:6}}><div style={{fontSize:11, fontFamily:'monospace', whiteSpace:'pre-wrap'}}>{log}</div><button onClick={()=>copyLog(log)} style={{marginTop:6, background:'black', color:'white', border:0, padding:'6px 12px', borderRadius:6, fontSize:11, width:'100%'}}>Copy This Account</button></div>))}</div>
                    ) : (
                      <div style={{marginTop:8, background:'#eff6ff', padding:8, borderRadius:6}}><div style={{fontSize:11, fontWeight:700}}>Delivery Details:</div><div style={{fontSize:11, marginTop:4}}>Name: {order.address.fullName}<br/>Phone: {order.address.phone}<br/>Address: {order.address.address}<br/>City: {order.address.city}</div></div>
                    )}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      <div style={{padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12}}>
        {products.map(p=>{
          const available = p.type==='digital'? (p.logs?.length||0) : p.stock;
          const currentQty = qtys[p.id]||1;
          const isOut = available <=0;
          return(
          <div key={p.id} style={{background:'white', borderRadius:12, overflow:'hidden', border:'1px solid #eee', borderLeft:`4px solid ${p.type==='physical'?'#2563eb':'#16a34a'}`, opacity: isOut? 0.6 : 1}}>
            <img src={p.img} style={{width:'100%', height:140, objectFit:'cover'}}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700, fontSize:12}}>{p.name}</div>
              <div style={{fontSize:12, marginTop:4}}><b>₦{p.price}</b></div>
              <div style={{fontSize:10, color: available<3? 'red' : 'green', fontWeight:700}}>{isOut? 'SOLD OUT' : `Available: ${available}`} - {p.type?.toUpperCase()}</div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8, justifyContent:'center', background:'#f5f5f7', borderRadius:6, padding:4}}>
                <button onClick={()=>changeQty(p.id,-1)} disabled={isOut} style={{border:0, background:'white', width:26, height:26, borderRadius:4, opacity: isOut?0.3:1}}>-</button>
                <span style={{fontSize:12, fontWeight:700}}>{isOut?0:currentQty}/{available}</span>
                <button onClick={()=>changeQty(p.id,1)} disabled={isOut || currentQty>=available} style={{border:0, background: currentQty>=available? '#fecaca':'white', width:26, height:26, borderRadius:4}}>+</button>
              </div>
              <button onClick={()=>startBuy(p)} disabled={isOut} style={{width:'100%', marginTop:8, background: isOut? '#ccc':'black', color:'white', border:0, padding:10, borderRadius:6, fontSize:12, fontWeight:800}}>{isOut? 'Sold Out' : (p.type==='physical'?'Buy & Enter Address':'Buy Now')}</button>
              {currentQty>=available &&!isOut && <div style={{fontSize:9, color:'red', textAlign:'center', marginTop:4}}>Max available reached!</div>}
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
