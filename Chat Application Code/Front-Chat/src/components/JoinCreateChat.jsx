import React, { useState } from "react";
import toast from "react-hot-toast";
import { createRoomService, joinChatService } from "../services/Roomservice";
import useChatContext from "../context/ChatContext";
import { useNavigate } from "react-router";

const JoinCreateChat = () => {
  const [details, setDetails] = useState({
    userName: "",
    roomId: "",
  });

  const {
    roomId,
    currentUser,
    connected,
    setRoomId,
    setCurrentUser,
    setConnected,
  } = useChatContext();
  const navigate = useNavigate();

  function handleInputChange(event) {
    const value = event.target.value;
    console.log(`Input name: ${event.target.name}, value: ${value}`);
    setDetails({
      ...details,
      [event.target.name]: value,
    });
  }

  async function createRoom() {
    if (!validation()) {
      toast.error("Please Fill the Room ID First");
      toast.error("Please Fill Your Name");
    } else {
      try {
        const response = await createRoomService(details.roomId);
        console.log(response);
        toast.success("Room Created Successfully");
        setCurrentUser(details.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error.status == 404) {
          toast.error(error.response.data);
        } else if (error.status == 409) {
          toast.error(error.response.data);
        } else {
          toast.error("Unexcepted Error Occured");
          console.log(error);
        }
      }
    }
  }

  async function joinRoom() {
    if (!validation()) {
      toast.error("Please Fill the Room ID First");
      toast.error("Please Fill Your Name");
    } else {
      try {
        const response = await joinChatService(details.roomId);
        toast.success(`Welcome ${details.userName} in the Chat Room`);
        setCurrentUser(details.userName);
        setRoomId(response.roomId);
        setConnected(true);
        navigate("/chat");
      } catch (error) {
        if (error == 404) {
          toast.error(error.response.data);
          console.log(error);
        } else {
          toast.error("Unexcepted Error Occured");
          console.log(error);
        }
      }

      // console.log(details.roomId)
      // console.log(details.userName)
    }
  }

  function validation() {
    if (details.roomId === "" || details.userName === "") {
      return false;
    } else {
      return true;
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center ">
      <div className="p-8 w-full max-w-md flex flex-col gap-5 rounded dark:bg-gray-900 shadow">
        <h1 className="text-2xl font-semibold text-center ">
          Join Room / Create Room
        </h1>
        {/* Name Div */}
        <div className="">
          <label htmlFor="" className="block font-medium mb-2">
            Your Name
          </label>
          <input
            onChange={handleInputChange}
            type="text"
            id="name"
            value={details.userName}
            name="userName"
            placeholder="Enter Your Name"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {/* Code Div  */}
        <div className="">
          <label htmlFor="" className="block font-medium mb-2">
            Room Id
          </label>
          <input
            onChange={handleInputChange}
            value={details.roomId}
            name="roomId"
            placeholder="Enter Your Code"
            type="text"
            id="code"
            className="w-full dark:bg-gray-600 px-4 py-2 border dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        <div className="flex justify-center gap-8">
          <button
            type="submit"
            className=" px-3 py-2 dark:bg-blue-600 rounded-lg hover:dark:bg-blue-800"
            onClick={joinRoom}
          >
            Join Room
          </button>
          <button
            type="submit"
            className=" px-3 py-2 dark:bg-green-600 rounded-lg hover:dark:bg-green-800"
            onClick={createRoom}
          >
            Create Room
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinCreateChat;
