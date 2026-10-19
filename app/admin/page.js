'use client';
import { useState } from 'react';

export default function Admin(){
  const [auth, setAuth] = useState(false);
  const [pass, setPass] = useState('');
  const [products, setProducts] = useState([]);
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const getSupabase = async () => {
    try{ 
      const m = await import('../lib/supabase'); 
      return m.supabase; 
    }catch{ 
      return null; 
    }
  };

  const login = async () => {
    if(pass.trim() !== 'admin123'){ alert('Wrong password! Use admin123'); return; }
    setAuth(true);
    setLoading(true);
    setMsg('');
    try{
      const sb = await getSupabase();
      if(!sb){ setMsg('Supabase not connected! Go to Vercel > Settings > Environment Variables and add NEXT_PUBLIC_SUPABASE_URL and KEY, then Redeploy'); setLoading(false); return; }
      const r = await sb.from('products').select('*').order('id', {ascending:false});
      if(r.error) setMsg('Supabase error: ' + r.error.message);
      else setProducts(r.data||[]);
    }catch(e){ setMsg('Error: ' + e.message); }
    setLoading(false);
  };

  const addProduct = async () => {
    try{
      const sb = await getSupabase();
      if(!sb){ alert('Supabase not connected'); return; }
      const r = await sb.from('products').insert([{name:'New Product', price:1000, stock:10, img:'https://i.imgur.com/8Km9tLL.png', type:'digital', description:'New product', logs:[]}]).select();
      if(r.error){ alert(r.error.message); return; }
      if(r.data && r.data[0]) setProducts([r.data[0], ...products]);
    }catch(e){ alert(e.message); }
  };

  const updateField = async (id, field, value) => {
    setProducts(products.map(function(p){ return p.id===id ? Object.assign({}, p, { [field]: value }) : p; }));
    try{
      const sb = await getSupabase();
      if(sb){ 
        const obj = {};
        obj[field] = value;
        await sb.from('products').update(obj).eq('id', id); 
      }
    }catch(e){}
  };

  const handleUpload = async (id, file) => {
    if(!file) return;
    try{
      const sb = await getSupabase();
      if(!sb){ alert('Supabase not connected'); return; }
      setMsg('Uploading...');
      const safeName = file.name.replace(/\s/g, '_');
      const name = id + '_' + Date.now() + '_' + safeName;
      const up = await sb.storage.from('product-images').upload(name, file);
      if(up.error){ alert('Upload failed: ' + up.error.message + ' - Make bucket product-images public in Supabase Storage'); setMsg(''); return; }
      const pub = sb.storage.from('product-images').getPublicUrl(name);
      const url = pub.data.publicUrl;
      setProducts(products.map(function(p){ return p.id===id ? Object.assign({}, p, {img: url}) : p; }));
      await sb.from('products').update({img: url}).eq('id', id);
      setMsg('Image uploaded! LIVE now');
      setTimeout(function(){ setMsg(''); }, 3000);
    }catch(e){ alert(e.message); setMsg(''); }
  };

  const deleteProduct = async (id) => {
    if(!confirm('Delete this product?')) return;
    try{
      const sb = await getSupabase();
      if(sb) await sb.from('products').delete().eq('id', id);
      setProducts(products.filter(function(p){ return p.id!==id; }));
    }catch(e){}
  };

  if(!auth){
    return(
      <div style={{minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center', background:'#f5f5f7', padding:20, fontFamily:'sans-serif'}}>
        <div style={{background:'white', padding:24, borderRadius:12, width:330}}>
          <h2 style={{margin:0}}>Admin Login</h2>
          <p style={{fontSize:12, color:'#666', marginTop:4}}>Password: admin123</p>
          <input type="password" value={pass} onChange={function(e){setPass(e.target.value)}} placeholder="Enter password" style={{width:'100%', padding:12, marginTop:12, borderRadius:8, border:'1px solid #ddd', boxSizing:'border-box'}}/>
          <button onClick={login} style={{width:'100%', background:'black', color:'white', padding:12, borderRadius:8, border:0, marginTop:12, fontWeight:800}}>Login</button>
          <a href="/" style={{display:'block', textAlign:'center', marginTop:12, fontSize:12}}>Back to Store</a>
        </div>
      </div>
    );
  }

  return(
    <div style={{padding:16, background:'#f5f5f7', minHeight:'100vh', fontFamily:'sans-serif'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:8}}>
        <h2 style={{margin:0}}>Admin - {products.length} Products</h2>
        <div style={{display:'flex', gap:8}}>
          <button onClick={addProduct} style={{background:'#16a34a', color:'white', border:0, padding:'10px 14px', borderRadius:8, fontWeight:800}}>+ Add Product</button>
          <a href="/" style={{background:'black', color:'white', padding:'10px 14px', borderRadius:8, textDecoration:'none', fontSize:13}}>Store</a>
        </div>
      </div>

      {msg && <div style={{background: msg.indexOf('error')>-1 || msg.indexOf('not connected')>-1 ? '#fee2e2' : '#dcfce7', color: msg.indexOf('error')>-1 ? '#b91c1c' : '#166534', padding:12, borderRadius:8, marginTop:12, fontSize:13, fontWeight:600}}>{msg}</div>}
      {loading && <div style={{marginTop:12, background:'white', padding:12, borderRadius:8}}>Loading products...</div>}
      {!loading && products.length===0 && <div style={{marginTop:12, background:'white', padding:12, borderRadius:8}}>No products yet. Click + Add Product</div>}

      {products.map(function(p){
        if(!p) return null;
        const available = p.type==='digital' ? (p.logs ? p.logs.length : 0) : (p.stock||0);
        return(
          <div key={p.id} style={{background:'white', borderRadius:12, padding:16, marginTop:16, border:'1px solid #eee'}}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
              <b style={{fontSize:14}}>{p.name} - Avail: {available}</b>
              <button onClick={function(){deleteProduct(p.id)}} style={{background:'#fee2e2', color:'#dc2626', border:0, padding:'6px 10px', borderRadius:6, fontWeight:700, fontSize:12}}>Delete</button>
            </div>
            
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginTop:12}}>
              <div><label style={{fontSize:11, fontWeight:700}}>Name</label><input value={p.name||''} onChange={function(e){updateField(p.id,'name',e.target.value)}} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4, boxSizing:'border-box'}}/></div>
              <div><label style={{fontSize:11, fontWeight:700}}>Price N</label><input type="number" value={p.price||0} onChange={function(e){updateField(p.id,'price',Number(e.target.value))}} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4, boxSizing:'border-box'}}/></div>
              
              <div style={{gridColumn:'1 / -1', background:'#f0fdf4', padding:12, borderRadius:10, border:'2px solid #16a34a'}}>
                <label style={{fontSize:12, fontWeight:800, color:'#16a34a'}}>UPLOAD PICTURE - Shows LIVE for buyers</label><br/>
                <label style={{background:'#16a34a', color:'white', padding:'10px 16px', borderRadius:8, fontWeight:800, cursor:'pointer', display:'inline-block', marginTop:8, fontSize:13}}>TAP TO CHOOSE PICTURE<input type="file" accept="image/*" onChange={function(e){handleUpload(p.id, e.target.files ? e.target.files[0] : null)}} style={{display:'none'}}/></label>
                {p.img && <img src={p.img} style={{width:'100%', maxHeight:200, objectFit:'contain', marginTop:10, borderRadius:8, border:'1px solid #ddd', background:'#fafafa'}} alt="product"/>}
                <div style={{fontSize:10, color:'#666', marginTop:4, wordBreak:'break-all'}}>{p.img}</div>
              </div>

              <div><label style={{fontSize:11, fontWeight:700}}>Type</label><select value={p.type||'digital'} onChange={function(e){updateField(p.id,'type',e.target.value)}} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4}}><option value="digital">digital (logs)</option><option value="physical">physical (stock)</option></select></div>
              <div><label style={{fontSize:11, fontWeight:700}}>Stock (physical only)</label><input type="number" value={p.stock||0} onChange={function(e){updateField(p.id,'stock',Number(e.target.value))}} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', marginTop:4, boxSizing:'border-box'}}/></div>

              <div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11, fontWeight:700}}>Description</label><textarea value={p.description||''} onChange={function(e){updateField(p.id,'description',e.target.value)}} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:50, marginTop:4, boxSizing:'border-box'}}/></div>
              
              <div style={{gridColumn:'1 / -1'}}><label style={{fontSize:11, fontWeight:700}}>Logs (separate each with --- on new line) - Available = number of logs</label><textarea value={p.logs ? p.logs.join('\n---\n') : ''} onChange={function(e){ 
                const logs = e.target.value.split('\n---\n').map(function(s){return s.trim()}).filter(Boolean); 
                const newStock = logs.length;
                setProducts(products.map(function(x){ return x.id===p.id ? Object.assign({}, x, {logs: logs, stock: newStock}) : x; }));
                (async function(){
                  const sb = await getSupabase();
                  if(sb) await sb.from('products').update({logs: logs, stock: newStock}).eq('id', p.id);
                })();
              }} style={{width:'100%', padding:10, borderRadius:6, border:'1px solid #ddd', minHeight:120, fontFamily:'monospace', fontSize:11, marginTop:4, boxSizing:'border-box'}} placeholder="log1&#10;---&#10;log2&#10;---&#10;log3"/></div>
            </div>
            <div style={{fontSize:11, marginTop:8, color: available>0 ? 'green' : 'red', fontWeight:700}}>Available to buyers: {available}</div>
          </div>
        );
      })}
    </div>
  );
}
