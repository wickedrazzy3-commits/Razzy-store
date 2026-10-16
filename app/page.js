'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  {id:1, name:'UK WhatsApp Number', price:3000, oldPrice:4000, stock:20, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Number will be delivered instantly', logs:["Username:- uk123\nPassword:- pass123\n2fa:- 123456"]},
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

  // AUTH STATES - RESTORED
  const [currentUser, setCurrentUser] = useState(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login or signup
  const [authForm, setAuthForm] = useState({name:'', email:'', password:''});

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){
        const p = JSON.parse(s);
        if(Array.isArray(p) && p.length>0){
          const fixed = p.map(item=>{
            try{
              let logs = item.logs; if(!logs) logs=[]; if(typeof logs==='string') logs=[logs]; if(!Array.isArray(logs)) logs=[];
              let stock = item.type==='digital'? logs.length : (Number(item.stock)||0);
              return {...item, logs, stock: Number(stock)||0, type: item.type||'digital', price: Number(item.price)||0, img: item.img||'https://i.imgur.com/8Km9tLL.png'};
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
      const user = localStorage.getItem("razzy_currentUser"); if(user) setCurrentUser(JSON.parse(user));
      const script = document.createElement("script"); script.src = "https://js.paystack.co/v1/inline.js"; document.body.appendChild(script);
    }catch{}
  },[]);

  useEffect(()=>{ try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{} },[products]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_wallet", String(wallet)); }catch{} },[wallet]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalDeposited", String(totalDeposited)); }catch{} },[totalDeposited]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalUsed", String(totalUsed)); }catch{} },[totalUsed]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalItems", String(totalItems)); }catch{} },[totalItems]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_orders", JSON.stringify(orders)); }catch{} },[orders]);

  // AUTH FUNCTIONS
  const handleSignup = () => {
    if(!authForm.name ||!authForm.email ||!authForm.password) return alert("Fill all fields");
    if(!authForm.email.includes("@")) return alert("Invalid email");
    if(authForm.password.length < 4) return alert("Password min 4 chars");
    const users = JSON.parse(localStorage.getItem("razzy_users")||"[]");
    if(users.find(u=>u.email===authForm.email)) return alert("Email already exists, Login instead");
    const newUser = {name: authForm.name, email: authForm.email, password: authForm.password};
    users.push(newUser);
    localStorage.setItem("razzy_users", JSON.stringify(users));
    localStorage.setItem("razzy_currentUser", JSON.stringify(newUser));
    setCurrentUser(newUser); setEmail(newUser.email); setShowAuth(false);
    setAuthForm({name:'', email:'', password:''});
    alert("Signup successful! Logged in");
  };

  const handleLogin = () => {
    if(!authForm.email ||!authForm.password) return alert("Fill email & password");
    const users = JSON.parse(localStorage.getItem("razzy_users")||"[]");
    const found = users.find(u=>u.email===authForm.email && u.password===authForm.password);
    if(!found) return alert("Wrong email or password");
    localStorage.setItem("razzy_currentUser", JSON.stringify(found));
    setCurrentUser(found); setEmail(found.email); setShowAuth(false);
    setAuthForm({name:'', email:'', password:''});
    alert("Login successful!");
  };

  const handleLogout = () => {
    localStorage.removeItem("razzy_currentUser");
    setCurrentUser(null);
    alert("Logged out");
  };

  const changeQty = (id, delta) => {
    try{
      const product = products.find(p=>p.id===id); if(!product) return;
      const available = product.type==='digital'? (Array.isArray(product.logs)? product.logs.length : 0) : (Number(product.stock)||0);
      if(available<=0) return;
      setQtys(prev=>{
        const cur=prev[id]||1; let next=cur+delta; if(next<1) next=1;
        if(next>available){ alert(`Only ${available} available!`); return {...prev,[id]:available}; }
        return {...prev,[id]:next};
      });
    }catch{}
  };

  const handleDeposit = () => {
    if(!currentUser) return setShowAuth(true);
    const amt = Number(depositAmt);
    if(!amt || amt<100) return alert("Min ₦100");
    if(!email ||!email.includes("@")) return alert("Enter valid email");
    const FEE=50; if(amt<=FEE) return alert(`Min ₦${FEE+100}`);
    if(!window.PaystackPop) return alert("Paystack loading...");
    localStorage.setItem("razzy_email", email);
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY, email: email, amount: amt*100, currency:"NGN", ref:"RAZZY_"+Date.now(),
      callback: function(response){
        const credit=amt-FEE; setWallet(p=>p+credit); setTotalDeposited(p=>p+amt); setDepositAmt(''); setShowDeposit(false);
        alert(`SUCCESS Ref:${response.reference}\nPaid ₦${amt} - ₦${FEE} = ₦${credit} credited`);
      },
      onClose: function(){ alert("Payment cancelled"); }
    });
    handler.openIframe();
  };

  const startBuy = (product) => {
    if(!currentUser) return setShowAuth(true);
    try{
      const qty=qtys[product.id]||1;
      const available=product.type==='digital'? (Array.isArray(product.logs)? product.logs.length:0) : (Number(product.stock)||0);
      const total=Number(product.price)*qty;
      if(available<=0) return alert("OUT OF STOCK!");
      if(qty>available) return alert(`Cannot buy ${qty}. Only ${available} left`);
      if(wallet<total) return alert(`Insufficient! Have ₦${wallet} need ₦${total}. Deposit first.`);
      if(product.type==='physical'){ setPendingProduct({product, qty, total}); setShowAddressForm(true); }
      else confirmBuyDigital(product, qty, total);
    }catch(e){ alert("Buy error: "+e.message); }
  };

  const confirmBuyDigital = (product, qty, total) => {
    if(!confirm(`Buy ${product.name} x${qty} = ₦${total}?`)) return;
    const availableLogs=Array.isArray(product.logs)? product.logs:[]; const boughtLogs=availableLogs.slice(0,qty); const remainingLogs=availableLogs.slice(qty);
    if(boughtLogs.length===0) return alert("No logs left!");
    const newOrder={id:Date.now(), productName:product.name, price:product.price, qty, total, type:'digital', logs:boughtLogs, date:new Date().toLocaleString(), img:product.img};
    setOrders(p=>[newOrder,...p]); setWallet(p=>p-total); setTotalUsed(p=>p+total); setTotalItems(p=>p+qty);
    setProducts(prev=>prev.map(p=>p.id===product.id?{...p, logs:remainingLogs, stock:remainingLogs.length}:p));
    alert("Success! Check My Orders to copy");
  };

  const confirmBuyPhysical = () => {
    if(!addressData.fullName||!addressData.phone||!addressData.address) return alert("Fill Name, Phone, Address");
    const {product, qty, total}=pendingProduct;
    const newOrder={id:Date.now(), productName:product.name, price:product.price, qty, total, type:'physical', address:{...addressData}, date:new Date().toLocaleString(), img:product.img, status:'Processing'};
    setOrders(p=>[newOrder,...p]); setWallet(p=>p-total); setTotalUsed(p=>p+total); setTotalItems(p=>p+qty);
    setProducts(prev=>prev.map(p=>p.id===product.id?{...p, stock:(Number(p.stock)||0)-qty}:p));
    setShowAddressForm(false); setAddressData({fullName:'', phone:'', address:'', city:'', note:''}); setPendingProduct(null);
    alert("Order Placed!");
  };

  const copyLog = (t) => { try{ navigator.clipboard.writeText(t); alert("Copied!"); }catch{ alert(t); } };

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{background:'black', color:'white', padding:12, display:'flex', justifyContent:'space-between', alignItems:'center', position:'sticky', top:0, zIndex:10}}>
        <b>RAZZY STORE</b>
        <div style={{display:'flex', gap:6, alignItems:'center'}}>
          <div style={{background:'#222', padding:'6px 8px', borderRadius:6, fontSize:10}}>Wallet: <b style={{color:'#16a34a'}}>₦{wallet}</b></div>
          <button onClick={()=>setShowOrders(true)} style={{background:'white', color:'black', border:0, padding:'6px 8px', borderRadius:6, fontSize:10, fontWeight:800}}>Orders ({orders.length})</button>
          {currentUser? <button onClick={handleLogout} style={{background:'#dc2626', color:'white', border:0, padding:'6px 8px', borderRadius:6, fontSize:10, fontWeight:800}}>Logout ({currentUser.name?.split(' ')[0]})</button> : <button onClick={()=>{setAuthMode('login'); setShowAuth(true);}} style={{background:'#2563eb', color:'white', border:0, padding:'6px 8px', borderRadius:6, fontSize:10, fontWeight:800}}>Login / Signup</button>}
          <button onClick={()=>setShowDeposit(true)} style={{background:'#16a34a', color:'white', border:0, padding:'6px 8px', borderRadius:6, fontSize:10, fontWeight:800}}>Deposit</button>
        </div>
      </div>

      {/* AUTH MODAL - RESTORED */}
      {showAuth && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.7)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:80, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:360}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <h3 style={{margin:0}}>{authMode==='login'? 'Login':'Signup'} to Razzy Store</h3>
              <button onClick={()=>setShowAuth(false)} style={{background:'#eee', border:0, padding:'6px 10px', borderRadius:6}}>X</button>
            </div>
            {authMode==='signup' && <input value={authForm.name} onChange={e=>setAuthForm({...authForm, name:e.target.value})} placeholder="Full Name" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>}
            <input value={authForm.email} onChange={e=>setAuthForm({...authForm, email:e.target.value})} placeholder="Email" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            <input type="password" value={authForm.password} onChange={e=>setAuthForm({...authForm, password:e.target.value})} placeholder="Password" style={{width:'100%', padding:12, marginTop:8, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
            {authMode==='login'? (
              <>
                <button onClick={handleLogin} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800, marginTop:12}}>Login</button>
                <div style={{fontSize:11, marginTop:10, textAlign:'center'}}>No account? <span onClick={()=>setAuthMode('signup')} style={{color:'#2563eb', fontWeight:800, cursor:'pointer'}}>Signup here</span></div>
              </>
            ) : (
              <>
                <button onClick={handleSignup} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, fontWeight:800, marginTop:12}}>Create Account</button>
                <div style={{fontSize:11, marginTop:10, textAlign:'center'}}>Have account? <span onClick={()=>setAuthMode('login')} style={{color:'#2563eb', fontWeight:800, cursor:'pointer'}}>Login here</span></div>
              </>
            )}
          </div>
        </div>
      )}

      <div style={{padding:12}}>
        <div style={{background:'white', borderRadius:12, padding:12, display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10, border:'1px solid #eee'}}>
          <div style={{background:'#f0fdf4', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>DEPOSITED</div><div style={{fontSize:13, fontWeight:900, color:'#16a34a'}}>₦{totalDeposited}</div></div>
          <div style={{background:'#fef2f2', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>USED</div><div style={{fontSize:13, fontWeight:900, color:'#dc2626'}}>₦{totalUsed}</div></div>
          <div style={{background:'#eff6ff', borderRadius:8, padding:10, textAlign:'center'}}><div style={{fontSize:10}}>ITEMS</div><div style={{fontSize:13, fontWeight:900, color:'#2563eb'}}>{totalItems}</div></div>
        </div>
        {currentUser && <div style={{fontSize:11, marginTop:8, textAlign:'center', color:'#16a34a'}}>Logged in as {currentUser.email}</div>}
      </div>

      {showDeposit && (
        <div style={{position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:50, padding:16}}>
          <div style={{background:'white', padding:20, borderRadius:12, width:'100%', maxWidth:360}}>
            <h3 style={{margin:0}}>Real Deposit - Live</h3>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email for receipt" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
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
                    <div style={{fontWeight:800, fontSize:12}}>{order.productName} x{order.qty} - ₦{order.total}</div><div style={{fontSize:11, color:'#666'}}>{order.date}</div>
                    {order.type==='digital'? <div style={{marginTop:8}}>{(order.logs||[]).map((log, idx)=>(<div key={idx} style={{background:'#f9fafb', border:'1px solid #ddd', borderRadius:6, padding:8, marginTop:6}}><div style={{fontSize:11, whiteSpace:'pre-wrap'}}>{log}</div><button onClick={()=>copyLog(log)} style={{marginTop:6, background:'black', color:'white', border:0, padding:'6px 12px', borderRadius:6, fontSize:11, width:'100%'}}>Copy</button></div>))}</div> : <div style={{marginTop:8, background:'#eff6ff', padding:8, borderRadius:6, fontSize:11}}>Name: {order.address?.fullName}<br/>Phone: {order.address?.phone}<br/>Address: {order.address?.address}<br/>City: {order.address?.city}</div>}
                  </div>
                ))
              }
            </div>
          </div>
        </div>
      )}

      <div style={{padding:16, display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(160px, 1fr))', gap:12}}>
        {products.map(p=>{
          const available=p.type==='digital'? (Array.isArray(p.logs)? p.logs.length:0) : (Number(p.stock)||0);
          const currentQty=qtys[p.id]||1; const isOut=available<=0;
          return(
          <div key={p.id} style={{background:'white', borderRadius:12, overflow:'hidden', border:'1px solid #eee', opacity:isOut?0.6:1}}>
            <img src={p.img} style={{width:'100%', height:140, objectFit:'cover'}}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700, fontSize:12}}>{p.name}</div><div style={{fontSize:12, marginTop:4}}><b>₦{p.price}</b></div>
              <div style={{fontSize:10, color:isOut?'red':'green', fontWeight:700}}>{isOut? 'SOLD OUT':`Available: ${available}`} - {p.type?.toUpperCase()}</div>
              <div style={{display:'flex', alignItems:'center', gap:8, marginTop:8, justifyContent:'center', background:'#f5f5f7', borderRadius:6, padding:4}}>
                <button onClick={()=>changeQty(p.id,-1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4}}>-</button>
                <span style={{fontSize:12, fontWeight:700}}>{isOut?0:currentQty}/{available}</span>
                <button onClick={()=>changeQty(p.id,1)} style={{border:0, background:'white', width:26, height:26, borderRadius:4}}>+</button>
              </div>
              <button onClick={()=>startBuy(p)} disabled={isOut} style={{width:'100%', marginTop:8, background:isOut?'#ccc':'black', color:'white', border:0, padding:10, borderRadius:6, fontSize:12, fontWeight:800}}>{isOut? 'Sold Out':'Buy Now'}</button>
            </div>
          </div>
        )})}
      </div>
    </div>
  );
}
