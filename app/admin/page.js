'use client';
import { useState, useEffect, useRef } from 'react';

export default function Admin(){
  const [products, setProducts] = useState([]);
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const loadedRef = useRef(false);

  useEffect(()=>{
    try{
      const s = localStorage.getItem("razzy_products");
      if(s){
        const p = JSON.parse(s);
        if(Array.isArray(p)) setProducts(p);
      }
    }catch{}
    setTimeout(()=>{ loadedRef.current = true; }, 800);
  },[]);

  useEffect(()=>{
    if(!loadedRef.current) return;
    try{ localStorage.setItem("razzy_products", JSON.stringify(products)); }catch{}
  },[products]);

  const login = () => {
    if(pass==='admin123'){ setAuth(true); } else alert("Wrong! Use admin123");
  };

  const updateField = (id, field, value) => {
    setProducts(prev=>prev.map(p=>p.id===id?{...p, [field]: value}:p));
  };

  const updateLogs = (id, text) => {
    const logs = text.split('\n---\n').map(s=>s.trim()).filter(Boolean);
    setProducts(prev=>prev.map(p=>p.id===id?{...p, logs, stock: p.type==='digital'? logs.length : p.stock}:p));
  };

  const handleImageUpload = (id, file) => {
    if(!file) return;
    if(file.size > 2*1024*1024) return alert("Image too big! Max 2MB. Use smaller image or link.");
    const reader = new FileReader();
    reader.onload = (e) => {
      updateField(id, 'img', e.target.result);
      alert("Picture uploaded! Saved");
    };
    reader.readAsDataURL(file);
  };

  const addProduct = () => {
    const newP = {
      id: Date.now(),
      name:'New Product',
      price:1000,
