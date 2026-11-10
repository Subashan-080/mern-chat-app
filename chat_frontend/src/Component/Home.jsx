import React, { useEffect, useState } from 'react'
import { mycontext } from './Context'
import { useContext } from 'react'
import { useNavigate ,Navigate,Link} from 'react-router-dom'
import Friends from './Friends'
import Message from './Message'
import NoMsg from './NoMsg'
import { API_URL, API_BASE_URL } from "../api";
const Home = () => {
   let {token,setToken}=useContext(mycontext)

   let [user,setUser]=useState(null)
   console.log(user);
   
  let [convo,setConvo]= useState(null) 
  

   if(!token){
    return <h1> you didn't login <Link to={"/login"}>Login First</Link></h1>
   }

   function handleLogout(){
    setToken(null)
    localStorage.removeItem("token")
   }

    async function aboutMe(){
    let myres= await fetch(`${API_BASE_URL}/auth/me`,{
        method:"GET",
        headers:{
            Authorization:`Bearer ${token}` 
        }
    })
    let data =await myres.json()
    if(myres.status==200){
        setUser(data.user) 

    } 
   }

   useEffect(()=>{
    aboutMe()

   },[])

  return (
    <div className='Home'>
        <nav>
            <div className="logo"><div id="chat_app"></div><h4>ChatApp</h4></div>
            <h3>{user && user.name}</h3>
           <Link to={"/login"} onClick={handleLogout}><button>log out</button></Link><br /><br />
        </nav>

        
        <main>
            <Friends setConvo={setConvo}></Friends>
           {convo?<Message convo={convo} me={user}></Message>:<NoMsg></NoMsg>}
        </main>
        <br /><br />
      
     
      
    
    </div>
  )
}

export default Home