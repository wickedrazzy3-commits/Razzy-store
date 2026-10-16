'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const PRODUCTS = [
  { id: 1, name: 'Facebook Create Page ✅', desc: 'All accounts can create page', price: 4000, emoji: '📘' },
  { id: 2, name: 'Uk Physical Sim', desc: 'UK Giffgaff/O2 for verification', price: 26000, emoji: '🇬🇧' },
  { id: 3, name: 'T-Mobile Physical Sim', desc: 'USA T-Mobile 5G SIM', price: 120000, emoji: '🇺🇸' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUser(data.session?.user || null);
      setChecking(false);
    });
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user || null));
    const saved = localStorage.getItem('razzy_cart');
    if (saved) setCart(JSON.parse(saved));
    return () => l.subscription.unsubscribe();
  }, []);

  useEffect(() => { localStorage.setItem('razzy_cart', JSON.stringify(cart)); }, [cart]);

  const handleAuth = async () => {
    if (!email ||!password) return alert('Fill email and password');
    setLoading(true);
    try {
      if (isRegister) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account created! You are now logged in ✅');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
      }
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id? {...i, qty: i.qty+1} : i);
      return [...prev, {...p, qty:1}];
    });
    setShowCart(true);
  };

  if (checking) return <div style={{display:'flex', height:'100vh', alignItems:'center', justifyContent:'center', background:'#f5f5f7'}}>Loading...</div>;

  // LOGIN WALL - EXACTLY LIKE YOUR IMAGE
  if (!user) {
    return (
      <>
        <style>{`
          body{margin:0; font-family: -apple-system, sans-serif; background:#f6f6f7;}
         .wrap{min-height:100vh; display:flex; align-items:center; justify-content:center; padding:20px;}
         .card{background:white; width:100%; max-width:400px; border-radius:16px; padding:32px 28px; box-shadow:0 4px 24px rgba(0,0,0,0.08);}
         .title{color:#C1440E; font-size:28px; font-weight:800; text-align:center; margin:0}
         .sub{color:#6b7280; text-align:center; margin-top:4px; font-size:15px}
         .label{font-weight:600; font-size:14px; margin-top:20px; display:block; margin-bottom:8px}
         .input{width:100%; border:1px solid #e5e7eb; border-radius:8px; padding:12px 14px; font-size:14px; outline:none; box-sizing:border-box}
         .input:focus{border-color:#E85A1A}
         .row{display:flex; justify-content:space-between; align-items:center; margin-top:16px}
         .check{display:flex; align-items:center; gap:8px; font-size:14px; color:#4b5563}
         .link{color:#E85A1A; font-size:14px; text-decoration:none; cursor:pointer; font-weight:500}
         .btn{width:100%; background:#E85A1A; color:white; border:0; border-radius:8px; padding:14px; font-weight:700; font-size:16px; margin-top:20px; cursor:pointer}
         .btn:disabled{opacity:0.6}
         .foot{text-align:center; margin-top:24px; font-size:14px; color:#4b5563}
        `}</style>
        <div className="wrap">
          <div className="card">
            <h1 className="title">{isRegister? 'Create Account' : 'Welcome Back'}</h1>
            <p className="sub">{isRegister? 'Register for permanent access' : 'Login to your account'}</p>

            <label className="label">Email</label>
            <input className="input" value={email} onChange={e=>setEmail(e.target.value)} placeholder="" />

            <label className="label">Password</label>
            <input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="" />

            <div className="row">
              <label className="check"><input type="checkbox" style={{width:18, height:18}} /> Remember me</label>
              <span className="link">Forgot Password?</span>
            </div>

            <button disabled={loading} onClick={handleAuth} className="btn">{loading? 'Please wait...' : (isRegister? 'Register' : 'Log in')}</button>

            <div className="foot">
              {isRegister? 'Already have an account? ' : "Don't have an account? "}
              <span className="link" onClick={()=>setIsRegister(!isRegister)}>{isRegister? 'Login' : 'Register'}</span>
            </div>
          </div>
        </div>
      </>
    );
  }

  // STORE AFTER LOGIN
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  return (
    <>
      <style>{`
        body{margin:0; font-family:-apple-system, sans-serif; background:#f6f6f7}
       .header{position:sticky; top:0; background:white; border-bottom:1px solid #eee; padding:14px 16px; display:flex; justify-content:space-between; align-items:center; z-index:5}
       .grid{max-width:1000px; margin:20px auto; padding:0 16px; display:grid; grid-template-columns:1fr 1fr; gap:14px}
       .card2{background:white; border-radius:20px; padding:18px; border:1px solid #f0f0f0}
       .btn2{border:0; padding:10px 16px; border-radius:999px; font-weight:700; cursor:pointer}
       .overlay{position:fixed; inset:0; background:rgba(0,0,0,0.3); display:flex; justify-content:flex-end; z-index:20}
       .drawer{background:white; width:100%; max-width:360px; height:100%; padding:20px; display:flex; flex-direction:column}
      `}</style>
      <div className="header">
        <div style={{fontWeight:900}}>RAZZY STORE</div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>setShowCart(true)} className="btn2" style={{background:'black', color:'white'}}>Cart ({cart.reduce((a,b)=>a+b.qty,0)})</button>
          <button onClick={()=>supabase.auth.signOut()} className="btn2" style={{background:'#f0f0f0'}}>Logout</button>
        </div>
      </div>
      <div style={{maxWidth:1000, margin:'10px auto', padding:'0 16px', fontSize:14}}>Welcome, {user.email} ✅ Permanent login active</div>
      <div className="grid">
        {PRODUCTS.map(p=>(
          <div key={p.id} className="card2">
            <div style={{fontSize:28}}>{p.emoji}</div>
            <div style={{fontWeight:800, marginTop:8}}>{p.name}</div>
            <div style={{fontSize:12, color:'#888', marginTop:4}}>{p.desc}</div>
            <div style={{fontWeight:900, marginTop:10}}>₦{p.price.toLocaleString()}</div>
            <button onClick={()=>addToCart(p)} style={{width:'100%', marginTop:12, background:'#E85A1A', color:'white', border:0, padding:'12px', borderRadius:999, fontWeight:700}}>Add to Cart</button>
          </div>
        ))}
      </div>
      {showCart && (
        <div className="overlay" onClick={()=>setShowCart(false)}>
          <div className="drawer" onClick={e=>e.stopPropagation()}>
            <div style={{display:'flex', justifyContent:'space-between'}}><b>Your Cart</b><button onClick={()=>setShowCart(false)}>✕</button></div>
            <div style={{flex:1, marginTop:20}}>
              {cart.map(i=><div key={i.id} style={{background:'#f6f6f7', padding:12, borderRadius:12, marginBottom:10, display:'flex', justifyContent:'space-between'}}><div><b style={{fontSize:13}}>{i.name}</b><div style={{fontSize:12}}>x{i.qty} • ₦{(i.price*i.qty).toLocaleString()}</div></div><button onClick={()=>setCart(cart.filter(c=>c.id!==i.id))} style={{color:'red', border:0, background:'none'}}>Remove</button></div>)}
            </div>
            <div><div style={{display:'flex', justifyContent:'space-between', fontWeight:900}}><span>Total</span><span>₦{total.toLocaleString()}</span></div><a href={`https://wa.me/2348100000000?text=Order: ${cart.map(c=>`${c.name} x${c.qty}`).join(', ')} Total ₦${total}`} style={{display:'block', textAlign:'center', background:'black', color:'white', padding:14, borderRadius:999, marginTop:12, textDecoration:'none'}}>Checkout WhatsApp</a></div>
          </div>
        </div>
      )}
    </>
  );
}
