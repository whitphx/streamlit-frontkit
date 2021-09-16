import React, { useCallback, useRef } from "react";
import { Streamlit } from "streamlit-component-lib";
import { useCustomCompareEffect } from "use-custom-compare";
import { setComponentValue } from "./component-value";
import { Pyodide } from "./PyodideProvider";
import CameraInput from "./CameraInput";

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

  const canvasRef = useRef<HTMLCanvasElement>(null);

  const onFrame = useCallback(
    async (imageData: ImageData) => {
      /* eslint-disable no-restricted-globals */
      // @ts-ignore
      self.imagewidth = imageData.width;
      // @ts-ignore
      self.imageheight = imageData.height;
      // @ts-ignore
      self.jsarray = imageData.data;
      /* eslint-enable */
      // @ts-ignore
      await pyodide.runPython(`
        from js import jsarray, imagewidth, imageheight
        array = jsarray.to_py()
        import numpy as np
        input_image = np.asarray(array).reshape((imageheight, imagewidth, 4))

        import skimage
        grayscale = skimage.color.rgb2gray(input_image)
        output_array = skimage.color.gray2rgb(grayscale)

        alpha = np.ones((imageheight, imagewidth, 1), dtype=np.uint8)
        output_array = np.concatenate((output_array, alpha), axis=2).copy()
        output_array = skimage.util.img_as_ubyte(output_array)

        output_height, output_width = output_array.shape[:2]
    `); // TODO: Run in WebWorker

      // @ts-ignore
      const proxy = pyodide.globals.get("output_array");
      // @ts-ignore
      const output_width = pyodide.globals.get("output_width");
      // @ts-ignore
      const output_height = pyodide.globals.get("output_height");
      const buffer = proxy.getBuffer("u8");
      proxy.destroy();
      try {
        const newImageData = new ImageData(
          new Uint8ClampedArray(
            buffer.data.buffer,
            buffer.data.byteOffset,
            buffer.data.byteLength
          ),
          output_width,
          output_height
        );
        const canvasElem = canvasRef.current;
        if (canvasElem) {
          if (
            canvasElem.width !== output_width ||
            canvasElem.height !== output_height
          ) {
            canvasElem.width = output_width;
            canvasElem.height = output_height;
            Streamlit.setFrameHeight();
          }
          const ctx = canvasElem.getContext("2d");
          ctx?.putImageData(newImageData, 0, 0);
        }
      } finally {
        buffer.release(); // Release the memory when we're done
      }
    },
    [pyodide]
  );

  return (
    <div>
      <CameraInput onFrame={onFrame} />
      <canvas ref={canvasRef} />
    </div>
  );
};

export default PyodideConsumer;
