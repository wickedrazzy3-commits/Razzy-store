"use client";
import { useState } from "react";
import { getUsers, setCurrent } from "../lib/auth";

export default function Login(){
const [form,setForm]=useState({email:"",password:""});
const login=()=>{
 const users=getUsers();
 const u=users.find(x=>x.email===form.email&&x.password===form.password);
 if(!u) return alert("Wrong email/password");
 setCurrent(u); alert("Welcome "+u.name); window.location.href="/";
};
return(
<div style={{maxWidth:400,margin:"40px auto",padding:20,fontFamily:"sans-serif"}}>
<h2>Login</h2>
<input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{width:"100%",padding:12,marginBottom:10,borderRadius:6,border:"1px solid #ccc"}}/>
<input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{width:"100%",padding:12,marginBottom:10,borderRadius:6,border:"1px solid #ccc"}}/>
<button onClick={login} style={{width:"100%",padding:12,background:"black",color:"white",borderRadius:6,fontWeight:"bold"}}>LOGIN</button>
<p style={{marginTop:15,fontSize:13}}>No account? <a href="/signup">Sign up</a> | <a href="/">Shop</a></p>
</div>
);
}
