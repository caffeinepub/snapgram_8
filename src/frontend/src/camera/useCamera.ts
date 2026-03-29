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

const getUserMediaWithTimeout = (
  constraints: MediaStreamConstraints,
  timeoutMs = 8000,
): Promise<MediaStream> => {
  return Promise.race([
    navigator.mediaDevices.getUserMedia(constraints),
    new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new DOMException("Timeout", "TimeoutError")),
        timeoutMs,
      ),
    ),
  ]);
};

const setupVideoWithTimeout = (
  video: HTMLVideoElement,
  stream: MediaStream,
  timeoutMs = 6000,
): Promise<boolean> => {
  return new Promise((resolve) => {
    let settled = false;
    const done = (result: boolean) => {
      if (settled) return;
      settled = true;
      clearTimeout(timer);
      video.removeEventListener("loadedmetadata", onReady);
      video.removeEventListener("canplay", onReady);
      video.removeEventListener("error", onErr);
      resolve(result);
    };

    const onReady = () => {
      video.play().catch(() => {});
      done(true);
    };
    const onErr = () => done(false);
    const timer = setTimeout(() => done(false), timeoutMs);

    video.addEventListener("loadedmetadata", onReady);
    video.addEventListener("canplay", onReady);
    video.addEventListener("error", onErr);

    video.srcObject = stream;

    if (video.readyState >= 1) {
      onReady();
    }
  });
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
    const supported = !!navigator.mediaDevices?.getUserMedia;
    setIsSupported(supported);
  }, []);

  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      cleanup();
    };
  }, []);

  const cleanup = useCallback(() => {
    if (streamRef.current) {
      for (const track of streamRef.current.getTracks()) {
        track.stop();
      }
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setIsActive(false);
  }, []);

  // Triple fallback: ideal constraints → facingMode only → any camera
  const createMediaStreamWithFallback = useCallback(
    async (facing: "user" | "environment"): Promise<MediaStream> => {
      const attempts: MediaStreamConstraints[] = [
        {
          video: {
            facingMode: { ideal: facing },
            width: { ideal: width },
            height: { ideal: height },
          },
        },
        { video: { facingMode: facing } },
        { video: true },
      ];

      let lastError: any = null;
      for (const constraints of attempts) {
        try {
          const stream = await getUserMediaWithTimeout(constraints, 8000);
          return stream;
        } catch (err: any) {
          lastError = err;
          // Don't retry permission errors
          if (err.name === "NotAllowedError" || err.name === "SecurityError") {
            break;
          }
        }
      }

      // Translate error
      let errorType: CameraError["type"] = "unknown";
      let errorMessage = "Camera start nahi hua, dobara try karein";
      if (
        lastError?.name === "NotAllowedError" ||
        lastError?.name === "SecurityError"
      ) {
        errorType = "permission";
        errorMessage =
          "Camera permission denied hai — browser mein allow karein";
      } else if (lastError?.name === "NotFoundError") {
        errorType = "not-found";
        errorMessage = "Koi camera device nahi mila";
      } else if (lastError?.name === "NotSupportedError") {
        errorType = "not-supported";
        errorMessage = "Camera is browser mein supported nahi";
      }
      throw { type: errorType, message: errorMessage } as CameraError;
    },
    [width, height],
  );

  const startCamera = useCallback(
    async (facing?: "user" | "environment"): Promise<boolean> => {
      if (isSupported === false || isLoading) return false;

      setIsLoading(true);
      setError(null);

      const targetFacing = facing ?? currentFacingMode;

      try {
        cleanup();

        const stream = await createMediaStreamWithFallback(targetFacing);

        if (!isMountedRef.current) {
          for (const t of stream.getTracks()) t.stop();
          return false;
        }

        streamRef.current = stream;

        if (!videoRef.current) {
          cleanup();
          return false;
        }

        const ok = await setupVideoWithTimeout(videoRef.current, stream, 6000);

        if (ok && isMountedRef.current) {
          setIsActive(true);
          return true;
        }

        cleanup();
        return false;
      } catch (err: any) {
        if (isMountedRef.current) setError(err);
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
      createMediaStreamWithFallback,
    ],
  );

  const stopCamera = useCallback(async (): Promise<void> => {
    if (isLoading) return;
    setIsLoading(true);
    cleanup();
    setError(null);
    await new Promise((r) => setTimeout(r, 100));
    if (isMountedRef.current) setIsLoading(false);
  }, [isLoading, cleanup]);

  const switchCamera = useCallback(
    async (newFacingMode?: "user" | "environment"): Promise<boolean> => {
      if (isSupported === false || isLoading) return false;

      const targetFacingMode =
        newFacingMode ||
        (currentFacingMode === "user" ? "environment" : "user");

      setCurrentFacingMode(targetFacingMode);
      return startCamera(targetFacingMode);
    },
    [isSupported, isLoading, currentFacingMode, startCamera],
  );

  const retry = useCallback(async (): Promise<boolean> => {
    if (isLoading) return false;
    setError(null);
    cleanup();
    await new Promise((r) => setTimeout(r, 300));
    return startCamera();
  }, [isLoading, cleanup, startCamera]);

  const capturePhoto = useCallback((): Promise<File | null> => {
    return new Promise((resolve) => {
      if (!videoRef.current || !canvasRef.current || !isActive) {
        resolve(null);
        return;
      }

      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;

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
            const ext = format.split("/")[1];
            resolve(
              new File([blob], `photo_${Date.now()}.${ext}`, { type: format }),
            );
          } else {
            resolve(null);
          }
        },
        format,
        quality,
      );
    });
  }, [isActive, format, quality, currentFacingMode]);

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
