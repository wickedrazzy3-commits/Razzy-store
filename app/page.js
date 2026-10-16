'use client';
import { useState, useEffect } from 'react';

const PAYSTACK_PUBLIC_KEY = "pk_live_e53e70211b051a607dea27a34fe32091d35917c2"; // <-- REPLACE WITH YOUR OWN KEY HERE!!!
const DEPOSIT_FEE = 50;

const DEFAULTS=[
 {id:1,name:"Facebook create page ✅ ( all accounts can create",price:4000,oldPrice:5000,type:"digital",img:"https://images.unsplash.com/photo-1611162616475-46b76543ac5f?w=400", delivery:"Page Key: PAGE-RAZZY-8849"},
 {id:2,name:"Uk physical sim",price:26000,oldPrice:30000,type:"physical",img:"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400", delivery:"Tracking: UK-GIFF-88291"},
 {id:3,name:"T- mobile physical sim",price:120000,oldPrice:150000,type:"physical",img:"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400", delivery:"Tracking: TM-US-99231"},
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState(DEFAULTS);
  const [qtys, setQtys] = useState({1:1,2:1,3:1});
  const [paying, setPaying] = useState(null);
  const [activeDelivery, setActiveDelivery] = useState(null);
  const [orders, setOrders] = useState([]);
  const [wallet, setWallet] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmount, setDepositAmount] = useState('');
  const [tab, setTab] = useState('shop');

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://js.paystack.co/v1/inline.js";
    script.async = true;
    document.body.appendChild(script);
    try{
      const savedUser = localStorage.getItem("razzy_user");
      if(savedUser) setUser(JSON.parse(savedUser));
      const s=localStorage.getItem("razzy_products");
      if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) setProducts(p); }
      const o=localStorage.getItem("razzy_orders_v2");
      if(o) setOrders(JSON.parse(o));
      const w=localStorage.getItem("razzy_wallet");
      if(w) setWallet(Number(w));
    }catch{}
  }, []);
  useEffect(()=>{localStorage.setItem("razzy_orders_v2",JSON.stringify(orders))},[orders]);
  useEffect(()=>{localStorage.setItem("razzy_wallet", String(wallet))},[wallet]);

  const handleAuth = () => {
    if(!email ||!password) return alert('Enter email & password');
    let users = []; try{ users = JSON.parse(localStorage.getItem("razzy_all_users")||"[]"); }catch{ users=[]; }
    if(isRegister){
      if(users.find(u=>u.email===email)) return alert('Already registered! Login');
      users.push({email,password}); localStorage.setItem("razzy_all_users", JSON.stringify(users));
      localStorage.setItem("razzy_user", JSON.stringify({email})); setUser({email});
      alert('Account created! ✅');
    }else{
      const found = users.find(u=>u.email===email && u.password===password);
      if(users.length>0 &&!found) return alert('Wrong email or password');
      if(users.length===0){ users.push({email,password}); localStorage.setItem("razzy_all_users", JSON.stringify(users)); }
      localStorage.setItem("razzy_user", JSON.stringify({email})); setUser({email});
    }
  };

  const handlePaystackDeposit = () => {
    const amt = Number(depositAmount);
    if(!amt || amt < 100) return alert('Min ₦100 deposit');
    if(!window.PaystackPop){ alert('Paystack loading... try again in 2 sec'); return; }
    if(PAYSTACK_PUBLIC_KEY.includes("xxxx")){ alert('⚠️ REPLACE PAYSTACK_PUBLIC_KEY with your real pk_... key at top of code!'); return; }

    const handler = window.PaystackPop.setup({
      key: PAYSTACK_PUBLIC_KEY,
      email: user?.email || email || "customer@razzystore.com",
      amount: amt * 100, // kobo
      currency: "NGN",
      ref: "RAZZY_"+Date.now(),
      callback: function(response){
        // Paystack success - deduct fee
        const credited = amt - DEPOSIT_FEE;
        if(credited <= 0) return alert('Amount too small after ₦50 fee');
        setWallet(w=>w+credited);
        alert(`✅ Paid ₦${amt.toLocaleString()} | Fee ₦${DEPOSIT_FEE} | Credited ₦${credited.toLocaleString()} to wallet!`);
        setDepositAmount(''); setShowDeposit(false);
      },
      onClose: function(){ alert('Payment cancelled'); }
    });
    handler.openIframe();
  };

  const changeQty=(id,delta)=>setQtys(p=>({...p,[id]:Math.max(1,(p[id]||1)+delta)}));
  const handlePay=async(product)=>{
    const qty=qtys[product.id]||1;
    const total=Number(product.price)*qty;
    if(wallet < total) return alert(`❌ Insufficient! Wallet ₦${wallet.toLocaleString()} need ₦${total.toLocaleString()}. Deposit first!`);
    setPaying(product.id);
    await new Promise(r=>setTimeout(r,800));
    setWallet(w=>w-total);
    const newOrder={id:Date.now(), name:product.name, qty, total, img:product.img, delivery:product.delivery, date:new Date().toLocaleString()};
    setOrders(prev=>[newOrder,...prev]);
    setPaying(null);
    setActiveDelivery(newOrder);
  };

  const totalSpent = orders.reduce((a,b)=>a+b.total,0);
  const totalItems = orders.reduce((a,b)=>a+b.qty,0);
  const totalDeposited = wallet + totalSpent;

  if(!user){
    return(
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'#f6f6f7',fontFamily:'sans-serif'}}>
        <div style={{background:'white',width:'100%',maxWidth:380,borderRadius:16,padding:28}}>
          <h1 style={{color:'#C1440E',fontSize:26,fontWeight:800,textAlign:'center',margin:0}}>{isRegister?'Create Account':'Welcome Back'}</h1>
          <div style={{marginTop:20,fontWeight:600,fontSize:13}}>Email</div><input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd',marginTop:6,boxSizing:'border-box'}}/>
          <div style={{marginTop:12,fontWeight:600,fontSize:13}}>Password</div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd',marginTop:6,boxSizing:'border-box'}}/>
          <button onClick={handleAuth} style={{width:'100%',background:'#E85A1A',color:'white',border:0,padding:14,borderRadius:8,fontWeight:700,marginTop:20}}>{isRegister?'Register':'Log in'}</button>
          <div style={{textAlign:'center',marginTop:20,fontSize:13}}>{isRegister?'Have account? ':'No account? '}<span onClick={()=>setIsRegister(!isRegister)} style={{color:'#E85A1A',fontWeight:700,cursor:'pointer'}}>{isRegister?'Login':'Register'}</span></div>
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:'sans-serif',background:'#f5f5f7',minHeight:'100vh',paddingBottom:80}}>
      <style>{`.header{position:sticky;top:0;background:white;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;z-index:10;border-bottom:1px solid #eee}.grid{display:grid;grid-template-columns:1fr 1fr;gap:10px}.card2{background:white;border-radius:14px;overflow:hidden;border:1px solid #eee}.img{width:100%;height:130px;object-fit:cover}.qtyBox{display:flex;align-items:center;gap:8px;background:#f6f6f7;border-radius:999px;padding:3px 8px;margin-top:8px;width:fit-content}.qtyBtn{width:26px;height:26px;border-radius:999px;border:1px solid #ddd;background:white;font-weight:800;cursor:pointer}.dash{display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px;margin:12px}.dashCard{background:white;border-radius:12px;padding:12px;textAlign:center;border:1px solid #eee}`}</style>

      <div className="header">
        <div style={{fontWeight:900}}>RAZZY STORE</div>
        <div style={{display:'flex',gap:6,alignItems:'center'}}>
          <div style={{background:'#f0fdf4',padding:'4px 10px',borderRadius:999,fontSize:12,fontWeight:800}}>₦{wallet.toLocaleString()}</div>
          <button onClick={()=>{localStorage.removeItem("razzy_user"); setUser(null);}} style={{background:'#eee',border:0,padding:'6px 10px',borderRadius:999,fontSize:11}}>Logout</button>
        </div>
      </div>

      <div style={{maxWidth:1100,margin:'0 auto'}}>
        <div className="dash">
          <div className="dashCard"><div style={{fontSize:11,color:'#888'}}>Balance</div><div style={{fontWeight:900,fontSize:15,color:'#16a34a'}}>₦{wallet.toLocaleString()}</div></div>
          <div className="dashCard"><div style={{fontSize:11,color:'#888'}}>Spent</div><div style={{fontWeight:900,fontSize:15,color:'#dc2626'}}>₦{totalSpent.toLocaleString()}</div></div>
          <div className="dashCard"><div style={{fontSize:11,color:'#888'}}>Items</div><div style={{fontWeight:900,fontSize:15}}>{totalItems}</div></div>
        </div>

        <div style={{padding:'0 12px',display:'flex',gap:8,marginBottom:10}}>
          <button onClick={()=>setShowDeposit(true)} style={{flex:1,background:'#16a34a',color:'white',border:0,padding:'10px',borderRadius:999,fontWeight:800,fontSize:13}}>+ Deposit via Paystack</button>
          <button onClick={()=>setTab(tab==='shop'?'history':'shop')} style={{flex:1,background:'black',color:'white',border:0,padding:'10px',borderRadius:999,fontWeight:800,fontSize:13}}>{tab==='shop'?`History (${orders.length})`:'Shop'}</button>
        </div>

        {tab==='shop'? (
          <div className="grid" style={{padding:'0 12px'}}>
            {products.map(p=>(
              <div key={p.id} className="card2">
                <img src={p.img} className="img"/><div style={{padding:10}}>
                  <div style={{fontWeight:700,fontSize:13,height:32,overflow:'hidden'}}>{p.name}</div>
                  <div style={{fontWeight:900,marginTop:4}}>₦{Number(p.price).toLocaleString()}</div>
                  <div className="qtyBox"><button className="qtyBtn" onClick={()=>changeQty(p.id,-1)}>-</button><span style={{fontWeight:800,fontSize:13,minWidth:18,textAlign:'center'}}>{qtys[p.id]||1}</span><button className="qtyBtn" onClick={()=>changeQty(p.id,1)}>+</button><span style={{fontSize:10,color:'#888',marginLeft:4}}>Qty</span></div>
                  <button onClick={()=>handlePay(p)} disabled={paying===p.id} style={{width:'100%',marginTop:8,background:wallet<Number(p.price)*(qtys[p.id]||1)?'#ccc':'black',color:'white',border:0,padding:'11px',borderRadius:999,fontWeight:800,fontSize:12}}>{paying===p.id?'Processing...': wallet<Number(p.price)*(qtys[p.id]||1)? 'Low Balance - Deposit':`Pay ₦${(Number(p.price)*(qtys[p.id]||1)).toLocaleString()}`}</button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div style={{padding:'0 12px'}}>
            <h3 style={{fontWeight:900}}>Purchase History</h3>
            {orders.length===0? <div style={{background:'white',padding:20,borderRadius:12,textAlign:'center',color:'#888'}}>No purchases yet</div> :
              orders.map(o=><div key={o.id} style={{background:'white',borderRadius:12,padding:12,marginTop:10,border:'1px solid #eee',display:'flex',gap:10}}><img src={o.img} style={{width:60,height:60,borderRadius:8,objectFit:'cover'}}/><div style={{flex:1}}><div style={{fontWeight:700,fontSize:13}}>{o.name} x{o.qty}</div><div style={{fontSize:12,marginTop:2}}>₦{o.total.toLocaleString()} • {o.date}</div><div style={{fontSize:11,marginTop:6,background:'#f0fdf4',padding:6,borderRadius:6,border:'1px dashed #aaa'}}>{o.delivery}</div></div></div>)}
          </div>
        )}
      </div>

      {showDeposit && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:100}}>
          <div style={{background:'white',width:'100%',maxWidth:360,borderRadius:16,padding:20}}>
            <h3 style={{fontWeight:900,marginTop:0}}>Deposit via Paystack</h3>
            <div style={{background:'#fff7ed',padding:10,borderRadius:8,fontSize:12,marginBottom:12}}>💡 Fee: ₦50 per deposit<br/>Pay ₦1000 → Get ₦950 in wallet<br/>Pay ₦5000 → Get ₦4950</div>
            <input type="number" value={depositAmount} onChange={e=>setDepositAmount(e.target.value)} placeholder="Amount e.g 1000" style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd',boxSizing:'border-box'}}/>
            {depositAmount && <div style={{marginTop:10,fontSize:13,fontWeight:700}}>You will receive: ₦{(Number(depositAmount)-DEPOSIT_FEE).toLocaleString()} (after ₦50 fee)</div>}
            <div style={{display:'flex',gap:8,marginTop:14}}>
              <button onClick={()=>setShowDeposit(false)} style={{flex:1,background:'#eee',border:0,padding:12,borderRadius:999,fontWeight:700}}>Cancel</button>
              <button onClick={handlePaystackDeposit} style={{flex:1,background:'#16a34a',color:'white',border:0,padding:12,borderRadius:999,fontWeight:800}}>Pay ₦{depositAmount||0}</button>
            </div>
          </div>
        </div>
      )}

      {activeDelivery && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:101}} onClick={()=>setActiveDelivery(null)}>
          <div style={{background:'white',width:'100%',maxWidth:340,borderRadius:20,padding:20}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',fontSize:34}}>✅</div><h3 style={{textAlign:'center',fontWeight:900}}>Paid!</h3>
            <div style={{background:'#f0fdf4',border:'1px dashed #ccc',padding:10,borderRadius:8,fontSize:12,marginTop:12}}>{activeDelivery.delivery}</div>
            <button onClick={()=>setActiveDelivery(null)} style={{width:'100%',marginTop:12,background:'black',color:'white',border:0,padding:12,borderRadius:999,fontWeight:800}}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}
