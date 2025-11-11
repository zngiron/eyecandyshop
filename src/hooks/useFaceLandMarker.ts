import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';

function drawLandmarksOnCanvas(
  canvas: HTMLCanvasElement,
  landmarks: Array<
    {
      x: number;
      y: number;
    }[]
  >,
  options: {
    color?: string;
    radius?: number;
  } = {},
) {
  const ctx = canvas.getContext('2d');

  if (!ctx) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.save();
  ctx.strokeStyle = options.color || '#000000';
  ctx.fillStyle = options.color || '#000000';
  ctx.lineWidth = 1;

  for (const points of landmarks) {
    for (const point of points) {
      ctx.beginPath();
      const x = point.x * canvas.width;
      const y = point.y * canvas.height;
      ctx.arc(x, y, options.radius ?? 1, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }
  }

  ctx.restore();
}

export function useFaceLandMarker(
  videoRef: React.RefObject<HTMLVideoElement | null>,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number>(0);

  useEffect(() => {
    let isCancelled = false;

    const createFaceLandmarker = async () => {
      try {
        const filesetResolver = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm',
        );
        const faceLandmarker = await FaceLandmarker.createFromOptions(
          filesetResolver,
          {
            baseOptions: {
              modelAssetPath:
                'https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task',
              delegate: 'GPU',
            },
            outputFaceBlendshapes: true,
            runningMode: 'VIDEO',
            numFaces: 1,
          },
        );
        if (!isCancelled) {
          faceLandmarkerRef.current = faceLandmarker;
        } else {
          faceLandmarker.close();
        }
      } catch (error) {
        console.error(
          '[ERROR] useFaceLandMarker: Unable to initialize FaceLandmarker:',
          error,
        );
      }
    };

    createFaceLandmarker();

    return () => {
      isCancelled = true;

      if (faceLandmarkerRef.current) {
        faceLandmarkerRef.current.close();
        faceLandmarkerRef.current = null;
      }
    };
  }, []);

  // Animation loop effect to process the video and draw landmarks
  useEffect(() => {
    function draw() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const faceLandmarker = faceLandmarkerRef.current;

      if (
        video &&
        canvas &&
        faceLandmarker &&
        video.readyState >= 2 && // HAVE_CURRENT_DATA
        !video.paused &&
        !video.ended
      ) {
        // Optionally resize canvas to match video size
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        // Use FaceLandmarker to detect
        const results = faceLandmarker.detectForVideo(video, performance.now());

        if (results?.faceLandmarks?.length) {
          drawLandmarksOnCanvas(canvas, results.faceLandmarks);
        } else {
          // Clear canvas if nothing detected
          const ctx = canvas.getContext('2d');
          ctx?.clearRect(0, 0, canvas.width, canvas.height);
        }
      }

      animationFrameRef.current = requestAnimationFrame(draw);
    }

    animationFrameRef.current = requestAnimationFrame(draw);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [
    videoRef,
  ]);

  return {
    canvasRef,
  };
}
