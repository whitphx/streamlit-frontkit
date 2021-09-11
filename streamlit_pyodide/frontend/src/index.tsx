import React from "react"
import ReactDOM from "react-dom"
import MyComponent from "./MyComponent"
import PyodideLoader from "./PyodideLoader"

ReactDOM.render(
  <React.StrictMode>
    <PyodideLoader />
  </React.StrictMode>,
  document.getElementById("root")
)
