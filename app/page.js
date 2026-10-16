'use client';
import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';

const DEFAULT_PRODUCTS = [
  {id:1, name:'UK WhatsApp Number', price:3000, stock:5, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'UK WhatsApp Number - Instant delivery', logs:[]},
];

const PAYSTACK_PUBLIC_KEY = "pk_live_e53e702112a6a9d3e7d5b7b6f1a2b3c4d5e6f7g8h9";

export default function Home(){
  const [products, setProducts] = useState([]);
  const [qtys, setQtys] = useState({});
  const [wallet, setWallet] = useState(0);
  const [showDeposit, setShowDeposit] = useState(false);
  const [depositAmt, setDepositAmt] = useState(1000);
  const [totalDeposited, setTotalDeposited] = useState(0);
  const [totalUsed, setTotalUsed] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [email, setEmail] = useState('');
  const [orders, setOrders] = useState([]);
  const [showOrders, setShowOrders] = useState(false);
  const [showAddressForm, setShowAddressForm] = useState(false);

  useEffect(()=>{
    const getProducts = async () => {
      const { data } = await supabase.from('products').select('*').order('id', {ascending:false});
      if(data && data.length>0) setProducts(data);
      else setProducts(DEFAULT_PRODUCTS);
    };
    getProducts();
  },[]);

  const incQty = (id) => setQtys(q=>({...q, [id]:(q[id]||1)+1}));
  const decQty = (id) => setQtys(q=>({...q, [id]:Math.max(1,(q[id]||1)-1)}));

  return(
    <div style={{fontFamily:'sans-serif', background:'#f5f5f7', minHeight:'100vh', padding:16}}>
      <h1 style={{fontWeight:900}}>Razzy Store</h1>
      <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:16}}>
        {products.map(p=>(
          <div key={p.id} style={{background:'white', borderRadius:12, padding:12, border:'1px solid #eee'}}>
            <img src={p.img} style={{width:'100%', height:120, objectFit:'contain'}}/>
            <b style={{display:'block', marginTop:8, fontSize:14}}>{p.name}</b>
            <div style={{fontSize:12, color:'#666', marginTop:4}}>{p.description}</div>
            <div style={{fontWeight:800, marginTop:6}}>₦{p.price}</div>
            <div style={{fontSize:11, color:p.type==='digital'? (p.logs?.length>0?'green':'red') : 'green'}}>
              {p.type==='digital'? `Stock: ${p.logs?.length||0}` : `Stock: ${p.stock}`}
            </div>
            <div style={{display:'flex', gap:8, marginTop:8, alignItems:'center'}}>
              <button onClick={()=>decQty(p.id)} style={{padding:'4px 8px'}}>-</button>
              <span>{qtys[p.id]||1}</span>
              <button onClick={()=>incQty(p.id)} style={{padding:'4px 8px'}}>+</button>
              <button style={{background:'black', color:'white', border:0, padding:'6px 10px', borderRadius:6, marginLeft:'auto'}}>Buy</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
