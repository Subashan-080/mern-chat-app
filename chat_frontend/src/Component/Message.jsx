import React, { useEffect, useState } from 'react'
import { mycontext } from './Context'
import { useContext } from 'react'
import { io } from 'socket.io-client'
import { API_URL, API_BASE_URL } from '../api';
const Message = (props) => {
    let convoId=null

    console.log(props);
    if(props.convo){
        convoId=props.convo._id

    }
    console.log(convoId);
    

    
    

    let {token}=useContext(mycontext)
    let [allmsg,setAllMsg]=useState([])
    let [socket,setSocket]=useState(null)
    let [sendingMsg,setSend]=useState("")




    useEffect(()=>{
        async function getAll() {
            let myres= await fetch (`${API_BASE_URL}/messages/conversation/${convoId}`,{
                headers:{
                    Authorization:`Bearer ${token}` 
                }
            })
            let data=await myres.json()
            console.log(data);
            setAllMsg(data.messages)
            
            
        }
        getAll()

    },[token])

    useEffect(()=>{
        let mySocket=io(API_URL,{
            auth:{token}
        })

        setSocket(mySocket)

        mySocket.emit("conversation:join",{conversationId:convoId})
        mySocket.on("message:new",(data)=>{
            setAllMsg((prev)=>[...prev,data])
        })
        
    },[token,convoId])







    if(!props.convo){
        return <div className='msg'><h1>not found</h1></div>
    }


    function handleClick(){
        socket.emit("message:send",{conversationId:convoId,content:sendingMsg},(value)=>{
            console.log(value);
            if(value.success){
                setSend("")
            }
            

        })

    }

    function handleChange(e){
        setSend(e.target.value)
    }



  return (
    <div className='msg'>
     <div>
        {
            allmsg.length >0 && allmsg.map((e)=>{
                return <div key={e._id} className={(e.sender._id || e.sender) === props.me?._id ? 'is-own' : ''}>
                    <h3>{e.sender.name}</h3>
                    <p>{e.content}</p>

                </div>
            })
        }
        <input type="text" value={sendingMsg} onChange={handleChange}/><button onClick={handleClick}>send</button>
     </div>
    </div>
  )
}

export default Message