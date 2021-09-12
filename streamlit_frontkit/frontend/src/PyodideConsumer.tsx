import React, { useEffect } from "react"
import { setComponentValue } from "./component-value"

interface Pyodide {} // TODO

declare namespace PyodideConsumer {
  export interface Props {
    pyodide: Pyodide
    pythonCode: string
  }
}

const PyodideConsumer: React.VFC<PyodideConsumer.Props> = (props) => {
  const { pyodide, pythonCode } = props
  useEffect(() => {
    setComponentValue({
      result: undefined,
      status: "PROCESSING",
    })

    try {
      // @ts-ignore
      const result = pyodide.runPython(pythonCode) // TODO: Run in WebWorker
      setComponentValue({
        result,
        status: "DONE",
      })
    } catch (err) {
      // @ts-ignore
      if (err.name === "PythonError") {
        // Note: err has fields: ['stack', 'message', 'name', '__error_address']
        setComponentValue({
          result: undefined,
          // @ts-ignore
          error: {
            // @ts-ignore
            stack: err.stack,
            // @ts-ignore
            message: err.message,
            // @ts-ignore
            name: err.name,
            // @ts-ignore
            __error_address: err.__error_address,
          },
          status: "PYTHON_ERROR",
        })
      } else {
        setComponentValue({
          result: undefined,
          // @ts-ignore
          error: undefined,
          status: "JS_ERROR",
        })
        throw err
      }
    }
  }, [pyodide, pythonCode])
  return null
}

export default PyodideConsumer
