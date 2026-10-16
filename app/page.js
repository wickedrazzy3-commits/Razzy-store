'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

export default function RazzyStore() {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [user, setUser] = useState(null);
  const [sessionLoading, setSessionLoading] = useState(true);
  const [view, setView] = useState('store');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [authForm, setAuthForm] = useState({ email: '', password: '', name: '' });
  const [isSignup, setIsSignup] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    const checkSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) setUser(session.user);
      setSessionLoading(false);
    };
    checkSession();
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const saved = localStorage.getItem('razzy_products');
    if (saved) {
      setProducts(JSON.parse(saved));
    } else {
      const initial = [
        { id: 1, name: 'iPhone 15 Pro Max 256GB', price: 1850000, image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500', category: 'Phones', desc: 'Brand new, sealed' },
        { id: 2, name: 'Samsung Galaxy S24 Ultra', price: 1450000, image: 'https://images.unsplash.com/photo-1610945264803-c22b62d2a7b3?w=500', category: 'Phones', desc: 'Titanium, 512GB' },
        { id: 3, name: 'MacBook Air M2 256GB', price: 1250000, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500', category: 'Laptops', desc: 'Midnight color' },
        { id: 4, name: 'Sony WH-1000XM5 Headphone', price: 185000, image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=500', category: 'Accessories', desc: 'Noise cancelling' },
      ];
      setProducts(initial);
      localStorage.setItem('razzy_products', JSON.stringify(initial));
    }
    const savedCart = localStorage.getItem('razzy_cart');
    if (savedCart) setCart(JSON.parse(savedCart));
  }, []);

  const handleAuth = async (e) => {
    e.preventDefault();
    setAuthError('');
    setAuthLoading(true);
    try {
      if (isSignup) {
        const { data, error } = await supabase.auth.signUp({
          email: authForm.email,
          password: authForm.password,
          options: { data: { full_name: authForm.name } }
        });
        if (error) throw error;
        setUser(data.user);
        setView('store');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({
          email: authForm.email,
          password: authForm.password,
        });
        if (error) throw error;
        setUser(data.user);
        setView('store');
      }
    } catch (err) {
      setAuthError(err.message);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView('store');
  };

  const addToCart = (product) => {
    if (!user) { setView('login'); return; }
    setCart(prev => {
      const exists = prev.find(p => p.id === product.id);
      if (exists) return prev.map(p => p.id === product.id? {...p, qty: p.qty + 1 } : p);
      return [...prev, {...product, qty: 1 }];
    });
  };

  const total = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const categories = ['All',...new Set(products.map(p => p.category))];
  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchCat = selectedCategory === 'All' || p.category === selectedCategory;
    return matchSearch && matchCat;
  });

  if (sessionLoading) return <div className="min-h-screen flex items-center justify-center bg-black text-white">Loading Razzy Store...</div>

  return (
    <div className="min-h-screen bg-[#f5f5f7] text-black">
      <header className="sticky top-0 z-50 bg-black text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-black cursor-pointer" onClick={() => setView('store')}>RAZZY STORE</h1>
        <div className="flex gap-3 items-center">
          <button onClick={() => setView('store')} className="text-sm">Store</button>
          <button onClick={() => { if(!user){setView('login')}else{setView('cart')} }} className="relative bg-white text-black px-4 py-2 rounded-full font-bold text-sm">Cart ({cart.reduce((s,i)=>s+i.qty,0)})</button>
          {user? <button onClick={handleLogout} className="text-xs bg-zinc-800 px-3 py-2 rounded-full">{user.email?.split('@')[0]} • Logout</button> : <button onClick={() => setView('login')} className="text-xs bg-zinc-800 px-3 py-2 rounded-full">Login</button>}
        </div>
      </header>

      {view === 'login' && (
        <div className="max-w-md mx-auto mt-20 p-8 bg-white rounded-[2rem] shadow-xl">
          <h2 className="text-3xl font-black mb-2">{isSignup? 'Create Account' : 'Welcome Back'}</h2>
          <p className="text-zinc-500 mb-6 text-sm">{isSignup? 'Permanent account - login anywhere' : 'Login with your permanent account'}</p>
          <form onSubmit={handleAuth} className="space-y-4">
            {isSignup && <input className="w-full p-4 bg-zinc-100 rounded-xl outline-none" placeholder="Full Name" required value={authForm.name} onChange={e=>setAuthForm({...authForm, name: e.target.value})} />}
            <input className="w-full p-4 bg-zinc-100 rounded-xl outline-none" placeholder="Email" type="email" required value={authForm.email} onChange={e=>setAuthForm({...authForm, email: e.target.value})} />
            <input className="w-full p-4 bg-zinc-100 rounded-xl outline-none" placeholder="Password (min 6 chars)" type="password" required value={authForm.password} onChange={e=>setAuthForm({...authForm, password: e.target.value})} />
            {authError && <p className="text-red-500 text-sm bg-red-50 p-3 rounded-xl">{authError}</p>}
            <button disabled={authLoading} className="w-full bg-black text-white p-4 rounded-xl font-bold disabled:opacity-50">{authLoading? 'Please wait...' : isSignup? 'Create Permanent Account' : 'Login Forever'}</button>
          </form>
          <button onClick={()=>{setIsSignup(!isSignup); setAuthError('')}} className="w-full mt-4 text-sm text-zinc-500">{isSignup? 'Already have account? Login' : "No account? Create permanent account"}</button>
          <p className="mt-6 text-[11px] text-zinc-400 text-center">✓ Real cloud login - works on any phone forever<br/>Powered by Supabase</p>
        </div>
      )}

      {view === 'store' && (
        <div className="max-w-7xl mx-auto p-4">
          <div className="mt-6 flex gap-2 overflow-x-auto pb-2">{categories.map(cat => (<button key={cat} onClick={()=>setSelectedCategory(cat)} className={`px-5 py-2 rounded-full text-sm font-bold whitespace-nowrap ${selectedCategory===cat? 'bg-black text-white' : 'bg-white'}`}>{cat}</button>))}</div>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search products..." className="w-full mt-4 p-4 bg-white rounded-2xl outline-none" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">{filtered.map(product => (<div key={product.id} className="bg-white rounded-[1.5rem] p-3 shadow-sm"><img src={product.image} className="w-full h-32 object-cover rounded-xl" /><h3 className="font-bold mt-3 text-sm leading-tight">{product.name}</h3><p className="text-xs text-zinc-500 mt-1">{product.desc}</p><p className="font-black mt-2">₦{product.price.toLocaleString()}</p><button onClick={()=>addToCart(product)} className="w-full mt-3 bg-black text-white py-2.5 rounded-full text-sm font-bold">Add to Cart</button></div>))}</div>
        </div>
      )}

      {view === 'cart' && (
        <div className="max-w-2xl mx-auto p-4 mt-6">
          <h2 className="text-2xl font-black">Your Cart ({cart.length})</h2>
          {user && <p className="text-sm text-zinc-500">Logged in as {user.email} • Permanent account</p>}
          {cart.length===0? <p className="mt-10 text-center text-zinc-500">Cart empty</p> : (<><div className="mt-6 space-y-3">{cart.map(item=>(<div key={item.id} className="bg-white p-4 rounded-2xl flex justify-between"><div><p className="font-bold text-sm">{item.name}</p><p className="text-xs">Qty: {item.qty}</p></div><p className="font-black">₦{(item.price*item.qty).toLocaleString()}</p></div>))}</div><div className="mt-6 bg-white p-6 rounded-[1.5rem]"><div className="flex justify-between font-black text-lg"><span>Total</span><span>₦{total.toLocaleString()}</span></div><button onClick={()=>alert('Order placed! (We will connect Paystack next)')} className="w-full mt-4 bg-black text-white py-4 rounded-full font-bold">Checkout via WhatsApp</button></div></>)}
        </div>
      )}
    </div>
  );
}
