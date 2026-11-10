import React from 'react'
import { createBrowserRouter ,RouterProvider } from 'react-router-dom'
import Context from './Component/Context'
import Register from './Component/Register'
import { Toaster } from 'react-hot-toast'
import Login from './Component/Login'
import Home from './Component/Home'

let  myrouter=createBrowserRouter([
  {
    path:"/",
    element:<Register></Register>
  },
  {
    path:"/login",
    element:<Login></Login>
  },
  {
    path:"/Home",
    element:<Home></Home>
  },
  {
    
  }


])
const App = () => {
  return (
    <>
    <Toaster position='top-right'></Toaster>
    <Context>
    <RouterProvider router={myrouter}>App</RouterProvider>
    
    </Context>
    </>
   
  )
}

export default App