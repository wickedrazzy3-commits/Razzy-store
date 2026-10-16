"use client";
import { useState } from "react";
import { getUsers, saveUsers, setCurrent } from "../lib/auth";

export default function Signup(){
const [form,setForm]=useState({name:"",email:"",password:""});
const signup=()=>{
 if(!form.email||!form.password) return alert("Fill all");
 const users=getUsers();
 if(users.find(u=>u.email===form.email)) return alert("Email exists, login");
 users.push({...form,id:Date.now()});
 saveUsers(users);
 setCurrent({...form,id:Date.now()});
 alert("Account created!"); window.location.href="/";
};
return(
<div style={{maxWidth:400,margin:"40px auto",padding:20,fontFamily:"sans-serif"}}>
<h2>Create Account</h2>
<input placeholder="Full Name" value={form.name} onChange={e=>setForm({...form,name:e.target.value})} style={{width:"100%",padding:12,marginBottom:10,borderRadius:6,border:"1px solid #ccc"}}/>
<input placeholder="Email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} style={{width:"100%",padding:12,marginBottom:10,borderRadius:6,border:"1px solid #ccc"}}/>
<input type="password" placeholder="Password" value={form.password} onChange={e=>setForm({...form,password:e.target.value})} style={{width:"100%",padding:12,marginBottom:10,borderRadius:6,border:"1px solid #ccc"}}/>
<button onClick={signup} style={{width:"100%",padding:12,background:"black",color:"white",borderRadius:6,fontWeight:"bold"}}>SIGN UP</button>
<p style={{marginTop:15,fontSize:13}}>Already have? <a href="/login">Login</a> | <a href="/">Shop</a></p>
</div>
);
}
