'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const PRODUCTS = [
  { id: 1, type: 'digital', name: 'Facebook Create Page ✅', desc: 'All accounts can create page', price: 4000, delivery: 'FB123-Page-Creation-Key: PAGE-RAZZY-8849 | Login to facebook.com/pages/create and use this approval' },
  { id: 2, type: 'physical', name: 'UK Physical Sim', desc: 'Giffgaff / O2 UK Sim', price: 26000, delivery: 'Tracking: UK-GF-99283 | Courier: DHL | ETA: 3-5 days | Will be shipped to your address on file' },
  { id: 3, type: 'physical', name: 'T-Mobile Physical Sim', desc: 'USA T-Mobile 5G SIM', price: 120000, delivery: 'Tracking: TM-US-11293 | Courier: FedEx | ETA: 5-7 days | Customs cleared' },
  { id: 4, type: 'digital', name: 'USA Virtual Number', desc: 'For WhatsApp / Telegram', price: 8000, delivery: 'Number: +1 (323) 555-0199 | OTP Code: 774291 | Valid 20 mins - Copy and use now' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [paying, setPaying] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user||null); setChecking(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user||null));
    const saved = localStorage.getItem('razzy_orders_final');
    if (saved) setOrders(JSON.parse(saved));
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(() => { localStorage.setItem('razzy_orders_final', JSON.stringify(orders)); }, [orders]);

  const handleAuth = async () => {
    if (!email ||!password) return alert('Fill email & password');
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! ✅');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const handlePay = async (product) => {
    setPaying(product.id);
    // Simulate Paystack payment - 2 seconds
    await new Promise(r => setTimeout(r, 2000));

    const newOrder = {
      id: Date.now(),
      product: product.name,
      price: product.price,
      type: product.type,
      deliveryInfo: product.delivery,
      date: new Date().toLocaleString(),
      status: product.type==='digital'? 'Delivered Instantly' : 'Shipped - On the way'
    };
    setOrders(prev => [newOrder,...prev]);
    setPaying(null);
    setActiveDelivery(newOrder);
  };

  if (checking) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',background:'#f6f6f7'}}>Loading...</div>;

  if (!user) {
    return (
      <>
      <style>{`body{margin:0;font-family:-apple-system,sans-serif;background:#f6f6f7}.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:white;width:100%;max-width:400px;border-radius:16px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.08)}.title{color:#C1440E;font-size:28px;font-weight:800;text-align:center;margin:0}.sub{color:#6b7280;text-align:center;margin-top:4px;font-size:15px}.label{font-weight:600;font-size:14px;margin-top:20px;display:block;margin-bottom:8px}.input{width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box}.row{display:flex;justify-content:space-between;align-items:center;margin-top:16px}.check{display:flex;align-items:center;gap:8px;font-size:14px;color:#4b5563}.link{color:#E85A1A;font-size:14px;cursor:pointer;font-weight:500}.btn{width:100%;background:#E85A1A;color:white;border:0;border-radius:8px;padding:14px;font-weight:700;font-size:16px;margin-top:20px;cursor:pointer}`}</style>
      <div className="wrap"><div className="card">
        <h1 className="title">{isRegister?'Create Account':'Welcome Back'}</h1><p className="sub">{isRegister?'Register for permanent access':'Login to your account'}</p>
        <label className="label">Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} />
        <label className="label">Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} />
        <div className="row"><label className="check"><input type="checkbox" style={{width:18,height:18}} /> Remember me</label><span className="link">Forgot Password?</span></div>
        <button disabled={loading} onClick={handleAuth} className="btn">{loading?'Please wait...':(isRegister?'Register':'Log in')}</button>
        <div style={{textAlign:'center',marginTop:24,fontSize:14,color:'#4b5563'}}>{isRegister?'Already have account? ':'Don\'t have account? '}<span className="link" onClick={()=>setIsRegister(!isRegister)}>{isRegister?'Login':'Register'}</span></div>
      </div></div></>
    );
  }

  return (
    <>
    <style>{`body{margin:0;font-family:-apple-system,sans-serif;background:#f6f6f7}.header{position:sticky;top:0;background:white;border-bottom:1px solid #eee;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;z-index:5}.grid{max-width:1000px;margin:16px auto;padding:0 16px;display:grid;grid-template-columns:1fr;gap:14px} @media(min-width:600px){.grid{grid-template-columns:1fr 1fr}}.card2{background:white;border-radius:20px;padding:20px;border:1px solid #f0f0f0;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.badge{font-size:10px;padding:4px 8px;border-radius:999px;font-weight:800}.badge-digital{background:#e7f9ed;color:#0a7a2d}.badge-physical{background:#e8f0ff;color:#1a56db}.supportBtn{position:fixed;bottom:20px;right:20px;background:#25D366;color:white;border:0;width:56px;height:56px;border-radius:999px;font-size:28px;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:pointer;z-index:50;display:flex;align-items:center;justify-content:center}`}</style>

    <div className="header">
      <div style={{fontWeight:900}}>RAZZY STORE</div>
      <div style={{display:'flex',gap:8,alignItems:'center'}}>
        <span style={{fontSize:12,color:'#666'}}>Hi, {user.email.split('@')[0]}</span>
        <button onClick={()=>supabase.auth.signOut()} style={{background:'#f0f0f0',border:0,padding:'8px 14px',borderRadius:999,fontWeight:600,fontSize:12}}>Logout</button>
      </div>
    </div>

    <div style={{maxWidth:1000,margin:'12px auto',padding:'0 16px'}}>
      <h2 style={{fontWeight:900,fontSize:20}}>Pay & Get Instantly ⚡</h2>
      <p style={{fontSize:13,color:'#666',marginTop:4}}>Digital products delivered on site immediately • Physical SIMs shipped with tracking</p>
    </div>

    <div className="grid">
      {PRODUCTS.map(p=>(
        <div key={p.id} className="card2">
          <div style={{display:'flex',justifyContent:'space-between'}}><span style={{fontSize:28}}>{p.type==='digital'?'📦':'📮'}</span><span className={`badge ${p.type==='digital'?'badge-digital':'badge-physical'}`}>{p.type==='digital'?'DIGITAL • INSTANT':'PHYSICAL • SHIPPED'}</span></div>
          <div style={{fontWeight:800,marginTop:10,fontSize:16}}>{p.name}</div>
          <div style={{fontSize:13,color:'#666',marginTop:4}}>{p.desc}</div>
          <div style={{fontWeight:900,marginTop:12,fontSize:18}}>₦{p.price.toLocaleString()}</div>
          <button disabled={paying} onClick={()=>handlePay(p)} style={{width:'100%',marginTop:14,background: paying===p.id? '#999' : 'black',color:'white',border:0,padding:'14px',borderRadius:999,fontWeight:800,cursor:'pointer'}}>
            {paying===p.id? 'Processing payment...' : `Pay ₦${p.price.toLocaleString()} & Get Now`}
          </button>
          <div style={{fontSize:11,color:'#888',textAlign:'center',marginTop:8}}>{p.type==='digital'? '✓ Delivered inside this site after payment' : '✓ Tracking number provided after payment'}</div>
        </div>
      ))}
    </div>

    {orders.length>0 && (
      <div style={{maxWidth:1000,margin:'24px auto',padding:'0 16px'}}>
        <h3 style={{fontWeight:900}}>My Purchases / Deliveries</h3>
        {orders.map(o=>(
          <div key={o.id} style={{background:'white',borderRadius:16,padding:16,marginTop:12,border:'1px solid #eee'}}>
            <div style={{display:'flex',justifyContent:'space-between'}}><b style={{fontSize:14}}>{o.product}</b><span style={{fontSize:11,fontWeight:800,color: o.type==='digital'?'green':'blue'}}>{o.status}</span></div>
            <div style={{fontSize:12,color:'#888',marginTop:4}}>{o.date} • ₦{o.price.toLocaleString()}</div>
            <div style={{fontSize:13,marginTop:10,background:'#f8f9ff',padding:12,borderRadius:12,border:'1px dashed #ddd',whiteSpace:'pre-wrap'}}>{o.deliveryInfo}</div>
            <button onClick={()=>setActiveDelivery(o)} style={{marginTop:10,background:'#f0f0f0',border:0,padding:'8px 12px',borderRadius:999,fontSize:12,fontWeight:700}}>View Again</button>
          </div>
        ))}
      </div>
    )}

    {/* DELIVERY MODAL */}
    {activeDelivery && (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',backdropFilter:'blur(6px)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:100}} onClick={()=>setActiveDelivery(null)}>
        <div style={{background:'white',width:'100%',maxWidth:400,borderRadius:20,padding:24}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:'center',fontSize:48}}>✅</div>
          <h2 style={{textAlign:'center',fontWeight:900,marginTop:10}}>Payment Successful!</h2>
          <p style={{textAlign:'center',fontSize:13,color:'#666',marginTop:6}}>{activeDelivery.type==='digital'? 'Your digital product is ready - Use now:' : 'Your physical product is on the way:'}</p>
          <div style={{background:activeDelivery.type==='digital'?'#f0fdf4':'#eff6ff',border:'2px dashed #ccc',borderRadius:12,padding:14,marginTop:16,fontSize:13,whiteSpace:'pre-wrap',fontWeight:600}}>{activeDelivery.deliveryInfo}</div>
          <div style={{fontSize:11,color:'#888',textAlign:'center',marginTop:10}}>Saved in My Purchases forever • Access anytime</div>
          <button onClick={()=>setActiveDelivery(null)} style={{width:'100%',marginTop:16,background:'black',color:'white',border:0,padding:'14px',borderRadius:999,fontWeight:800}}>Done</button>
        </div>
      </div>
    )}

    {/* WHATSAPP SUPPORT ONLY */}
    <a href="https://wa.me/2348100000000?text=Hi Razzy Support, I need help" target="_blank" className="supportBtn" title="Customer Support">💬</a>
    <div style={{position:'fixed',bottom:85,right:22,background:'black',color:'white',fontSize:11,padding:'6px 10px',borderRadius:999}}>Support</div>
    </>
  );
}
