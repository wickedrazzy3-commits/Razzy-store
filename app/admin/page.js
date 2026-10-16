'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const DEFAULTS=[
 {id:1,name:"UK Physical SIM - Ready for WhatsApp",price:15000,oldPrice:18000,type:"physical",img:"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400", delivery:"Tracking: UK-GIFF-88291 | DHL | ETA 3-5 days"},
 {id:2,name:"USA T-Mobile SIM - 5G Unlimited",price:20000,oldPrice:25000,type:"physical",img:"https://images.unsplash.com/photo-1581993192872-14d6f2e1e0d4?w=400", delivery:"Tracking: TM-US-99231 | FedEx | ETA 5-7 days"},
 {id:3,name:"Voice Changer Device - 8 Voices",price:35000,oldPrice:45000,type:"physical",img:"https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=400", delivery:"Tracking: VC-7732 | Free delivery"},
 {id:4,name:"Aged TikTok Account 1k Followers",price:12000,oldPrice:15000,type:"digital",img:"https://images.unsplash.com/photo-1611162616475-46b76543ac5f?w=400", delivery:"Login: tiktok_aged_01@gmail.com | Pass: RazzyTikTok123!"},
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(DEFAULTS);
  const [qtys, setQtys] = useState({1:1,2:1,3:1,4:1});
  const [paying, setPaying] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user||null); setChecking(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user||null));
    const s=localStorage.getItem("razzy_products");
    if(s) { try{ setProducts(JSON.parse(s).map(p=>({...p, delivery:p.delivery||DEFAULTS.find(d=>d.id===p.id)?.delivery}))); }catch{} }
    const savedOrders=localStorage.getItem("razzy_orders_final");
    if(savedOrders) setOrders(JSON.parse(savedOrders));
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(()=>{ localStorage.setItem("razzy_orders_final",JSON.stringify(orders)); },[orders]);

  const handleAuth = async () => {
    if (!email ||!password) return alert('Fill email & password');
    setLoading(true);
    try {
      if (isRegister) { const { error } = await supabase.auth.signUp({ email, password }); if (error) throw error; alert('Account created! ✅'); }
      else { const { error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; }
    } catch (e) { alert(e.message); }
    setLoading(false);
  };

  const changeQty = (id, delta) => setQtys(prev=>({...prev, [id]: Math.max(1, (prev[id]||1)+delta)}));
  const handlePay = async (product) => {
    const qty = qtys[product.id]||1;
    setPaying(product.id);
    await new Promise(r=>setTimeout(r,1800));
    const newOrder={ id:Date.now(), product:`${product.name} x${qty}`, price:product.price*qty, qty, type:product.type, img:product.img, deliveryInfo: qty>1 && product.type==='digital'? `${qty} Accounts:\n${Array(qty).fill(0).map((_,i)=>`${i+1}. ${product.delivery}`).join('\n')}` : product.delivery, date:new Date().toLocaleString(), status: product.type==="digital"?"Delivered Instantly":`Shipped x${qty}` };
    setOrders(prev=>[newOrder,...prev]);
    setPaying(null);
    setActiveDelivery(newOrder);
  };

  if (checking) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>Loading...</div>;
  if (!user) {
    return (
      <>
      <style>{`body{margin:0;font-family:-apple-system,sans-serif;background:#f6f6f7}.wrap{min-height:100vh;display:flex;align-items:center;justify-content:center;padding:20px}.card{background:white;width:100%;max-width:400px;border-radius:16px;padding:32px 28px;box-shadow:0 4px 24px rgba(0,0,0,0.08)}.title{color:#C1440E;font-size:28px;font-weight:800;text-align:center;margin:0}.sub{color:#6b7280;text-align:center;margin-top:4px;font-size:15px}.label{font-weight:600;font-size:14px;margin-top:20px;display:block;margin-bottom:8px}.input{width:100%;border:1px solid #e5e7eb;border-radius:8px;padding:12px 14px;font-size:14px;outline:none;box-sizing:border-box}.btn{width:100%;background:#E85A1A;color:white;border:0;border-radius:8px;padding:14px;font-weight:700;font-size:16px;margin-top:20px;cursor:pointer}.link{color:#E85A1A;font-size:14px;cursor:pointer;font-weight:500}`}</style>
      <div className="wrap"><div className="card"><h1 className="title">{isRegister?'Create Account':'Welcome Back'}</h1><p className="sub">Login to your account</p><label className="label">Email</label><input className="input" value={email} onChange={e=>setEmail(e.target.value)} /><label className="label">Password</label><input className="input" type="password" value={password} onChange={e=>setPassword(e.target.value)} /><button disabled={loading} onClick={handleAuth} className="btn">{loading?'Please wait...':(isRegister?'Register':'Log in')}</button><div style={{textAlign:'center',marginTop:24,fontSize:14}}>Don't have account? <span className="link" onClick={()=>setIsRegister(!isRegister)}>{isRegister?'Login':'Register'}</span></div></div></div>
      </>
    );
  }

  return (
    <>
    <style>{`body{margin:0;font-family:-apple-system,sans-serif;background:#f5f5f7}.header{
