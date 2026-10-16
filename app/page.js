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
  const [hasError, setHasError] = useState(false);

  useEffect(()=>{
    try{
      // Try load products safely
      const s = localStorage.getItem("razzy_products");
      if(s){
        const p = JSON.parse(s);
        if(Array.isArray(p) && p.length>0){
          // FIX OLD PRODUCTS: Ensure logs is array, stock is number, type exists
          const fixed = p.map(item=>{
            try{
              let logs = item.logs;
              if(!logs) logs = [];
              if(typeof logs === 'string') logs = [logs];
              if(!Array.isArray(logs)) logs = [];
              let stock = item.stock;
              if(item.type==='digital') stock = logs.length;
              if(!stock && stock!==0) stock = logs.length || 1;
              return {
               ...item,
                logs: logs,
                stock: Number(stock)||0,
                type: item.type || 'digital',
                price: Number(item.price)||0,
                img: item.img || 'https://i.imgur.com/8Km9tLL.png'
              };
            }catch{ return null; }
          }).filter(Boolean);
          if(fixed.length>0) setProducts(fixed);
        }
      }
      const w = localStorage.getItem("razzy_wallet"); if(w) setWallet(Number(w)||0);
      const td = localStorage.getItem("razzy_totalDeposited"); if(td) setTotalDeposited(Number(td)||0);
      const tu = localStorage.getItem("razzy_totalUsed"); if(tu) setTotalUsed(Number(tu)||0);
      const ti = localStorage.getItem("razzy_totalItems"); if(ti) setTotalItems(Number(ti)||0);
      const em = localStorage.getItem("razzy_email"); if(em) setEmail(em);
      const ord = localStorage.getItem("razzy_orders"); if(ord) setOrders(JSON.parse(ord)||[]);
      const script = document.createElement("script");
      script.src = "https://js.paystack.co/v1/inline.js";
      document.body.appendChild(script);
    }catch(e){
      console.log("Load error, resetting", e);
      // If storage corrupt, clear it
      localStorage.removeItem("razzy_products");
    }
  },[]);

  useEffect(()=>{ try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{} },[products]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_wallet", String(wallet)); }catch{} },[wallet]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalDeposited", String(totalDeposited)); }catch{} },[totalDeposited]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalUsed", String(totalUsed)); }catch{} },[totalUsed]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalItems", String(totalItems)); }catch{} },[totalItems]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_orders", JSON.stringify(orders)); }catch{} },[orders]);

  const changeQty = (id, delta) => {
    try{
      const product = products.find(p=>p.id===id);
      if(!product) return;
      const available = product.type==='digital'? (Array.isArray(product.logs)? product.logs.length : 0) : (Number(product.stock)||0);
      if(available<=0) return;
      setQtys(prev=>{
        const cur=prev[id]||1;
        let next = cur+delta;
        if(next < 1) next = 1;
        if(next > available){
          alert(`Only ${available} available for ${product.name}!`);
          return {...prev,[id]: available};
        }
        return {...prev,[id]:next};
      });
    }catch{}
  };

  const handleDeposit = () => {
    try{
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
    }catch(e){ alert("Deposit error: "+e.message); }
  };

  const startBuy = (product) => {
    try{
      const qty = qtys[product.id]||1;
      const available = product.type==='digital'? (Array.isArray(product.logs)? product.logs.length : 0) : (Number(product.stock)||0);
      const total = Number(product.price)*qty;
      if(available <=0) return alert(`OUT OF STOCK! ${product.name} sold out`);
      if(qty > available) return alert(`Cannot buy ${qty}. Only ${available} left`);
      if(wallet < total) return alert(`Insufficient! Have ₦${wallet} need ₦${total}. Deposit first.`);
      if(product.type==='physical'){
        setPendingProduct({product, qty, total});
        setShowAddressForm(true);
      } else {
        confirmBuyDigital(product, qty, total);
      }
    }catch(e){ alert("Buy error: "+e.message); }
  };

  const confirmBuyDigital = (product, qty, total) => {
    try{
      if(!confirm(`Buy ${product.name} x${qty} = ₦${total}?\nBalance after: ₦${wallet-total}`)) return;
      const availableLogs = Array.isArray(product.logs)? product.logs : [];
      const boughtLogs = availableLogs.slice(0, qty);
      const remainingLogs = availableLogs.slice(qty);
      if(boughtLogs.length===0) return alert("No logs left! Product is sold out");
      const newOrder = {id: Date.now(), productName: product.name, price: product.price, qty, total, type: 'digital', logs: boughtLogs, date: new Date().toLocaleString(), img: product.img};
      setOrders(prev=>[newOrder,...prev]);
      setWallet(prev=>prev-total);
      setTotalUsed(prev=>prev+total);
      setTotalItems(prev=>prev+qty);
      setProducts(prev=>prev.map(p=>p.id===product.id?{...p, logs: remainingLogs, stock: remainingLogs.length}:p));
      alert(`Digital Success! Check My Orders to copy`);
    }catch(e){ alert("Digital buy error: "+e.message); }
  };

  const confirmBuyPhysical = () => {
    try{
      if(!addressData.fullName ||!addressData.phone ||!addressData.address) return alert("Fill Name, Phone, Address");
      const {product, qty, total} = pendingProduct;
      if(!confirm(`Buy ${product.name} x${qty} = ₦${total}?`)) return;
      const newOrder = {id: Date.now(), productName: product.name, price: product.price, qty, total, type: 'physical', address: {...addressData}, date: new Date().toLocaleString(), img: product.img, status: 'Processing'};
      setOrders(prev=>[newOrder,...prev]);
      setWallet(prev=>prev-total);
      setTotalUsed(prev=>prev+total);
      setTotalItems(prev=>prev+qty);
      setProducts(prev=>prev.map(p=>p.id===product.id?{...p, stock: (Number(p.stock)||0) - qty}:p));
      setShowAddressForm(false); setAddressData({fullName:'', phone:'', address:'', city:'', note:''}); setPendingProduct(null);
      alert(`Physical Order Placed!`);
    }catch(e){ alert("Physical error: "+e.message); }
  };

  const copyLog = (logText) => {
    try{ navigator.clipboard.writeText(logText); alert("Copied!"); }catch{ alert(logText); }
  };

  const clearOldData = () => {
    if(confirm("This will clear OLD broken products and test wallet to fix error. Continue?")){
      localStorage.removeItem("razzy_products");
      localStorage.removeItem("razzy_wallet");
      localStorage.removeItem("razzy_totalDeposited");
      localStorage.removeItem("razzy_totalUsed");
      localStorage.removeItem("razzy_totalItems");
      localStorage.removeItem("razzy_orders");
      alert("Cleared! Reloading page...");
      window.location.reload();
    }
  };

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{background:'black', color:'white', padding:12, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <b>RAZZY STORE</b>
        <div style={{display:'flex', gap:6, alignItems:'center'}}>
          <div style={{background:'#222', padding:'6px 8px', borderRadius:6, fontSize:10}}>Wallet: <b style={{color:'#16a34a'}}>₦{wallet}</b></div>
          <button onClick={()=>setShowOrders(true)} style={{background:'white', color:'black', border:0, padding:'6px 8px', borderRadius:6, fontSize:10, fontWeight:800}}>Orders ({orders.length})</button>
          <button onClick={()=>setShowDeposit(true)} style={{background:'#16a34a', color:'white', border:0, padding:'6px 8px', borderRadius:6, fontSize:10, fontWeight:800}}>Deposit</button>
        </div>
      </div>

      <div style={{padding:12}}>
        <div style={{background:'white', borderRadius:12, padding:12, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, border:'1px solid #eee'}}>
          <div style={{background:'#f0fdf4', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>DEPOSITED</div><div style={{fontSize:13, fontWeight:900, color:'#16a34a'}}>₦{totalDeposited}</div></div>
          <div style={{background:'#fef2f2', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>USED</div><div style={{fontSize:13, fontWeight:900, color:'#dc2626'}}>₦{totalUsed}</div></div>
          <div style={{background:'#eff6ff', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>ITEMS</div><div style={{fontSize:13, fontWeight:900, color:'#2563eb'}}>{totalItems}</div></div>
        </div>
        <div style={{marginTop:8, textAlign:'center'}}><button onClick={clearOldData} style={{fontSize:9, background:'#fee2e2', color:'#dc2626', border:0, padding:'4px 8px', borderRadius:4}}>If error persists, click to clear old test data</button></div>
      </div>

      {showDeposit && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:360}}>
            <h3 style={{margin:0}}>Real Deposit - Live</h3>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input type="number" value={depositAmt} onChange={e=>setDepositAmt(e.target.value)} placeholder="Amount" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            {depositAmt && <div style={{fontSize:11, marginTop:8, background:'#f5f5f7', padding:8, borderRadius:6}}>Pay ₦{depositAmt} - ₦50 = <b>₦{Number(depositAmt)-50} credited</b></div>}
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={handleDeposit} style={{flex:1, background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800}}>Pay Live</button>
              <button onClick={()=>setShowDeposit(false)} style={{flex:1, background:'#eee', padding:12, borderRadius:8, border:0}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showAddressForm && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:60, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:380}}>
            <h3 style={{margin:0}}>Delivery Details</h3>
            <input value={addressData.fullName} onChange={e=>setAddressData({...addressData, fullName:e.target.value})} placeholder="Full Name" style={{width:'100%', padding:10, marginTop:10, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input value={addressData.phone} onChange={e=>setAddressData({...addressData, phone:e.target.value})} placeholder="Phone" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input value={addressData.address} onChange={e=>setAddressData({...addressData, address:e.target.value})} placeholder="Full Address" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input value={addressData.city} onChange={e=>setAddressData({...addressData, city:e.target.value})} placeholder="City / State" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <textarea value={addressData.note} onChange={e=>setAddressData({...addressData, note:e.target.value})} placeholder="Note" style={{width:'100%', padding:10, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box', height:60}}/>
            <div style={{display:'flex', gap:8, marginTop:12}}>
              <button onClick={confirmBuyPhysical} style={{flex:1, background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800}}>Confirm Pay</button>
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
                  <div key={order.id} style={{border:'1px solid #eee', borderRadius:8, padding:10, marginTop:10}}>
                    <div style={{fontWeight:800, fontSize:12}}>{order.productName} x{order.qty} - ₦{order.total}</div>
                    <div style={{fontSize:11, color:'#666'}}>{order.date}</div>
                    {order.type==='digital'? (
                      <div style={{marginTop:8}}>{(order.logs||[]).map((log, idx)=>(<div key={idx} style={{background:'#f9fafb', border:'1px solid #ddd', borderRadius:6, padding:8, marginTop:6}}><div style={{fontSize:11, fontFamily:'monospace', whiteSpace:'pre-wrap'}}>{log}</div><button onClick={()=>copyLog(log)} style={{marginTop:6, background:'black', color:'white', border:0, padding:'6px 12px', borderRadius:6, fontSize:11, width:'100%'}}>Copy</button></div>))}</div>
                    ) : (
                      <div style={{marginTop:8, background:'#eff6ff', padding:8, borderRadius:6, fontSize:11}}>Name: {order.address?.fullName}<br/>Phone: {order.address?.phone}<br/>Address: {order.address?.address}<br/>City: {order.address?.city}</div>
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
          const available = p.type==='digital'? (Array.isArray(p.logs)? p.logs.length : 0) : (Number(p.stock)||0);
          const currentQty = qtys[p.id]||1;
          const isOut = available <=0;
          return(
          <div key={p.id} style={{background:'white', borderRadius:12, overflow:'hidden', border:'1px solid #eee', opacity: isOut? 0.6 : 1}}>
            <img src={p.img} style={{width:'100%', height:140, objectFit:'cover'}}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700, fontSize:12}}>{p.name||'Product'}</div>
              <div style={{fontSize:12, marginTop:4}}><b>₦{p.price||0}</b></div>
              <div style={{fontSize:10, color: isOut?'red':'green', fontWeight:700}}>{isOut? 'SOLD OUT' : `Available: ${available}`}</div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8, justifyContent:'center', background:'#f5f5f7', borderRadius:6, padding:4}}>
                <button onClick={()=>changeQty(p.id,-1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4}}>-</button>
                <span style={{fontSize:12, fontWeight:700}}>{isOut?0:currentQty}/{available}</span>
                <button onClick={()=>changeQty(p.id,1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4}}>+</button>
              </div>
              <button onClick={()=>startBuy(p)} disabled={isOut} style={{width:'100%', marginTop:8, background: isOut? '#ccc':'black', color:'white', border:0, padding:10, borderRadius:6, fontSize:12, fontWeight:800}}>{isOut? 'Sold Out' : 'Buy Now'}</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
