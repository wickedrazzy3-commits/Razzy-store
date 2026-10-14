"use client";
import { useState, useEffect } from 'react';
export default function Shop(){
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  useEffect(()=>{
    const saved = JSON.parse(localStorage.getItem('razzy_products')||'[]');
    if(saved.length>0) setProducts(saved);
    else {
      const demo=[
        {id:1,name:'Digital Ebook - How to Sell Online',price:3000,type:'digital',image:'https://via.placeholder.com/300',file:'#',desc:'Instant download'},
        {id:2,name:'Razzy T-Shirt',price:8000,type:'physical',image:'https://via.placeholder.com/300',desc:'We deliver to you in Ughelli'},
        {id:3,name:'Wireless Earbuds',price:15000,type:'physical',image:'https://via.placeholder.com/300',desc:'Fast delivery'}
      ];
      setProducts(demo); localStorage.setItem('razzy_products',JSON.stringify(demo));
    }
    setCart(JSON.parse(localStorage.getItem('razzy_cart')||'[]'));
  },[]);
  const addToCart = (p)=>{
    const newCart=[...cart,p];
    setCart(newCart); localStorage.setItem('razzy_cart',JSON.stringify(newCart));
    alert(p.name+' added to cart!');
  };
  return (
    <div style={{padding:'15px',fontFamily:'sans-serif'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}><h2>Razzy Store</h2><div><a href="/admin" style={{marginRight:'10px'}}>Admin</a><a href="/cart">Cart ({cart.length})</a></div></div>
      <p>Selling of items, delivery of physical products</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginTop:'20px'}}>
        {products.map(p=>(
          <div key={p.id} style={{border:'1px solid #ddd',padding:'10px',borderRadius:'10px'}}>
            <img src={p.image} alt="" style={{width:'100%',height:'120px',objectFit:'cover',borderRadius:'6px'}}/>
            <h4 style={{margin:'8px 0 2px'}}>{p.name}</h4><p style={{margin:'2px 0',fontWeight:'bold'}}>₦{p.price.toLocaleString()}</p>
            <small>{p.type==='digital'?'⚡ Instant':'🚚 Physical'}</small>
            <button onClick={()=>addToCart(p)} style={{width:'100%',background:'black',color:'white',padding:'10px',marginTop:'8px',borderRadius:'6px',border:'none'}}>Add to Cart</button>
          </div>
        ))}
      </div>
    </div>
  )
}
