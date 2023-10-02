import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Amplify } from "aws-amplify";
// eslint-disable-next-line import/no-unresolved
import "@aws-amplify/ui-react/styles.css";
import awsmobile from "./aws-exports";
Amplify.configure(awsmobile);
const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
