import React, { useState } from 'react'
import { createContext } from 'react'

 export let mycontext=createContext()

const Context = (props) => {
    let [token,setToken]=useState(localStorage.getItem("token")|| null)
  return (
    <mycontext.Provider value={{token,setToken}}>
        {props.children}
    </mycontext.Provider>
  )
}

export default Context