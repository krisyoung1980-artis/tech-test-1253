import React from "react";
import ReactDOM from "react-dom/client";
import { App } from "./components/App";
import "./main.css";

function main() {
  const target = document.getElementById("root") as HTMLDivElement;
  const root = ReactDOM.createRoot(target);

  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}

main();
