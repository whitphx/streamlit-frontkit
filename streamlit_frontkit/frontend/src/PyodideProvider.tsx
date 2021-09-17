import React, { useState, useEffect, useMemo, useContext } from "react";

export interface Pyodide {} // TODO

interface PyodideContextValue {
  pyodide: Pyodide | undefined;
}
const pyodideContext = React.createContext<PyodideContextValue | undefined>(
  undefined
);

export const usePyodide = (): Pyodide | undefined => {
  const value = useContext(pyodideContext);
  if (value == null) {
    throw new Error("usePyodide must be used in <PyodideProvider />");
  }

  return value.pyodide;
};

interface PyodideProviderProps {
  children: React.ReactNode;
}

const PyodideProvider: React.VFC<PyodideProviderProps> = (props) => {
  const [pyodide, setPyodide] = useState<Pyodide>();

  useEffect(() => {
    // @ts-ignore
    loadPyodide({
      indexURL: "https://cdn.jsdelivr.net/pyodide/v0.18.0/full/",
    }).then((pyodide: Pyodide) => {
      setPyodide(pyodide);
    });
  }, []);

  const value: PyodideContextValue = useMemo(
    () => ({
      pyodide,
    }),
    [pyodide]
  );

  return (
    <pyodideContext.Provider value={value}>
      {props.children}
    </pyodideContext.Provider>
  );
};

export default React.memo(PyodideProvider);
