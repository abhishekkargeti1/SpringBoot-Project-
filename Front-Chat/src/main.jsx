import { createRoot } from "react-dom/client";
import "./index.css";

import { StrictMode } from "react";
import { BrowserRouter } from "react-router";
import Approutes from "./config/Routes.jsx";
import { Toaster } from "react-hot-toast";
import { ChatProvider } from "./context/ChatContext.jsx";

createRoot(document.getElementById("root")).render(
 
    <BrowserRouter>
      <Toaster position="top-right" />
      <ChatProvider>
        <Approutes />
      </ChatProvider>
    </BrowserRouter>

);
