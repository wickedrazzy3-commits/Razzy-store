'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const DEFAULTS=[
 {id:1,name:"Facebook create page ✅ ( all accounts can create",price:4000,oldPrice:5000,type:"digital",img:"https://images.unsplash.com/photo-1611162616475-46b76543ac5f?w=400", delivery:"Page Key: PAGE-RAZZY-8849"},
 {id:2,name:"Uk physical sim",price:26000,oldPrice:30000,type:"physical",img:"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400", delivery:"Tracking: UK-GIFF-88291"},
 {id:3,name:"T- mobile physical sim",price:120000,oldPrice:150000,type:"physical",img:"https://images.unsplash.com/photo-1592898751226-3804d78dc5db?w=400", delivery:"Tracking: TM-US-99231"},
];

export default function Home() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [products, setProducts] = useState(DEFAULTS);
  const [qtys, setQtys] = useState({1:1,2:1,3:1});
  const [paying, setPaying] = useState(null);
  const [orders, setOrders] = useState([]);
  const [activeDelivery, setActiveDelivery] = useState(null);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => { setUser(data.session?.user||null); setChecking(false); });
    const { data: l } = supabase.auth.onAuthStateChange((_, s) => setUser(s?.user||null));
    const s=localStorage.getItem("razzy_products");
    if(s){try{setProducts(JSON.parse(s))}catch{}}
    const saved=localStorage.getItem("razzy_orders_final");
    if(saved) setOrders(JSON.parse(saved));
    return () => l.subscription.unsubscribe();
  }, []);
  useEffect(()=>{localStorage.setItem("razzy_orders_final",JSON.stringify(orders))},[orders]);

  const handleAuth = async () => {
    if(!email||!password) return alert('Fill email & password');
    setLoading(true);
    try{
      if(isRegister){const {error}=await supabase.auth.signUp({email,password}); if(error) throw error; alert('Account created!');}
      else{const {error}=await supabase.auth.signInWithPassword({email,password}); if(error) throw error;}
    }catch(e){alert(e.message)} setLoading(false);
  };

  const changeQty=(id,delta)=>setQtys(p=>({...p,[id]:Math.max(1,(p[id]||1)+delta)}));
  const handlePay=async(product)=>{
    const qty=qtys[product.id]||1;
    setPaying(product.id);
    await new Promise(r=>setTimeout(r,1500));
    const newOrder={id:Date.now(),product:`${product.name} x${qty}`,price:product.price*qty,qty,type:product.type,img:product.img,deliveryInfo:product.delivery,date:new Date().toLocaleString()};
    setOrders(o=>[newOrder,...o]);
    setPaying(null);
    setActiveDelivery(newOrder);
  };

  if(checking) return <div style={{display:'flex',height:'100vh',alignItems:'center',justifyContent:'center'}}>Loading...</div>;
  if(!user){
    return(
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'#f6f6f7'}}>
        <div style={{background:'white',width:'100%',maxWidth:380,borderRadius:16,padding:28}}>
          <h1 style={{color:'#C1440E',fontSize:26,fontWeight:800,textAlign:'center',margin:0}}>{isRegister?'Create Account':'Welcome Back'}</h1>
          <p style={{textAlign:'center',color:'#888',fontSize:14}}>Login to your account</p>
          <div style={{marginTop:20,fontWeight:600,fontSize:13}}>Email</div><input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd',marginTop:6,boxSizing:'border-box'}}/>
          <div style={{marginTop:12,fontWeight:600,fontSize:13}}>Password</div><input type="password" value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd',marginTop:6,boxSizing:'border-box'}}/>
          <button disabled={loading} onClick={handleAuth} style={{width:'100%',background:'#E85A1A',color:'white',border:0,padding:14,borderRadius:8,fontWeight:700,marginTop:20}}>{loading?'Wait...':(isRegister?'Register':'Log in')}</button>
          <div style={{textAlign:'center',marginTop:20,fontSize:13}}>Don't have account? <span onClick={()=>setIsRegister(!isRegister)} style={{color:'#E85A1A',cursor:'pointer',fontWeight:700}}>{isRegister?'Login':'Register'}</span></div>
        </div>
      </div>
    );
  }

  return(
    <>
      <style>{`body{margin:0;font-family:sans-serif;background:#f5f5f7}.header{position:sticky;top:0;background:white;padding:12px 14px;display:flex;justify-content:space-between;align-items:center}.grid{max-width:1100px;margin:12px auto;padding:0 12px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.card2{background:white;border-radius:14px;overflow:hidden;border:1px solid #eee}.img{width:100%;height:130px;object-fit:cover}.qtyBox{display:flex;align-items:center;gap:8px;background:#f6f6f7;border-radius:999px;padding:3px 8px;margin-top:8px;width:fit-content}.qtyBtn{width:26px;height:26px;border-radius:999px;border:1px solid #ddd;background:white;font-weight:800}`}</style>
      <div className="header">
        <div style={{fontWeight:900}}>RAZZY STORE</div>
        <button onClick={()=>supabase.auth.signOut()} style={{background:'#eee',border:0,padding:'6px 12px',borderRadius:999,fontSize:11}}>Logout</button>
      </div>

      <div className="grid">
        {products.map(p=>(
          <div key={p.id} className="card2">
            <img src={p.img} className="img"/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700,fontSize:13,height:32,overflow:'hidden'}}>{p.name}</div>
              <div style={{fontWeight:900,marginTop:4}}>₦{p.price.toLocaleString()}</div>
              <div className="qtyBox">
                <button className="qtyBtn" onClick={()=>changeQty(p.id,-1)}>-</button>
                <span style={{fontWeight:800,fontSize:13,minWidth:18,textAlign:'center'}}>{qtys[p.id]||1}</span>
                <button className="qtyBtn" onClick={()=>changeQty(p.id,1)}>+</button>
                <span style={{fontSize:10,color:'#888',marginLeft:4}}>Qty</span>
              </div>
              <button disabled={paying===p.id} onClick={()=>handlePay(p)} style={{width:'100%',marginTop:8,background:'black',color:'white',border:0,padding:'11px',borderRadius:999,fontWeight:800,fontSize:12}}>
                {paying===p.id?'Processing...':`Pay ₦${(p.price*(qtys[p.id]||1)).toLocaleString()}`}
              </button>
            </div>
          </div>
        ))}
      </div>

      {activeDelivery && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,0.5)',display:'flex',alignItems:'center',justifyContent:'center',padding:20,zIndex:100}} onClick={()=>setActiveDelivery(null)}>
          <div style={{background:'white',width:'100%',maxWidth:340,borderRadius:20,padding:20}} onClick={e=>e.stopPropagation()}>
            <div style={{textAlign:'center',fontSize:34}}>✅</div>
            <h3 style={{textAlign:'center',fontWeight:900}}>Payment Successful!</h3>
            <div style={{background:'#f0fdf4',border:'1px dashed #ccc',padding:10,borderRadius:8,fontSize:12,marginTop:10}}>{activeDelivery.deliveryInfo}</div>
            <button onClick={()=>setActiveDelivery(null)} style={{width:'100%',marginTop:12,background:'black',color:'white',border:0,padding:12,borderRadius:999,fontWeight:800}}>Done</button>
          </div>
        </div>
      )}
    </>
  );
}
