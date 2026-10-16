"use client";
import { useState, useEffect } from "react";

export default function Shop(){
const PAYSTACK_KEY="pk_live_e53e70211b051a607dea27a34fe32091d35917c2";
const WA_NUMBER="2340000000000";
const [products,setProducts]=useState([]);
const [search,setSearch]=useState("");
const [delivered,setDelivered]=useState(null);
const [qtys,setQtys]=useState({});
const [currentUser,setCurrentUser]=useState(null);
const [loading,setLoading]=useState(true);
const [authMode,setAuthMode]=useState("login");
const [form,setForm]=useState({name:"",email:"",password:""});

useEffect(()=>{
 try{
   const cur=localStorage.getItem("razzy_current");
   if(cur){ setCurrentUser(JSON.parse(cur)); }
   const s=localStorage.getItem("razzy_products");
   if(s){ const p=JSON.parse(s); if(Array.isArray(p)) setProducts(p); }
 }catch(e){}
 setLoading(false);
 const sc=document.createElement("script");
 sc.src="https://js.paystack.co/v1/inline.js";
 document.body.appendChild(sc);
},[]);

useEffect(()=>{ try{ localStorage.setItem("razzy_products",JSON.stringify(products)); }catch(e){} },[products]);

const getUsers=()=>{ try{ return JSON.parse(localStorage.getItem("razzy_users")||"[]"); }catch{ return []; } };
const saveUsers=(u)=>localStorage.setItem("razzy_users",JSON.stringify(u));

const handleSignup=()=>{
 if(!form.name||!form.email||!form.password) return alert("Fill all fields");
 const users=getUsers();
 if(users.find(u=>u.email===form.email)) return alert("Email already exists, login");
 const newUser={...form,id:Date.now()};
 users.push(newUser);
 saveUsers(users);
 localStorage.setItem("razzy_current",JSON.stringify(newUser));
 setCurrentUser(newUser);
 alert("Welcome "+form.name+"!");
};

const handleLogin=()=>{
 const users=getUsers();
 const u=users.find(x=>x.email===form.email&&x.password===form.password);
 if(!u) return alert("Wrong email or password");
 localStorage.setItem("razzy_current",JSON.stringify(u));
 setCurrentUser(u);
};

const logout=()=>{ localStorage.removeItem("razzy_current"); setCurrentUser(null); setForm({name:"",email:"",password:""}); };

const filtered=products.filter(p=>p.name.toLowerCase().includes(search.toLowerCase()));
const getQty=(id)=> qtys[id]||1;
const changeQty=(id,delta,stock)=>{ let n=(qtys[id]||1)+delta; if(n<1) n=1; if(n>stock) n=stock; setQtys({...qtys,[id]:n}); };

const buyNow=(product)=>{
 const buyCount=getQty(product.id);
 if(product.qty<=0) return alert("Sold out");
 let text=""; let newP=[...products]; let idx=newP.findIndex(p=>p.id===product.id);
 if(idx>-1){
  let blocks=newP[idx].delivery.split("\n\n").filter(l=>l.trim()!=="");
  let isDouble=blocks.length>1;
  if(isDouble){ text=blocks.slice(0,buyCount).join("\n\n"); newP[idx].delivery=blocks.slice(buyCount).join("\n\n"); }
  else { let raw=newP[idx].delivery.split("\n").filter(l=>l.trim()!==""); text=raw.slice(0,buyCount).join("\n"); newP[idx].delivery=raw.slice(buyCount).join("\n"); }
  if(newP[idx].type==="physical") text=`PHYSICAL: ${product.name} x${buyCount} - We will contact ${currentUser.email} / ${currentUser.name}`;
  newP[idx].qty=Math.max(0,newP[idx].qty-buyCount);
  setProducts(newP);
  const orders=JSON.parse(localStorage.getItem("razzy_orders")||"[]");
  orders.push({id:Date.now(),product:product.name+" x"+buyCount,price:product.price*buyCount,customer:{name:currentUser.name,email:currentUser.email},delivery:text,ref:"PAY_"+Date.now(),date:new Date().toLocaleString(),user:currentUser.email});
  local
