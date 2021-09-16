import React, { useCallback, useState, useEffect } from "react";

declare namespace CameraInput {
  export interface Props {
    onFrame: (bitmap: ImageData) => void | Promise<void>;
  }
}

const CameraInput: React.VFC<CameraInput.Props> = (props) => {
  const [playing, setPlaying] = useState(false);

  const onFrame = props.onFrame;

  useEffect(() => {
    if (!playing) {
      return;
    }

    const canvasElem = document.createElement("canvas");
    const canvasCtx = canvasElem.getContext("2d");
    if (canvasCtx == null) {
      console.error("Failed to get canvas context.");
      setPlaying(false);
      return;
    }

    const videoElem = document.createElement("video");

    let lastFrameTime: number | null = null;
    const onAnimationFrame = async () => {
      if (!videoElem.paused && videoElem.currentTime !== lastFrameTime) {
        lastFrameTime = videoElem.currentTime;
        canvasCtx.drawImage(videoElem, 0, 0);
        const imageData = canvasCtx.getImageData(
          0,
          0,
          canvasElem.width,
          canvasElem.height
        );
        await onFrame(imageData);
      }

      waitForNextAnimationFrame();
    };

    const waitForNextAnimationFrame = () => {
      window.requestAnimationFrame(function (time) {
        onAnimationFrame();
      });
    };

    let stream: MediaStream | null = null;
    const constraints: MediaStreamConstraints = { video: true };
    navigator.mediaDevices.getUserMedia(constraints).then((_stream) => {
      stream = _stream;
      videoElem.srcObject = stream;
      videoElem.onloadedmetadata = function () {
        canvasElem.width = videoElem.videoWidth;
        canvasElem.height = videoElem.videoHeight;
        videoElem.play();
        waitForNextAnimationFrame();
      };
    });

    return () => {
      // Clean up function
      videoElem.pause();
      videoElem.remove();

      stream?.getTracks().forEach(function (track) {
        track.stop();
      });

      setPlaying(false);
    };
  }, [playing, onFrame]);

  const requestPlay = useCallback(() => {
    setPlaying(true);
  }, []);
  const requestPause = useCallback(() => {
    setPlaying(false);
  }, []);

  return playing ? (
    <button onClick={requestPause}>Pause</button>
  ) : (
    <button onClick={requestPlay}>Play</button>
  );
};

export default CameraInput;
