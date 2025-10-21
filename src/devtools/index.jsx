import React from "react";
import ReactDOM from "react-dom/client";
import { DevTools } from "./DevTools";
import "./index.css";

ReactDOM.createRoot(document.getElementById("app")).render(
  <React.StrictMode>
    <DevTools />
  </React.StrictMode>
);

chrome.devtools.panels.create(
  "ReactCrx",
  "",
  "../../devtools.html",
  function () {
    // DevTools panel created
  }
);
