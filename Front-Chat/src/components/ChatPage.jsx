import React, { useEffect, useRef, useState } from "react";
import { MdAttachFile, MdFileUpload, MdSend } from "react-icons/md";
import useChatContext from "../context/ChatContext";
import SockJS from "sockjs-client";
import { httpClient, baseURL } from "../config/AxiosHelper";
import { timeAgo } from "../config/helper";
import toast from "react-hot-toast";
import { Stomp } from "@stomp/stompjs";
import { useNavigate } from "react-router";
import { getMessage } from "../services/Roomservice";
const ChatPage = () => {
  const { roomId, currentUser, connected,setConnected,setCurrentUser, setRoomId } = useChatContext();

useEffect(()=>{
    async function loadMessages(){
      try {
        const response = await getMessage(roomId)
        console.log("Messages are "+response)
        setMessages(response);
      } catch (error) {
        console.log(error);
      }
    }
     if(connected){
    loadMessages()
     }
  },[]);


  const navigate = useNavigate()
  useEffect(()=>{
    if(!connected){
      navigate("/");
    }
  },[roomId,currentUser,connected]);



  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);
  const chatBoxRef = useRef(null);
  const [stompClient, setStompClient] = useState(null);

  //Stomp Set up
  useEffect(() => {
    const connectWebStock = () => {
      const sock = new SockJS(`${baseURL}/chat`);
      const client = Stomp.over(sock);
      client.connect({}, () => {
        setStompClient(client);
        toast.success("Connected Successfully");
        client.subscribe(`/topic/room/${roomId}`, (message) => {
          console.log("Messages are " + message);
          const newMessage = JSON.parse(message.body);
          setMessages((prev) => [...prev, newMessage]);
        });
      });
    };
    if(connected){
      connectWebStock();
    }
  }, [roomId]);


  // Scroll Effect
   useEffect(()=>{
    if(chatBoxRef.current){
      chatBoxRef.current.scroll({
        top:chatBoxRef.current.scrollHeight,
        behavior:'smooth'
      })
    }
  },[messages]);


  //Leave button Function
  function handleLogOut(){
    stompClient.disconnect();
    setConnected(false)
    setRoomId('')
    setCurrentUser('')
    navigate('/')
  }



  const sendMessage = async () => {
    if (stompClient && connected && input.trim()) {
      console.log(input);
      const message = {
        sender:currentUser,
        content:input,
        roomId:roomId
      }
      stompClient.send(`/app/sendMessage/${roomId}`,{},JSON.stringify(message));
      setInput("")
    }
  };

  return (
    <div className="">
      <header className="dark:border-gray-900 dark:bg-gray-900 fixed w-full  py-5 shadow flex justify-around item-center">
        <div>
          <h1 className="text-xl font-semibold">
            Room Id:<span> {roomId}</span>
          </h1>
        </div>
        <div>
          <h1 className="text-xl font-semibold">
            User :<span> {currentUser}</span>
          </h1>
        </div>
        <div>
          {/* button */}
          <button onClick={handleLogOut} className=" px-3 py-2 dark:bg-red-600 rounded-lg hover:dark:bg-red-800">
            Leave Room
          </button>
        </div>
      </header>
      <main ref={chatBoxRef} className="h-screen py-20 w-2/3  mx-auto  overflow-auto  scrollbar-hide">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.sender === currentUser ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`${
                message.sender === currentUser
                  ? "bg-green-500"
                  : " bg-purple-500"
              } my-2  p-2 max-w-xs rounded `}
            >
              <div className="flex flex-row">
                <img
                  className="h-10 w-10 gap-20"
                  src={"https://avatar.iran.liara.run/public/1"}
                  alt=""
                />
                <div className=" flex flex-col gap-1">
                  <p className="text-sm font-bold">{message.sender}</p>
                  <p>{message.content}</p>
                  <p className="text-xs text-gray-800">{timeAgo(message.timeStamp)}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </main>
      {/* Input Field */}
      <div className="fixed bottom-2 w-full h-16">
        <div className="h-full dark:bg-gray-900 pr-10  rounded w-2/3 mx-auto flex items-center justify-between">
          <input
            type="text"
            value={input}
            onChange={(e) => {
              setInput(e.target.value);
            }}
            onKeyDown={(e)=>{
              if(e.key==="Enter"){
                sendMessage();
              }
            }}
            className=" w-full dark:border-gray-700 dark:bg-gray-900 px-3 py-2 focus:outline-none"
            placeholder="Type Your Message"
          />
          <div className="flex justify-center items-center gap-3">
            <button className=" px-3 py-2 dark:bg-gray-700 rounded hover:dark:bg-gray-800 h-10 w-10 flex justify-center items-center">
              <MdAttachFile size={20} />
            </button>
            <button
              onClick={sendMessage}
              className=" px-3 py-2 dark:bg-green-600 rounded hover:dark:bg-green-800 h-10 w-10 flex justify-center items-center"
            >
              <MdSend size={20} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
