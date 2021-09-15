import React from "react";
import { useCustomCompareEffect } from "use-custom-compare";
import { setComponentValue } from "./component-value";

interface Pyodide {} // TODO

declare namespace PyodideConsumer {
  export interface Props {
    pyodide: Pyodide;
    packages: string[];
    pythonCodeChunks: string[];
  }
}

const PyodideConsumer: React.VFC<PyodideConsumer.Props> = (props) => {
  const { pyodide, packages, pythonCodeChunks } = props;
  useCustomCompareEffect(
    () => {
      setComponentValue({
        result: undefined,
        status: "PROCESSING",
      });
      (async () => {
        try {
          // @ts-ignore
          await pyodide.loadPackage(packages);
          // @ts-ignore
          await pyodide.loadPackage("numpy");
          console.log("Load package", packages);
          let result;
          for (const codeChunk of pythonCodeChunks) {
            // @ts-ignore
            result = await pyodide.runPython(codeChunk); // TODO: Run in WebWorker
          }
          setComponentValue({
            result,
            status: "DONE",
          });
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
            });
          } else {
            setComponentValue({
              result: undefined,
              // @ts-ignore
              error: undefined,
              status: "JS_ERROR",
            });
            throw err;
          }
        }
      })();
    },
    [pyodide, packages, pythonCodeChunks],
    (prevDeps, nextDeps) => {
      if (prevDeps[0] !== nextDeps[0]) {
        return false;
      }
      if (prevDeps[1].some((imp, i) => imp !== nextDeps[1][i])) {
        return false;
      }
      if (prevDeps[2].some((chunk, i) => chunk !== nextDeps[2][i])) {
        return false;
      }
      return true;
    }
  );
  return null;
};

export default PyodideConsumer;
