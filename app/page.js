'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const PRODUCTS = [
  { id: 1, name: 'Facebook Create Page ✅', desc: 'All accounts can create page • Instant Delivery', price: 4000, emoji: '📘' },
  { id: 2, name: 'Uk Physical Sim', desc: 'Giffgaff/O2 UK Sim • Tracking included', price: 26000, emoji: '🇬🇧' },
  { id: 3, name: 'T-Mobile Physical Sim', desc: 'USA T-Mobile 5G • Free shipping', price: 120000, emoji: '🇺🇸' },
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);

  const [cart, setCart] = useState([]);
  const [qtys, setQtys] = useState({1:1,2:1,3:1});
  const [showCart, setShowCart] = useState(false);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user||null); setChecking(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user||null));
    const saved = localStorage.getItem('razzy_cart_v2');
    if (saved) setCart(JSON.parse(saved));
    const savedOrders = localStorage.getItem('razzy_orders');
    if (savedOrders) setOrders(JSON.parse(savedOrders));
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(() => { localStorage.setItem('razzy_cart_v2', JSON.stringify(cart)); }, [cart]);
  useEffect(() => { localStorage.setItem('razzy_orders', JSON.stringify(orders)); }, [orders]);

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

  const changeQty = (id, delta) => {
    setQtys(prev => ({...prev, [id]: Math.max(1, (prev[id]||1)+delta) }));
  };

  const addToCart = (p) => {
    const qty = qtys[p.id]||1;
    setCart(prev => {
      const ex = prev.find(i => i.id === p.id);
      if (ex) return prev.map(i => i.id===p.id? {...i, qty: i.qty+qty} : i);
      return [...prev, {...p, qty}];
    });
    setShowCart(true);
  };

  const updateCartQty = (id, delta) => {
    setCart(prev => prev.map(i => {
      if (i.id===id) {
        const newQty = i.qty+delta;
        if (newQty<1) return null;
        return {...i, qty:newQty};
      }
      return i;
    }).filter(Boolean));
  };

  const checkout = () => {
    if (cart.length===0) return;
    const order = { id: Date.now(), items: [...cart], total: cart.reduce((s,i)=>s+i.price*i.qty,0), date: new Date().toLocaleString(), status: 'Delivered' };
    setOrders(prev => [order,...prev]);
    setCart([]);
    setShowCart(false);
    alert(`Order Successful! ✅\n\nDigital items will be delivered in your dashboard instantly!\nOrder ID: ${order.id}\nCheck "My Orders" below`);
  };

  if (checking) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center',background:'#f6f6f7'}}>Loading Razzy Store...</div>;

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

  const total = cart.reduce((s,i)=>s+i.price*i.qty,0);
  return (
    <>
    <style>{`body{margin:0;font-family:-apple-system,sans-serif;background:#f6f6f7}.header{position:sticky;top:0;background:white;border-bottom:1px solid #eee;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;z-index:5}.grid{max-width:1000px;margin:16px auto;padding:0 16px;display:grid;grid-template-columns:1fr 1fr;gap:14px} @media(min-width:700px){.grid{grid-template-columns:1fr 1fr 1fr}}.card2{background:white;border-radius:20px;padding:18px;border:1px solid #f0f0f0;box-shadow:0 2px 8px rgba(0,0,0,0.04)}.qtyBox{display:flex;align-items:center;gap:10px;background:#f6f6f7;border-radius:999px;padding:4px 10px;margin-top:10px;width:fit-content}.qtyBtn{width:28px;height:28px;border-radius:999px;border:1px solid #ddd;background:white;cursor:pointer;font-weight:700}.overlay{position:fixed;inset:0;background:rgba(0,0,0,0.3);display:flex;justify-content:flex-end;z-index:20}.drawer{background:white;width:100%;max-width:380px;height:100%;padding:20px;display:flex;flex-direction:column}.del
