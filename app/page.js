'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const PRODUCTS = [
  { id: 1, name: 'Facebook Create Page ✅', desc: 'All accounts can create page', price: 4000, emoji: '📘', cat: 'Social' },
  { id: 2, name: 'Uk Physical Sim', desc: 'Giffgaff / O2 UK Sim for verification', price: 26000, emoji: '🇬🇧', cat: 'SIM' },
  { id: 3, name: 'T-Mobile Physical Sim', desc: 'USA T-Mobile 5G Physical SIM', price: 120000, emoji: '🇺🇸', cat: 'SIM' },
  { id: 4, name: 'USA Virtual Number', desc: 'For WhatsApp, Telegram, Gmail', price: 8000, emoji: '📱', cat: 'Numbers' },
  { id: 5, name: 'UK Virtual Number', desc: 'For Verification & OTP', price: 10000, emoji: '📞', cat: 'Numbers' },
  { id: 6, name: 'Aged Gmail Accounts', desc: 'High quality aged Gmail', price: 5000, emoji: '📧', cat: 'Social' },
];

export default function Home() {
  const [cart, setCart] = useState([]);
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('All');
  const [showCart, setShowCart] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [user, setUser] = useState(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('razzy_cart');
    if (saved) setCart(JSON.parse(saved));
    supabase.auth.getSession().then(({ data }) => setUser(data.session?.user || null));
    const { data: listener } = supabase.auth.onAuthStateChange((_, session) => {
      setUser(session?.user || null);
    });
    return () => listener.subscription.unsubscribe();
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
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        alert('Account Created! Login Forever ✅');
      } else {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        alert('Logged in!
