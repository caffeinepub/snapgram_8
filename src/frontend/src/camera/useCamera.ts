import { useCallback, useEffect, useRef, useState } from "react";

export interface CameraConfig {
  facingMode?: "user" | "environment";
  width?: number;
  height?: number;
  quality?: number;
  format?: "image/jpeg" | "image/png" | "image/webp";
}

export interface CameraError {
  type: "permission" | "not-supported" | "not-found" | "unknown";
  message: string;
}

const withTimeout = <T>(
  promise: Promise<T>,
  ms: number,
  label: string,
): Promise<T> =>
  new Promise((resolve, reject) => {
    const timer = setTimeout(
      () => reject(new Error(`Timeout: ${label} took more than ${ms}ms`)),
      ms,
    );
    promise.then(
      (val) => {
        clearTimeout(timer);
        resolve(val);
      },
      (err) => {
        clearTimeout(timer);
        reject(err);
      },
    );
  });

const tryGetUserMedia = (
  constraints: MediaStreamConstraints,
): Promise<MediaStream> =>
  withTimeout(
    navigator.mediaDevices.getUserMedia(constraints),
    8000,
    "getUserMedia",
  );

const stopStream = (stream: MediaStream) => {
  for (const track of stream.getTracks()) track.stop();
};

export const useCamera = (config: CameraConfig = {}) => {
  const {
    facingMode = "user",
    width = 640,
    height = 480,
    quality = 0.8,
    format = "image/jpeg",
  } = config;

  const [isActive, setIsActive] = useState(false);
  const [isSupported, setIsSupported] = useState<boolean | null>(null);
  const [error, setError] = useState<CameraError | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentFacingMode, setCurrentFacingMode] = useState(facingMode);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    setIsSupported(!!navigator.mediaDevices?.getUserMedia);
  }, []);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      stopStream(streamRef.current);
      streamRef.current = null;
    }
    if (videoRef.current) videoRef.current.srcObject = null;
    setIsActive(false);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, [cleanup]);

  const createMediaStream = useCallback(
    async (facing: "user" | "environment"): Promise<MediaStream> => {
      const permissionError: CameraError = {
        type: "permission",
        message:
          "Camera permission denied. Browser settings mein allow karein.",
      };

      // Step 1: ideal constraints
      try {
        const stream = await tryGetUserMedia({
          video: {
            facingMode: facing,
            width: { ideal: width },
            height: { ideal: height },
          },
        });
        if (!isMountedRef.current) {
          stopStream(stream);
          throw new Error("unmounted");
        }
        return stream;
      } catch (e1: any) {
        if (e1.name === "NotAllowedError") throw permissionError;
      }

      // Step 2: facingMode only
      try {
        const stream = await tryGetUserMedia({ video: { facingMode: facing } });
        if (!isMountedRef.current) {
          stopStream(stream);
          throw new Error("unmounted");
        }
        return stream;
      } catch (e2: any) {
        if (e2.name === "NotAllowedError") throw permissionError;
      }

      // Step 3: any camera
      try {
        const stream = await tryGetUserMedia({ video: true });
        if (!isMountedRef.current) {
          stopStream(stream);
          throw new Error("unmounted");
        }
        return stream;
      } catch (e3: any) {
        if (e3.name === "NotAllowedError") throw permissionError;
        throw {
          type: "not-found",
          message: "Camera nahi mila. Device check karein.",
        } as CameraError;
      }
    },
    [width, height],
  );

  const setupVideo = useCallback(
    async (stream: MediaStream): Promise<boolean> => {
      if (!videoRef.current) return false;
      const video = videoRef.current;
      video.srcObject = stream;

      if (video.readyState >= 2) {
        try {
          await video.play();
        } catch (_) {}
        return true;
      }

      return new Promise<boolean>((resolve) => {
        let resolved = false;
        const done = (result: boolean) => {
          if (resolved) return;
          resolved = true;
          clearTimeout(timer);
          video.removeEventListener("loadedmetadata", onReady);
          video.removeEventListener("canplay", onReady);
          video.removeEventListener("error", onErr);
          resolve(result);
        };

        const timer = setTimeout(() => {
          video.play().catch(() => {});
          done(true);
        }, 5000);

        const onReady = async () => {
          try {
            await video.play();
          } catch (_) {}
          done(true);
        };
        const onErr = () => done(false);

        video.addEventListener("loadedmetadata", onReady);
        video.addEventListener("canplay", onReady);
        video.addEventListener("error", onErr);
      });
    },
    [],
  );

  const startCamera = useCallback(async (): Promise<boolean> => {
    if (isSupported === false || isLoading) return false;
    setIsLoading(true);
    setError(null);
    try {
      cleanup();
      const stream = await createMediaStream(currentFacingMode);
      if (!isMountedRef.current) return false;
      streamRef.current = stream;
      const success = await setupVideo(stream);
      if (isMountedRef.current) {
        setIsActive(true);
        return success;
      }
      cleanup();
      return false;
    } catch (err: any) {
      if (isMountedRef.current)
        setError({
          type: err.type || "unknown",
          message: err.message || "Camera start nahi hua",
        });
      cleanup();
      return false;
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [
    isSupported,
    isLoading,
    currentFacingMode,
    cleanup,
    createMediaStream,
    setupVideo,
  ]);

  const stopCamera = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    cleanup();
    setError(null);
    await new Promise((resolve) => setTimeout(resolve, 100));
    if (isMountedRef.current) setIsLoading(false);
  }, [isLoading, cleanup]);

  const switchCamera = useCallback(
    async (newFacingMode?: "user" | "environment"): Promise<boolean> => {
      if (isSupported === false || isLoading) return false;
      const targetFacingMode =
        newFacingMode ||
        (currentFacingMode === "user" ? "environment" : "user");
      setIsLoading(true);
      setError(null);
      try {
        cleanup();
        setCurrentFacingMode(targetFacingMode);
        await new Promise((resolve) => setTimeout(resolve, 100));
        const stream = await createMediaStream(targetFacingMode);
        if (!isMountedRef.current) return false;
        streamRef.current = stream;
        const success = await setupVideo(stream);
        if (success && isMountedRef.current) {
          setIsActive(true);
          return true;
        }
        cleanup();
        return false;
      } catch (err: any) {
        if (isMountedRef.current)
          setError({
            type: err.type || "unknown",
            message: err.message || "Camera switch failed",
          });
        cleanup();
        return false;
      } finally {
        if (isMountedRef.current) setIsLoading(false);
      }
    },
    [
      isSupported,
      isLoading,
      currentFacingMode,
      cleanup,
      createMediaStream,
      setupVideo,
    ],
  );

  const retry = useCallback(async (): Promise<boolean> => {
    if (isLoading) return false;
    setError(null);
    await stopCamera();
    await new Promise((resolve) => setTimeout(resolve, 200));
    return startCamera();
  }, [isLoading, stopCamera, startCamera]);

  const capturePhoto = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        resolve(null);
        return;
      }
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || width;
      canvas.height = video.videoHeight || height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        resolve(null);
        return;
      }
      if (currentFacingMode === "user") {
        ctx.scale(-1, 1);
        ctx.drawImage(video, -canvas.width, 0);
      } else {
        ctx.drawImage(video, 0, 0);
      }
      canvas.toBlob(
        (blob) => {
          if (blob) {
            const extension = format.split("/")[1];
            resolve(
              new File([blob], `photo_${Date.now()}.${extension}`, {
                type: format,
              }),
            );
          } else {
            resolve(null);
          }
        },
        format,
        quality,
      );
    });
  }, [isActive, format, quality, currentFacingMode, width, height]);

  return {
    isActive,
    isSupported,
    error,
    isLoading,
    currentFacingMode,
    startCamera,
    stopCamera,
    capturePhoto,
    switchCamera,
    retry,
    videoRef,
    canvasRef,
  };
};
