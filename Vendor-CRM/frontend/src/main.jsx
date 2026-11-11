
import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./styles/theme.css";
import "./index.css";
import { applyTheme, getTheme } from "./services/preferences";

// Apply the saved theme before the first render so the page never flashes.
applyTheme(getTheme());

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
