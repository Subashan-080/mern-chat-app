import axios from 'axios';
import React, { useState } from 'react'
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';

const Register = () => {
  let [state, setstate] = useState({
    name: "",
    email: "",
    password: ""
  })
  let navigate = useNavigate()
  console.log(state);

  function handleChange(e) {
    let { name, value } = e.target
    setstate({ ...state, [name]: value })
  }

  async function handleSubmit(e) {
    e.preventDefault()

    try {
      let res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(state)
      })
      let data = await res.json()
      if (res.status == 201) {
        toast.success("Regsister sucessfully")
        setstate({
          name: "",
          email: "",
          password: ""

        })


        navigate("/login")
      }
      else {
        toast.error(data.message)
      }
    }
    catch (e) {
      console.log(res);


    }

  }
  return (
    <div className='reg'>
      <aside id="reg_a1">
        <div className="logo">
          <div id="chat_app"></div>
          <h4>ChatApp</h4>
        </div>

        <div className="heading">
          <h1>Start your first <span>conversation</span>.</h1>
          <p>Create an account in seconds and message anyone who joins.</p>

          <input type="checkbox" id="show_reg" />
          <label htmlFor="show_reg" className="get_started">Get started</label>
        </div>

        <div className="demo" aria-hidden="true">
          <div className="bubble">Welcome aboard!</div>
          <div className="bubble own">Glad to be here.</div>
        </div>
      </aside>



      <aside id="reg_a2">
        <div className='cre_act'>
          <h1>Create Account</h1>
          <p>& Atti With Your Friends</p>
        </div>
        <form action="" onSubmit={handleSubmit}>
          <input type="text" name="name" onChange={handleChange} value={state.name} placeholder='enter your name' /><br /><br />
          <input type="email" name="email" onChange={handleChange} value={state.email} placeholder='enter your email' /><br /><br />
          <input type="password" name="password" onChange={handleChange} value={state.password} placeholder='enter your password' /><br /><br />
          <button>submit</button><br /><br />
          <Link to={"/login"}><button id="bt2">Already have account?</button></Link>
        </form>
      </aside>

    </div>
  )
}

export default Register