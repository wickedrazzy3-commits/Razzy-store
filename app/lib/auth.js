export const getUsers=()=>{try{return JSON.parse(localStorage.getItem("razzy_users")||"[]")}catch{return[]}};
export const saveUsers=(u)=>localStorage.setItem("razzy_users",JSON.stringify(u));
export const getCurrent=()=>{try{return JSON.parse(localStorage.getItem("razzy_current")||"null")}catch{return null}};
export const setCurrent=(u)=>localStorage.setItem("razzy_current",JSON.stringify(u));
export const logout=()=>localStorage.removeItem("razzy_current");
