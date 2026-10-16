'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const PRODUCTS = [
  { id: 1, name: 'Facebook Create Page ✅', desc: 'All accounts can create page', price: 4000, emoji: '📘' },
  { id: 2, name: 'Uk Physical Sim', desc: 'UK Giffgaff/O2 for verification', price: 26000, emoji: '🇬🇧' },
  { id: 3, name: 'T-Mobile Physical Sim', desc: 'USA T-Mobile 5G SIM', price: 120000, emoji: '🇺🇸' },
];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('razzy_cart');
    if (saved) setCart(JSON.parse(saved));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
  }, []);
  useEffect(() => { localStorage.setItem('razzy_cart', JSON.stringify(cart)); }, [cart]);

  const addToCart = (p) => {
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id === p.id? {...i, qty: i.qty+1} : i);
      return [...prev, {...p, qty: 1}];
    });
    setShowCart(true);
  };
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  const handleAuth = async (isSignup) => {
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account Created! ✅');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert('Logged in! ✅');
      }
      setShowLogin(false);
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const filtered = PRODUCTS.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
    <style>{`
      body { margin:0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; background:#f6f6f8; }
     .header { position:sticky; top:0; background:rgba(255,255,255,0.9); backdrop-filter: blur(20px); border-bottom:1px solid #eee; padding:16px; z-index:10 }
     .top { max-width:1000px; margin:0 auto; display:flex; justify-content:space-between; align-items:center }
     .logo { font-weight:900; font-size:22px; letter-spacing:-1px }
     .btn { border:0; padding:10px 18px; border-radius:999px; font-weight:600; font-size:14px; cursor:pointer }
     .btn-black { background:black; color:white }
     .btn-gray { background:#efefef }
     .grid { max-width:1000px; margin:20px auto; padding:0 16px; display:grid; grid-template-columns:1fr 1fr; gap:14px }
      @media(min-width:700px){.grid{grid-template-columns:1fr 1fr 1fr} }
     .card { background:white; border-radius:24px; padding:18px; border:1px solid #f0f0f0; box-shadow:0 2px 10px rgba(0,0,0,0.04) }
     .emoji { width:48px; height:48px; background:#f5f5f7; border-radius:999px; display:flex; align-items:center; justify-content:center; font-size:24px; margin-bottom:12px }
     .overlay { position:fixed; inset:0; background:rgba(0,0,0,0.3); backdrop-filter:blur(4px); display:flex; justify-content:flex-end; z-index:50 }
     .drawer { background:white; width:100%; max-width:360px; height:100%; padding:24px; display:flex; flex-direction:column }
     .modalBg { position:fixed; inset:0; background:rgba(0,0,0,0.4); backdrop-filter:blur(8px); display:flex; align-items:center; justify-content:center; z-index:60; padding:20px }
     .modal { background:white; width:100%; max-width:360px; border-radius:28px; padding:28px }
     .input { width:100%; background:#f2f2f5; border:0; padding:14px 16px; border-radius:999px; margin-top:12px; outline:none }
    `}</style>

    <div className="header">
      <div className="top">
        <div className="logo">RAZZY STORE</div>
        <div style={{display:'flex', gap:8}}>
          <button onClick={()=>setShowCart(true)} className="btn btn-black">Cart ({cart.reduce((a,b)=>a+b.qty,0)})</button>
          <button onClick={()=> user? supabase.auth.signOut().then(()=>setUser(null)) : setShowLogin(true)} className="btn btn-gray">{user? user.email.split('@')[0] : 'Login'}</button>
        </div>
      </div>
      <div style={{maxWidth:1000, margin:'12px auto 0'}}>
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="input" style={{background:'white', border:'1px solid #eee'}} />
      </div>
    </div>

    <div className="grid">
      {filtered.map(p=>(
        <div key={p.id} className="card">
          <div className="emoji">{p.emoji}</div>
          <div style={{fontWeight:800, fontSize:15, lineHeight:'1.2'}}>{p.name}</div>
          <div style={{fontSize:12, color:'#888', marginTop:6}}>{p.desc}</div>
          <div style={{fontWeight:900, marginTop:12, fontSize:16}}>₦{p.price.toLocaleString()}</div>
          <button onClick={()=>addToCart(p)} className="btn btn-black" style={{width:'100%', marginTop:14, padding:'14px'}}>Add to Cart</button>
        </div>
      ))}
    </div>

    {showCart && (
      <div className="overlay" onClick={()=>setShowCart(false)}>
        <div className="drawer" onClick={e=>e.stopPropagation()}>
          <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}><h2 style={{fontWeight:900, fontSize:20}}>Your Cart</h2><button onClick={()=>setShowCart(false)} style={{fontSize:20, border:0, background:'none'}}>✕</button></div>
          <div style={{flex:1, overflow:'auto', marginTop:20}}>
            {cart.length===0 && <p style={{textAlign:'center', color:'#aaa', marginTop:80}}>Cart empty</p>}
            {cart.map(i=><div key={i.id} style={{display:'flex', justifyContent:'space-between', background:'#f6f6f8', padding:12, borderRadius:16, marginBottom:10}}><div><div style={{fontWeight:700, fontSize:14}}>{i.name}</div><div style={{fontSize:12}}>x{i.qty} • ₦{(i.price*i.qty).toLocaleString()}</div></div><button onClick={()=>setCart(cart.filter(c=>c.id!==i.id))} style={{border:0, background:'none', color:'red', fontSize:12}}>Remove</button></div>)}
          </div>
          <div style={{borderTop:'1px solid #eee', paddingTop:16}}><div style={{display:'flex', justifyContent:'space-between', fontWeight:900, fontSize:18}}><span>Total</span><span>₦{total.toLocaleString()}</span></div>
          <a href={`https://wa.me/2348100000000?text=Hi Razzy, I want to order ${cart.map(c=>`${c.name} x${c.qty}`).join(', ')} Total ₦${total}`} style={{display:'block', textAlign:'center', background:'black', color:'white', padding:'16px', borderRadius:999, marginTop:12, textDecoration:'none', fontWeight:800}}>Checkout on WhatsApp</a></div>
        </div>
      </div>
    )}

    {showLogin && (
      <div className="modalBg" onClick={()=>setShowLogin(false)}>
        <div className="modal" onClick={e=>e.stopPropagation()}>
          <div style={{fontWeight:900, fontSize:24}}>Welcome back</div><div style={{fontSize:13, color:'#888', marginTop:4}}>Permanent login - any device</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" className="input" />
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password (6+ chars)" className="input" />
          <button disabled={loading} onClick={()=>handleAuth(false)} className="btn btn-black" style={{width:'100%', marginTop:16, padding:'14px'}}>{loading?'Wait...':'Login'}</button>
          <button disabled={loading} onClick={()=>handleAuth(true)} className="btn btn-gray" style={{width:'100%', marginTop:8, padding:'14px'}}>Create permanent account</button>
          <button onClick={()=>setShowLogin(false)} style={{width:'100%', border:0, background:'none', marginTop:12, fontSize:12, color:'#aaa'}}>Close</button>
        </div>
      </div>
    )}
    </>
  );
}
