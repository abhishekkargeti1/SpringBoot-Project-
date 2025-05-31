import React from "react";
import { Routes,Route } from "react-router";
import App from '../App'
import ChatPage from "../components/ChatPage";
const Approutes = ()=>{
    return(
        <Routes>
            <Route path="/" element={<App />}/>
            <Route path="/chat" element={<ChatPage />}/>
            <Route path="*" element={<h1>404 Not Found</h1>}/>
        </Routes>
    );
};

export default Approutes;