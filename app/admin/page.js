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
    <style>{`body{margin:0;font-family:-apple-system,sans-serif;background:#f5f5f7}.header{position:sticky;top:0;background:white;border-bottom:1px solid #eee;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;z-index:5}.grid{max-width:1100px;margin:12px auto;padding:0 12px;display:grid;grid-template-columns:1fr 1fr;gap:10px} @media(min-width:700px){.grid{grid-template-columns:1fr 1fr 1fr 1fr}}.card2{background:white;border-radius:14px;overflow:hidden;border:1px solid #eee}.img{width:100%;height:130px;object-fit:cover}.qtyBox{display:flex;align-items:center;gap:8px;background:#f6f6f7;border-radius:999px;padding:3px 8px;margin-top:8px;width:fit-content}.qtyBtn{width:26px;height:26px;border-radius:999px;border:1px solid #ddd;background:white;font-weight:800;cursor:pointer}.supportBtn{position:fixed;bottom:20px;right:20px;background:#25D366;color:white;border:0;width:56px;height:56px;border-radius:999px;font-size:28px;box-shadow:0 4px 12px rgba(0,0,0,0.2);cursor:pointer;z-index:50}`}</style>

    <div className="header"><div style={{fontWeight:900}}>RAZZY STORE</div><div style={{display:'flex',gap:6}}><a href="/admin" style={{background:'#f0f0f0',padding:'6px 12px',borderRadius:999,fontSize:11,textDecoration:'none',color:'black',fontWeight:700}}>Admin</a><button onClick={()=>supabase.auth.signOut()} style={{background:'#eee',border:0,padding:'6px 12px',borderRadius:999,fontSize:11}}>Logout</button></div></div>

    <div className="grid">
      {products.map(p=>(
        <div key={p.id} className="card2">
          <img src={p.img} className="img"/>
          <div style={{padding:10}}>
            <div style={{fontWeight:700,fontSize:13,lineHeight:'15px',height:30,overflow:'hidden'}}>{p.name}</div>
            <div style={{display:'flex',alignItems:'center',gap:6,marginTop:4}}><span style={{fontWeight:900,fontSize:14}}>₦{p.price.toLocaleString()}</span>{p.oldPrice>p.price && <span style={{fontSize:10,textDecoration:'line-through',color:'#999'}}>₦{p.oldPrice.toLocaleString()}</span>}</div>

            {/* QTY SELECTOR - HERE */}
            <div className="qtyBox">
              <button className="qtyBtn" onClick={()=>changeQty(p.id,-1)}>-</button>
              <span style={{fontWeight:800,fontSize:13,minWidth:18,textAlign:'center'}}>{qtys[p.id]||1}</span>
              <button className="qtyBtn" onClick={()=>changeQty(p.id,1)}>+</button>
              <span style={{fontSize:10,color:'#888',marginLeft:4}}>Qty</span>
            </div>

            <button disabled={paying===p.id} onClick={()=>handlePay(p)} style={{width:'100%',marginTop:8,background:paying===p.id?'#999':'black',color:'white',border:0,padding:'10px',borderRadius:999,fontWeight:800,fontSize:12,cursor:'pointer'}}>
              {paying===p.id?'Processing...':`Pay ₦${(p.price*(qtys[p.id]||1)).toLocaleString()} & Get Now`}
            </button>
            <div style={{fontSize:9,color:'#666',textAlign:'center',marginTop:4}}>{p.type==='digital'?'✓ Instant delivery in site':'✓ Tracking in site'}</div>
          </div>
        </div>
      ))}
    </div>

    {orders.length>0 && (
      <div style={{maxWidth:1100,margin:'20px auto',padding:'0 12px'}}>
        <h3 style={{fontWeight:900,fontSize:15}}>My Purchases</h3>
        {orders.map(o=><div key={o.id} style={{background:'white',borderRadius:12,padding:10,marginTop:8,border:'1px solid #eee'}}><b style={{fontSize:12}}>{o.product}</b> - ₦{o.price.toLocaleString()}<div style={{fontSize:11,marginTop:4,background:'#f8f9ff',padding:6,borderRadius:6,whiteSpace:'pre-wrap'}}>{o.deliveryInfo}</div></div>)}
      </div>
    )}

    {activeDelivery && (
      <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:100}} onClick={()=>setActiveDelivery(null)}>
        <div style={{background:'white',width:'100%',maxWidth:380,borderRadius:20,padding:20}} onClick={e=>e.stopPropagation()}>
          <div style={{textAlign:'center',fontSize:36}}>✅</div><h3 style={{textAlign:'center',fontWeight:900}}>Payment Successful!</h3><p style={{textAlign:'center',fontSize:12,color:'#666'}}>{activeDelivery.qty>1?`${activeDelivery.qty} items delivered:`:'Your item delivered:'}</p>
          <div style={{background:'#f0fdf4',border:'2px dashed #ccc',borderRadius:10,padding:10,marginTop:10,fontSize:11,whiteSpace:'pre-wrap'}}>{activeDelivery.deliveryInfo}</div>
          <button onClick={()=>setActiveDelivery(null)} style={{width:'100%',marginTop:12,background:'black',color:'white',border:0,padding:12,borderRadius:999,fontWeight:800}}>Done</button>
        </div>
      </div>
    )}
    <a href="https://wa.me/2348100000000?text=Hi Razzy Support" target="_blank" className="supportBtn">💬</a>
    </>
  );
}
