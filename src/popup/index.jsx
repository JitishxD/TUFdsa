import React from "react";
import ReactDOM from "react-dom/client";
import "./Styles/index.css";
import { Popup } from "./Components/Popup";
import Home from "./Components/PopUpHome";

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <Home />
  </React.StrictMode>
);
