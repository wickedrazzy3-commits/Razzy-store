'use client';
import { useState, useEffect } from 'react';

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

  useEffect(() => {
    try{
      const savedUser = localStorage.getItem("razzy_user");
      if(savedUser) setUser(JSON.parse(savedUser));
      const s=localStorage.getItem("razzy_products");
      if(s){ const p=JSON.parse(s); if(Array.isArray(p)&&p.length>0) setProducts(p); }
    }catch{}
  }, []);

  const handleAuth = () => {
    if(!email ||!password) return alert('Enter email & password');
    if(password.length < 4) return alert('Password too short');

    // Get all users
    let users = [];
    try{ users = JSON.parse(localStorage.getItem("razzy_all_users")||"[]"); }catch{ users=[]; }

    if(isRegister){
      // REGISTER
      if(users.find(u=>u.email===email)) return alert('Email already registered! Login instead');
      users.push({email,password});
      localStorage.setItem("razzy_all_users", JSON.stringify(users));
      localStorage.setItem("razzy_user", JSON.stringify({email}));
      setUser({email});
      alert('Account created! ✅ Welcome to Razzy Store');
    }else{
      // LOGIN
      const found = users.find(u=>u.email===email && u.password===password);
      if(!found && users.length>0) return alert('Wrong email or password! If new, click Register');
      // If no users yet, allow first login as register
      if(users.length===0){
        users.push({email,password});
        localStorage.setItem("razzy_all_users", JSON.stringify(users));
      }
      localStorage.setItem("razzy_user", JSON.stringify({email}));
      setUser({email});
    }
  };

  const changeQty=(id,delta)=>setQtys(p=>({...p,[id]:Math.max(1,(p[id]||1)+delta)}));
  const handlePay=async(product)=>{
    const qty=qtys[product.id]||1;
    setPaying(product.id);
    await new Promise(r=>setTimeout(r,1000));
    setActiveDelivery({product:`${product.name} x${qty}`, price:product.price*qty, deliveryInfo:product.delivery});
    setPaying(null);
  };

  if(!user){
    return(
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',padding:20,background:'#f6f6f7',fontFamily:'sans-serif'}}>
        <div style={{background:'white',width:'100%',maxWidth:380,borderRadius:16,padding:28,boxShadow:'0 4px 20px rgba(0,0,0,0.06)'}}>
          <h1 style={{color:'#C1440E',fontSize:26,fontWeight:800,textAlign:'center',margin:0}}>{isRegister?'Create Account':'Welcome Back'}</h1>
          <p style={{textAlign:'center',color:'#888',fontSize:14,marginTop:4}}>{isRegister?'Register for permanent access':'Login to your account'}</p>

          <div style={{marginTop:20,fontWeight:600,fontSize:13}}>Email</div>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="your@email.com" style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd',marginTop:6,boxSizing:'border-box'}}/>

          <div style={{marginTop:12,fontWeight:600,fontSize:13}}>Password</div>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="At least 4 characters" style={{width:'100%',padding:12,borderRadius:8,border:'1px solid #ddd',marginTop:6,boxSizing:'border-box'}}/>

          <button onClick={handleAuth} style={{width:'100%',background:'#E85A1A',color:'white',border:0,padding:14,borderRadius:8,fontWeight:700,marginTop:20,cursor:'pointer',fontSize:15}}>
            {isRegister?'Register':'Log in'}
          </button>

          <div style={{textAlign:'center',marginTop:20,fontSize:13,color:'#555'}}>
            {isRegister?'Already have account? ':'Don\'t have account? '}
            <span onClick={()=>setIsRegister(!isRegister)} style={{color:'#E85A1A',cursor:'pointer',fontWeight:700}}>{isRegister?'Login':'Register'}</span>
          </div>
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:'sans-serif',background:'#f5f5f7',minHeight:'100vh'}}>
      <style>{`.header{position:sticky;top:0;background:white;padding:12px 14px;display:flex;justify-content:space-between;align-items:center;z-index:10}.grid{max-width:1100px;margin:12px auto;padding:0 12px;display:grid;grid-template-columns:1fr 1fr;gap:10px}.card2{background:white;border-radius:14px;overflow:hidden;border:1px solid #eee}.img{width:100%;height:130px;object-fit:cover}.qtyBox{display:flex;align-items:center;gap:8px;background:#f6f6f7;border-radius:999px;padding:3px 8px;margin-top:8px;width:fit-content}.qtyBtn{width:26px;height:26px;border-radius:999px;border:1px solid #ddd;background:white;font-weight:800;cursor:pointer}`}</style>

      <div className="header">
        <div style={{fontWeight:900}}>RAZZY STORE</div>
        <div style={{display:'flex',gap:8,alignItems:'center'}}>
          <span style={{fontSize:11}}>Hi, {user.email.split('@')[0]}</span>
          <button onClick={()=>{localStorage.removeItem("razzy_user"); setUser(null);}} style={{background:'#eee',border:0,padding:'6px 12px',borderRadius:999,fontSize:11,cursor:'pointer'}}>Logout</button>
        </div>
      </div>

      <div className="grid">
        {products.map(p=>(
          <div key={p.id} className="card2">
            <img src={p.img} className="img" alt={p.name}/>
            <div style={{padding:10}}>
              <div style={{fontWeight:700,fontSize:13,height:32,overflow:'hidden'}}>{p.name}</div>
              <div style={{fontWeight:900,marginTop:4}}>₦{Number(p.price).toLocaleString()}</div>
              <div className="qtyBox">
                <button className="qtyBtn" onClick={()=>changeQty(p.id,-1)}>-</button>
                <span style={{fontWeight:800,fontSize:13,minWidth:18,textAlign:'center'}}>{qtys[p.id]||1}</span>
                <button className="qtyBtn" onClick={()=>changeQty(p.id,1)}>+</button>
                <span style={{fontSize:10,color:'#888',marginLeft:4}}>Qty</span>
              </div>
              <button onClick={()=>handlePay(p)} disabled={pay
