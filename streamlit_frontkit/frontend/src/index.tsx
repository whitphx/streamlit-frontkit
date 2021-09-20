import React from "react";
import ReactDOM from "react-dom";
import { ErrorBoundary } from "streamlit-component-lib-react-hooks";
import PyodideProvider from "./PyodideProvider";
import PyodideApp from "./PyodideApp";

ReactDOM.render(
  <React.StrictMode>
    <ErrorBoundary>
      <PyodideProvider>
        <PyodideApp />
      </PyodideProvider>
    </ErrorBoundary>
  </React.StrictMode>,
  document.getElementById("root")
);
