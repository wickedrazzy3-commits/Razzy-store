'use client';
import { useState, useEffect } from 'react';

const DEFAULT_PRODUCTS = [
  {id:1, name:'UK WhatsApp Number', price:3000, oldPrice:4000, stock:20, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', delivery:'Number will be delivered instantly', logs:["Username:- uk123\nPassword:- pass123\n2fa:- 123456"]},
];

const PAYSTACK_PUBLIC_KEY = "pk_live_e53e70211b051a607dea27a34fe32091d35917c2";

export default function Home(){
  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [qtys, setQtys] = useState({});
  const [wallet, setWallet] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState('');
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [pendingProduct, setPendingProduct] = useState(null);
  const [addressData, setAddressData] = useState({fullName:'', phone:'', address:'', city:'', note:''});

  // AUTH GATE - LIKE YOUR SCREENSHOT
  const [currentUser, setCurrentUser] = useState(null);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({name:'', email:'', password:''});
  const [rememberMe, setRememberMe] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){
        const p = JSON.parse(s);
        if(Array.isArray(p) && p.length>0){
          const fixed = p.map(item=>{
            try{
              let logs = item.logs; if(!logs) logs=[]; if(typeof logs==='string') logs=[logs]; if(!Array.isArray(logs)) logs=[];
              let stock = item.type==='digital'? logs.length : (Number(item.stock)||0);
              return {...item, logs, stock: Number(stock)||0, type: item.type||'digital', price: Number(item.price)||0, img: item.img||'https://i.imgur.com/8Km9tLL.png'};
            }catch{ return null; }
          }).filter(Boolean);
          if(fixed.length>0) setProducts(fixed);
        }
      }
      const w = localStorage.getItem("razzy_wallet"); if(w) setWallet(Number(w)||0);
      const td = localStorage.getItem("razzy_totalDeposited"); if(td) setTotalDeposited(Number(td)||0);
      const tu = localStorage.getItem("razzy_totalUsed"); if(tu) setTotalUsed(Number(tu)||0);
      const ti = localStorage.getItem("razzy_totalItems"); if(ti) setTotalItems(Number(ti)||0);
      const em = localStorage.getItem("razzy_email"); if(em) setEmail(em);
      const ord = localStorage.getItem("razzy_orders"); if(ord) setOrders(JSON.parse(ord)||[]);
      const user = localStorage.getItem("razzy_currentUser"); if(user) setCurrentUser(JSON.parse(user));
      const script = document.createElement("script"); script.src = "https://js.paystack.co/v1/inline.js"; document.body.appendChild(script);
    }catch{}
  },[]);

  useEffect(()=>{ try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{} },[products]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_wallet", String(wallet)); }catch{} },[wallet]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalDeposited", String(totalDeposited)); }catch{} },[totalDeposited]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalUsed", String(totalUsed)); }catch{} },[totalUsed]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_totalItems", String(totalItems)); }catch{} },[totalItems]);
  useEffect(()=>{ try{ localStorage.setItem("razzy_orders", JSON.stringify(orders)); }catch{} },[orders]);

  const handleSignup = () => {
    if(!authForm.email ||!authForm.password) return alert("Fill email & password");
    if(authMode==='register' &&!authForm.name) return alert("Enter Full Name");
    if(!authForm.email.includes("@")) return alert("Invalid email");
    const users = JSON.parse(localStorage.getItem("razzy_users")||"[]");
    if(users.find(u=>u.email===authForm.email)) return alert("Email already exists, Login instead");
    const newUser = {name: authForm.name||authForm.email.split('@')[0], email: authForm.email, password: authForm.password};
    users.push(newUser); localStorage.setItem("razzy_users", JSON.stringify(users));
    localStorage.setItem("razzy_currentUser", JSON.stringify(newUser));
    setCurrentUser(newUser); setEmail(newUser.email); setAuthForm({name:'', email:'', password:''});
  };

  const handleLogin = () => {
    if(!authForm.email ||!authForm.password) return alert("Fill email & password");
    const users = JSON.parse(localStorage.getItem("razzy_users")||"[]");
    const found = users.find(u=>u.email===authForm.email && u.password===authForm.password);
    if(!found) return alert("Wrong email or password");
    localStorage.setItem("razzy_currentUser", JSON.stringify(found));
    if(rememberMe) localStorage.setItem
