'use client';
import { useState, useEffect } from 'react';

export default function Home(){
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [products, setProducts] = useState([]);
  const [profile, setProfile] = useState(null);
  const [orders, setOrders] = useState([]);
  const [deposits, setDeposits] = useState([]);
  const [tab, setTab] = useState('store'); // store | dashboard
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState({}); // productId -> qty
  const [msg, setMsg] = useState('');

  const getSupabase = async () => {
    const mod = await import('./lib/supabase');
    return mod.supabase;
  };

  useEffect(()=>{
    const init = async () => {
      const supabase = await getSupabase();
      if(!supabase){ setLoading(false); return; }
      const { data: { session } } = await supabase.auth.getSession();
      if(session?.user) {
        setUser(session.user);
        await loadAll(session.user);
      }
      // Products for everyone
      const { data } = await supabase.from('products').select('*').order('id', {ascending:false});
      if(data) setProducts(data);
      
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      document.body.appendChild(script);
      setLoading(false);
    };
    init();
  },[]);

  const loadAll = async (u) => {
    const supabase = await getSupabase();
    // Profile
    let { data: prof } = await supabase.from('profiles').select('*').eq('id', u.id).single();
    if(!prof){
      const { data } = await supabase.from('profiles').insert([{id: u.id, email: u.email, wallet_balance:0}]).select().single();
      prof = data;
    }
    setProfile(prof);
    // Orders
    const { data: ord } = await supabase.from('orders').select('*').eq('user_id', u.id).order('created_at', {ascending:false});
    if(ord) setOrders(ord);
    // Deposits
    const { data: dep } = await supabase.from('deposits').select('*').eq('user_id', u.id).order('created_at', {ascending:false});
    if(dep) setDeposits(dep);
  };

  const signup = async () => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signUp({email, password});
    if(error) alert(error.message);
    else { alert("Account created! Check email to confirm, then login"); }
  };

  const login = async () => {
    const supabase = await getSupabase();
    const { data, error } = await supabase.auth.signInWithPassword({email, password});
    if(error) alert(error.message);
    else { setUser(data.user); await loadAll(data.user); }
  };

  const logout = async () => {
    const supabase = await getSupabase();
    await supabase.auth.signOut();
    setUser(null); setProfile(null);
  };

  const fundWallet = () => {
    const amount = Number(prompt("Amount to fund? e.g 5000"));
    if(!amount) return;
    if(typeof window.PaystackPop === 'undefined'){ alert("Wait 2 sec for Paystack"); return; }
    const handler = window.PaystackPop.setup({
      key: 'pk_live_e53e702112a6a9d3e7d5b7b6f1a2b3c4d5e6f7g8h9', // REPLACE WITH YOUR PAYSTACK PUBLIC KEY
      email: user.email,
      amount: amount*100,
      currency: 'NGN',
      callback: async (res) => {
        const supabase = await getSupabase();
        const newBal = (profile.wallet_balance||0) + amount;
        await supabase.from('profiles').update({wallet_balance: newBal}).eq('id', user.id);
        await supabase.from('deposits').insert([{user_id:user.id, amount, reference:res.reference}]);
        setProfile({...profile, wallet_balance:newBal});
        setDeposits([{amount, reference:res.reference, created_at:new Date().toISOString()}, ...deposits]);
        alert(`Wallet funded ₦${amount}! Balance ₦${newBal}`);
      }
    });
    handler.openIframe();
  };

  const buyNow = async (product, method) => {
    const qty = qtyMap[product.id] || 1;
    const available = product.type==='digital' ? (product.logs?.length||0) : product.stock;
    if(qty > available){ alert(`Only ${available} available`); return; }
    const total = product.price * qty;

    if(method==='wallet'){
      if((profile.wallet_balance||0) < total){ alert(`Wallet low! Balance ₦${profile.wallet_balance}, need ₦${total}. Fund wallet first`); return; }
    }

    const processOrder = async (reference) => {
      const supabase = await getSupabase();
      let deliveredLogs = '';
      if(product.type==='digital'){
        deliveredLogs = (product.logs||[]).slice(0, qty).join('\n');
        const remaining = product.logs.slice(qty);
        await supabase.from('products').update({logs:remaining, stock:remaining.length}).eq('id', product.id);
      }else{
        await supabase.from('products').update({stock: product.stock - qty}).eq('id', product.id);
      }
      if(method==='wallet'){
        const newBal = profile.wallet_balance - total;
        await supabase.from('profiles').update({wallet_balance:newBal}).eq('id', user.id);
        setProfile({...profile, wallet_balance:newBal});
      }
      // Save order
      await supabase.from('orders').insert([{user_id:user.id, product_name:product.name, qty, total, logs:deliveredLogs}]);
      setOrders([{product_name:product.name, qty, total, logs:deliveredLogs, created_at:new Date().toISOString()}, ...orders]);
      // Update local products
      setProducts(products.map(p=> p.id===product.id ? {...p, logs: p.type==='digital'? p.logs.slice(qty) : p.logs, stock: p.type==='digital'? p.logs.length-qty : p.stock-qty } : p));
      
      // WhatsApp receipt
      let receipt = `RAZZY STORE RECEIPT\nUser: ${user.email}\nRef: ${reference||'WALLET'}\n\n${product.name} x${qty} = ₦${total}\n`;
      if(deliveredLogs) receipt += `\nYOUR LOGS:\n${deliveredLogs}\n`;
      const wa = `https://wa.me/2349061213237?text=${encodeURIComponent(receipt)}`; // REPLACE WA NUMBER
      window.open(wa, '_blank');
      alert(`Success! Order saved to dashboard. Logs sent to WhatsApp`);
    };

    if(method==='wallet'){
      await processOrder('WALLET-'+Date.now());
    }else{
      // Paystack direct
      if(typeof window.PaystackPop === 'undefined'){ alert("Wait for Paystack"); return; }
      const handler = window.PaystackPop.setup({
        key: 'pk_live_e53e702112a6a9d3e7d5b7b6f1a2b3c4d5e6f7g8h9', // REPLACE WITH YOUR PAYSTACK PUBLIC KEY
        email: user.email,
        amount: total*100,
        currency: 'NGN',
        callback: (res)=> processOrder(res.reference)
      });
      handler.openIframe();
    }
  };

  if(loading) return <div style={{padding:20, fontFamily:'sans-serif'}}>Loading Razzy...</div>;

  if(!user){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', fontFamily:'sans-serif', padding:20}}>
        <div style={{background:'white', padding:24, borderRadius:16, width:360, boxShadow:'0 4px 20px rgba(0,0,0,0.08)'}}>
          <h2 style={{textAlign:'center'}}>Razzy Store 🔥</h2>
          <p style={{textAlign:'center', fontSize:12, color:'#666'}}>Sign up / Login to your personal account</p>
          <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="Email" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:16, boxSizing:'border-box'}}/>
          <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="Password" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:10, boxSizing:'border-box'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
          <button onClick={signup} style={{width:'100%', background:'white', color:'black', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:8, fontWeight:700}}>Create Account</button>
          <div style={{fontSize:10, color:'#888', marginTop:12, textAlign:'center'}}>Your wallet, orders & deposits are personal and saved</div>
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{background:'white', padding:'12px 16px', position:'sticky', top:0, zIndex:10, borderBottom:'1px solid #eee', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <b>Razzy Store</b>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span style={{fontSize:11, background:'#f0fdf4', padding:'6px 10px', borderRadius:20, border:'1px solid #16a34a', color:'#16a34a', fontWeight:700}}>₦{profile?.wallet_balance||0}</span>
          <button onClick={logout} style={{fontSize:11, background:'#eee', border:0, padding:'6px 10px', borderRadius:6}}>Logout</button>
        </div>
      </div>

      <div style={{display:'flex', gap:8, padding:12}}>
        <button onClick={()=>setTab('store')} style={{flex:1, padding:10, borderRadius:8, border:0, background:tab==='store'?'black':'white', color:tab==='store'?'white':'black', fontWeight:700}}>Store</button>
        <button onClick={()=>setTab('dashboard')} style={{flex:1, padding:10, borderRadius:8, border:0, background:tab==='dashboard'?'black':'white', color:tab==='dashboard'?'white':'black', fontWeight:700}}>Dashboard</button>
      </div>

      {tab==='store' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:12}}>
          {products.map(p=>{
            const available = p.type==='digital' ? (p.logs?.length||0) : p.stock;
            return(
              <div key={p.id} style={{background:'white', borderRadius:12, padding:12, border:'1px solid #eee'}}>
                <img src={p.img} style={{width:'100%', height:130, objectFit:'contain', background:'#fafafa', borderRadius:8}} alt=""/>
                <b style={{fontSize:13, display:'block', marginTop:8}}>{p.name}</b>
                <div style={{fontSize:11, color:'#666', height:28, overflow:'hidden'}}>{p.description}</div>
                <div style={{fontWeight:800, marginTop:4}}>₦{p.price}</div>
                <div style={{fontSize:10, color: available>0?'green':'red', fontWeight:700}}>Available: {available}</div>
                <div style={{display:'flex', gap:6, marginTop:8, alignItems:'center}}>
                  <span style={{fontSize:11}}>Qty:</span>
                  <input type="number" min="1" max={available} value={qtyMap[p.id]||1} onChange={e=>setQtyMap({...qtyMap, [p.id]: Number(e.target.value)})} style={{width:50, padding:6, borderRadius:6, border:'1px solid #ddd'}}/>
                </div>
                <button onClick={()=>buyNow(p, 'wallet')} style={{width:'100%', marginTop:8, background:'#16a34a', color:'white', border:0, padding:'9px', borderRadius:8, fontWeight:800, fontSize:12}}>Pay with Wallet</button>
                <button onClick={()=>buyNow(p, 'paystack')} style={{width:'100%', marginTop:6, background:'black', color:'white', border:0, padding:'9px', borderRadius:8, fontWeight:800, fontSize:12}}>Pay with Paystack</button>
              </div>
            );
          })}
        </div>
      )}

      {tab==='dashboard' && (
        <div style={{padding:12}}>
          <div style={{background:'white', borderRadius:12, padding:16, border:'1px solid #eee'}}>
            <h3 style={{margin:0}}>Hi, {user.email}</h3>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:10, marginTop:12}}>
              <div style={{background:'#f0fdf4', padding:12, borderRadius:8}}><div style={{fontSize:11, color:'#666'}}>Available Balance</div><b style={{fontSize:18}}>₦{profile?.wallet_balance||0}</b></div>
              <div style={{background:'#f5f5f7', padding:12, borderRadius:8}}><div style={{fontSize:11, color:'#666'}}>Total Orders</div><b style={{fontSize:18}}>{orders.length}</b></div>
            </div>
            <button onClick={fundWallet} style={{width:'100%', marginTop:12, background:'#16a34a', color:'white', border:0, padding:'12px', borderRadius:8, fontWeight:800}}>Fund Wallet via Paystack</button>
          </div>

          <div style={{background:'white', borderRadius:12, padding:16, marginTop:12, border:'1px solid #eee'}}>
            <b>Order History</b>
            {orders.length===0 && <div style={{fontSize:12, color:'#888', marginTop:8}}>No orders yet</div>}
            {orders.map((o,i)=>(
              <div key={i} style={{borderBottom:'1px solid #eee', padding:'10px 0'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:13}}>{o.product_name} x{o.qty}</b><span style={{fontSize:12, fontWeight:700}}>₦{o.total}</span></div>
                <div style={{fontSize:10, color:'#666'}}>{new Date(o.created_at).toLocaleString()}</div>
                {o.logs && <div style={{fontSize:10, background:'#f5f5f7', padding:6, borderRadius:4, marginTop:4, fontFamily:'monospace', whiteSpace:'pre-wrap'}}>{o.logs.slice(0,200)}</div>}
              </div>
            ))}
          </div>

          <div style={{background:'white', borderRadius:12, padding:16, marginTop:12, border:'1px solid #eee'}}>
            <b>Deposit History</b>
            {deposits.length===0 && <div style={{fontSize:12, color:'#888', marginTop:8}}>No deposits yet</div>}
            {deposits.map((d,i)=>(
              <div key={i} style={{display:'flex', justifyContent:'space-between', borderBottom:'1px solid #eee', padding:'8px 0'}}>
                <span style={{fontSize:12}}>₦{d.amount}</span><span style={{fontSize:10, color:'#666'}}>{d.reference?.slice(0,15)} • {new Date(d.created_at).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
