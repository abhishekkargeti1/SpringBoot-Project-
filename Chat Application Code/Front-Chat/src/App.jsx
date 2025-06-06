import React, { useState } from "react";
import toast from "react-hot-toast";
import JoinCreateChat from "./components/JoinCreateChat";
const App = ()=>{
  const [count,setCount]=useState(0);
  return(

    <div>
    <JoinCreateChat />
    </div>
  );
}

export default App;