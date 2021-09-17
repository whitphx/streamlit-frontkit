import React, { useEffect } from "react";
import { usePyodide } from "./PyodideProvider";
import { useStreamlit } from "./streamlit";
import { setComponentValue } from "./component-value";
import PyodideConsumer from "./PyodideConsumer";

const PyodideApp: React.VFC = () => {
  const pyodide = usePyodide();
  const renderData = useStreamlit();

  useEffect(() => {
    if (pyodide == null) {
      setComponentValue({
        status: "INITIALIZED",
        result: undefined,
        error: undefined,
      });
    }
  }, [pyodide]);

  if (renderData == null) {
    return null;
  }

  if (pyodide == null) {
    return null;
  }

  const pythonCodeChunks = renderData.args["code_chunks"];
  if (!Array.isArray(pythonCodeChunks)) {
    return null; // TODO: Error
  }
  if (pythonCodeChunks.some((codeChunk) => typeof codeChunk !== "string")) {
    return null; // TODO: Error
  }

  const packages = renderData.args["packages"];
  if (!Array.isArray(packages)) {
    return null; // TODO: Error
  }
  if (packages.some((imp) => typeof imp !== "string")) {
    return null; // TODO: Error
  }

  return (
    <PyodideConsumer
      pyodide={pyodide}
      pythonCodeChunks={pythonCodeChunks}
      packages={packages}
    />
  );
};

export default React.memo(PyodideApp);
