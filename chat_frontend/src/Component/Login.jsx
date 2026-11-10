import React, { useState } from 'react'
import toast from 'react-hot-toast'
import { useNavigate,Link } from 'react-router-dom';
import { mycontext } from './Context';
import { useContext } from 'react';
const Login = () => {
 let [state,setstate]  = useState({
        email:"",
        password:""
    })

    let navigate=useNavigate()

    let {setToken}=useContext(mycontext)

    function handleChange(e){
        let{name,value}=e.target
        setstate({...state,[name]:value})
    }

    async function handleSubmit(e) {
        e.preventDefault()
        let myres= await fetch ("http://localhost:5000/api/auth/login",{
            method:"POST",
            headers:{
                "Content-Type":"application/json"
            },
          body:JSON.stringify(state)
        })
         let data=await myres.json()
         console.log(data);

        if(myres.status==200){
       toast.success("Regsister sucessfully")
        setstate({
        email:"",
         password:""
         })
         localStorage.setItem("token",data.token)
         setToken(data.token)
         navigate("/Home")
       
  }else{
    toast.error(data.message)
  }
         
    
    }
  return (
    <div className='login'>
      <div className='cre_act'>
          <h1>Login</h1>
        </div>
        <form action="" onSubmit={handleSubmit}>
            <input type="email" name='email' value={state.email} onChange={handleChange}  placeholder='enter your email'/><br /><br />
            <input type="password" name='password' value={state.password} onChange={handleChange}  placeholder='enter your password'/><br /><br />
            <button>login</button>
        </form>
    </div>
  )
}

export default Login