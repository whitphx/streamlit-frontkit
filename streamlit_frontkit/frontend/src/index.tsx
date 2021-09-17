import React from "react";
import ReactDOM from "react-dom";
import PyodideProvider from "./PyodideProvider";
import PyodideApp from "./PyodideApp";

ReactDOM.render(
  <React.StrictMode>
    <PyodideProvider>
      <PyodideApp />
    </PyodideProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
