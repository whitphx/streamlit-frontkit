import React from "react"
import {
  StreamlitComponentBase,
  withStreamlitConnection,
  ComponentProps,
} from "streamlit-component-lib"
import PyodideConsumer from "./PyodideConsumer"
import { setComponentValue } from "./component-value"

type Pyodide = {} // TODO

let pyodide: Pyodide | undefined = undefined

declare namespace PyodideLoader {
  export interface State {
    pyodide: Pyodide | undefined
  }
}

class PyodideLoader extends StreamlitComponentBase<PyodideLoader.State> {
  constructor(props: ComponentProps) {
    super(props)

    this.state = {
      pyodide: pyodide,
    }
    setComponentValue({
      result: undefined,
      status: this.state.pyodide == null ? "INITIALIZED" : "IDLE",
    })
  }

  public componentDidMount() {
    if (this.state.pyodide == null) {
      this._loadPyodide()
    }
  }

  private _loadPyodide = (): Promise<void> => {
    // @ts-ignore
    return loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.0/full/",
    }).then((loadedPyodide: Pyodide) => {
      pyodide = loadedPyodide
      this.setState({ pyodide })
      setComponentValue({
        result: undefined,
        status: "IDLE",
      })
    })
  }

  public render() {
    if (this.state.pyodide == null) {
      return null
    }

    const pythonCode = this.props.args["code"]
    if (typeof pythonCode !== "string") {
      return null // TODO: Error
    }

    return (
      <PyodideConsumer pyodide={this.state.pyodide} pythonCode={pythonCode} />
    )
  }
}

export default withStreamlitConnection(PyodideLoader)
