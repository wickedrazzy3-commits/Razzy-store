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
  const [tab, setTab] = useState('store');
  const [loading, setLoading] = useState(true);
  const [qtyMap, setQtyMap] = useState({});

  const getSupabase = async () => {
    try{ const m = await import('./lib/supabase'); return m.supabase; }catch{ return null; }
  };

  useEffect(()=>{
    const init = async () => {
      const sb = await getSupabase();
      if(sb){
        const sess = await sb.auth.getSession();
        const u = sess.data.session?.user;
        if(u){ setUser(u); await loadAll(u); }
        const prod = await sb.from('products').select('*').order('id', {ascending:false});
        if(prod.data) setProducts(prod.data);
      }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      document.body.appendChild(script);
      setLoading(false);
    };
    init();
  },[]);

  const loadAll = async (u) => {
    const sb = await getSupabase();
    if(!sb) return;
    let prof = await sb.from('profiles').select('*').eq('id', u.id).single();
    if(!prof.data){
      const ins = await sb.from('profiles').insert([{id:u.id, email:u.email, wallet_balance:0}]).select().single();
      prof.data = ins.data;
    }
    setProfile(prof.data);
    const ord = await sb.from('orders').select('*').eq('user_id', u.id).order('created_at', {ascending:false});
    if(ord.data) setOrders(ord.data);
    const dep = await sb.from('deposits').select('*').eq('user_id', u.id).order('created_at', {ascending:false});
    if(dep.data) setDeposits(dep.data);
  };

  const signup = async () => {
    const sb = await getSupabase();
    const r = await sb.auth.signUp({email, password});
    if(r.error) alert(r.error.message); else alert('Account created! Check email then login');
  };

  const login = async () => {
    const sb = await getSupabase();
    const r = await sb.auth.signInWithPassword({email, password});
    if(r.error) alert(r.error.message); else { setUser(r.data.user); await loadAll(r.data.user); }
  };

  const logout = async () => {
    const sb = await getSupabase(); if(sb) await sb.auth.signOut();
    setUser(null); setProfile(null);
  };

  const fundWallet = () => {
    const amt = Number(prompt('Amount to fund? e.g 5000'));
    if(!amt) return;
    if(typeof window.PaystackPop === 'undefined'){ alert('Wait 2 sec for Paystack'); return; }
    const handler = window.PaystackPop.setup({
      key: 'pk_live_e53e702112a6a9d3e7d5b7b6f1a2b3c4d5e6f7g8h9',
      email: user.email,
      amount: amt*100,
      currency: 'NGN',
      callback: async function(res){
        const sb = await getSupabase();
        const newBal = (profile.wallet_balance||0) + amt;
        await sb.from('profiles').update({wallet_balance:newBal}).eq('id', user.id);
        await sb.from('deposits').insert([{user_id:user.id, amount:amt, reference:res.reference}]);
        setProfile({...profile, wallet_balance:newBal});
        alert('Wallet funded! Balance N' + newBal);
      }
    });
    handler.openIframe();
  };

  const buyNow = async (product, method) => {
    const qty = qtyMap[product.id] || 1;
    const available = product.type==='digital' ? (product.logs?.length||0) : product.stock;
    if(qty > available){ alert('Only ' + available + ' available'); return; }
    const total = product.price * qty;
    if(method==='wallet' && (profile.wallet_balance||0) < total){ alert('Wallet low! Need N' + total); return; }

    const processOrder = async function(ref){
      const sb = await getSupabase();
      let delivered = '';
      if(product.type==='digital'){
        delivered = (product.logs||[]).slice(0, qty).join('\n');
        const remain = product.logs.slice(qty);
        await sb.from('products').update({logs:remain, stock:remain.length}).eq('id', product.id);
      }else{
        await sb.from('products').update({stock:product.stock-qty}).eq('id', product.id);
      }
      if(method==='wallet'){
        const nb = profile.wallet_balance - total;
        await sb.from('profiles').update({wallet_balance:nb}).eq('id', user.id);
        setProfile({...profile, wallet_balance:nb});
      }
      await sb.from('orders').insert([{user_id:user.id, product_name:product.name, qty:qty, total:total, logs:delivered}]);
      setOrders([{product_name:product.name, qty:qty, total:total, logs:delivered, created_at:new Date().toISOString()}, ...orders]);
      setProducts(products.map(function(p){ return p.id===product.id ? {...p, logs: p.type==='digital'? p.logs.slice(qty) : p.logs, stock: p.type==='digital'? p.logs.length-qty : p.stock-qty } : p; }));
      let receipt = 'RAZZY RECEIPT User:' + user.email + ' Ref:' + ref + ' ' + product.name + ' x' + qty + ' = N' + total;
      if(delivered) receipt += ' LOGS:' + delivered.substring(0,200);
      const wa = 'https://wa.me/2349061213237?text=' + encodeURIComponent(receipt);
      window.open(wa, '_blank');
      alert('Success! Check Dashboard and WhatsApp');
    };

    if(method==='wallet'){
      await processOrder('WALLET-' + Date.now());
    }else{
      if(typeof window.PaystackPop === 'undefined'){ alert('Wait for Paystack'); return; }
      const h = window.PaystackPop.setup({
        key: 'pk_live_e53e702112a6a9d3e7d5b7b6f1a2b3c4d5e6f7g8h9',
        email: user.email,
        amount: total*100,
        currency: 'NGN',
        callback: function(res){ processOrder(res.reference); }
      });
      h.openIframe();
    }
  };

  if(loading) return <div style={{padding:20}}>Loading Razzy...</div>;

  if(!user){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', padding:20, fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:24, borderRadius:16, width:360}}>
          <h2 style={{textAlign:'center'}}>Razzy Store</h2>
          <p style={{textAlign:'center', fontSize:12, color:'#666'}}>Signup / Login - Personal Account</p>
          <input value={email} onChange={function(e){setEmail(e.target.value)}} placeholder="Email" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:16, boxSizing:'border-box'}}/>
          <input type="password" value={password} onChange={function(e){setPassword(e.target.value)}} placeholder="Password" style={{width:'100%', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:10, boxSizing:'border-box'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
          <button onClick={signup} style={{width:'100%', background:'white', color:'black', padding:12, borderRadius:8, border:'1px solid #ddd', marginTop:8, fontWeight:700}}>Create Account</button>
        </div>
      </div>
    );
  }

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh'}}>
      <div style={{background:'white', padding:'12px 16px', display:'flex', justifyContent:'space-between', alignItems:'center', borderBottom:'1px solid #eee'}}>
        <b>Razzy Store</b>
        <div style={{display:'flex', gap:8, alignItems:'center'}}>
          <span style={{fontSize:11, background:'#f0fdf4', padding:'6px 10px', borderRadius:20, border:'1px solid #16a34a', color:'#16a34a', fontWeight:700}}>N{profile?.wallet_balance||0}</span>
          <button onClick={logout} style={{fontSize:11, background:'#eee', border:0, padding:'6px 10px', borderRadius:6}}>Logout</button>
        </div>
      </div>
      <div style={{display:'flex', gap:8, padding:12}}>
        <button onClick={function(){setTab('store')}} style={{flex:1, padding:10, borderRadius:8, border:0, background: tab==='store' ? 'black' : 'white', color: tab==='store' ? 'white' : 'black', fontWeight:700}}>Store</button>
        <button onClick={function(){setTab('dashboard')}} style={{flex:1, padding:10, borderRadius:8, border:0, background: tab==='dashboard' ? 'black' : 'white', color: tab==='dashboard' ? 'white' : 'black', fontWeight:700}}>Dashboard</button>
      </div>

      {tab==='store' && (
        <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, padding:12}}>
          {products.map(function(p){
            const available = p.type==='digital' ? (p.logs?.length||0) : p.stock;
            return(
              <div key={p.id} style={{background:'white', borderRadius:12, padding:12, border:'1px solid #eee'}}>
                <img src={p.img} style={{width:'100%', height:130, objectFit:'contain', background:'#fafafa', borderRadius:8}} alt=""/>
                <b style={{fontSize:13, display:'block', marginTop:8}}>{p.name}</b>
                <div style={{fontSize:11, color:'#666', height:28, overflow:'hidden'}}>{p.description}</div>
                <div style={{fontWeight:800, marginTop:4}}>N{p.price}</div>
                <div style={{fontSize:10, color: available>0?'green':'red', fontWeight:700}}>Available: {available}</div>
                <div style={{display:'flex', gap:6, marginTop:8, alignItems:'center'}}>
                  <span style={{fontSize:11}}>Qty:</span>
                  <input type="number" min="1" value={qtyMap[p.id]||1} onChange={function(e){ const v={}; v[p.id]=Number(e.target.value); setQtyMap({...qtyMap, ...v}); }} style={{width:50, padding:6, borderRadius:6, border:'1px solid #ddd'}}/>
                </div>
                <button onClick={function(){buyNow(p,'wallet')}} style={{width:'100%', marginTop:8, background:'#16a34a', color:'white', border:0, padding:'9px', borderRadius:8, fontWeight:800, fontSize:12}}>Pay with Wallet</button>
                <button onClick={function(){buyNow(p,'paystack')}} style={{width:'100%', marginTop:6, background:'black', color:'white', border:0, padding:'9px', borderRadius:8, fontWeight:800, fontSize:12}}>Pay with Paystack</button>
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
              <div style={{background:'#f0fdf4', padding:12, borderRadius:8}}><div style={{fontSize:11, color:'#666'}}>Balance</div><b>N{profile?.wallet_balance||0}</b></div>
              <div style={{background:'#f5f5f7', padding:12, borderRadius:8}}><div style={{fontSize:11, color:'#666'}}>Orders</div><b>{orders.length}</b></div>
            </div>
            <button onClick={fundWallet} style={{width:'100%', marginTop:12, background:'#16a34a', color:'white', border:0, padding:'12px', borderRadius:8, fontWeight:800}}>Fund Wallet</button>
          </div>
          <div style={{background:'white', borderRadius:12, padding:16, marginTop:12, border:'1px solid #eee'}}>
            <b>Order History</b>
            {orders.map(function(o,i){ return <div key={i} style={{borderBottom:'1px solid #eee', padding:'8px 0'}}><div style={{display:'flex', justifyContent:'space-between'}}><b style={{fontSize:13}}>{o.product_name} x{o.qty}</b><span style={{fontSize:12}}>N{o.total}</span></div><div style={{fontSize:10, color:'#666'}}>{new Date(o.created_at).toLocaleString()}</div></div>; })}
          </div>
          <div style={{background:'white', borderRadius:12, padding:16, marginTop:12, border:'1px solid #eee'}}>
            <b>Deposit History</b>
            {deposits.map(function(d,i){ return <div key={i} style={{display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:'1px solid #eee'}}><span style={{fontSize:12}}>N{d.amount}</span><span style={{fontSize:10}}>{new Date(d.created_at).toLocaleDateString()}</span></div>; })}
          </div>
        </div>
      )}
    </div>
  );
}
