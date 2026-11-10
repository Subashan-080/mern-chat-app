import React, { useState } from 'react'
import { useContext } from 'react'
import { mycontext } from './Context'
import { Await } from 'react-router-dom'
const Friends = (props) => {



    let {token}=useContext(mycontext)

    let [search,setSearch]=useState("")

    let [alluser,setAll]=useState([])

  async  function handleChange(e){
   
        setSearch(e.target.value)
        let {value}=e.target  
        if(value.length >=2){
            
        let myres= await fetch(`http://localhost:5000/api/users/search?q=${value}`,{
            method:"GET",
           headers:{
            Authorization:`Bearer ${token}` 
        }
        })

        let data=await myres.json()
        if(myres.ok){
            setAll(data.users)
        }
        console.log(data.users);

    }else{
        setAll([])

    }    
    }



   async function myConvo(id){
        let  res=await fetch("http://localhost:5000/api/conversations/direct",{
            method:"POST",
            headers:{
            Authorization:`Bearer ${token}` ,
            "Content-Type":"application/json"
        },
        body:JSON.stringify({userId:id})

        })

        let data= await res.json()
        console.log(data);

        if(res.ok){
            props.setConvo(data.conversation)
        }
        

    }
  return (
    <div className='friends'>
        <div className='search'>
            <input type="text" value={search} placeholder='search username or email' onChange={handleChange}  id="name_search"/>
        </div>
        <div>
            {alluser.length===0 ? <h1>No user found</h1>:alluser.map((e)=>{
                return <div key={e._id} className='users' onClick={()=>{myConvo(e._id)}}>
                    <h4>{e.name}</h4>
                </div>

            })}
        </div>
    </div>
  )
}

export default Friends