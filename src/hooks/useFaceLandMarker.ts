import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef } from 'react';

// Draw filled circles covering actual eyeballs using MediaPipe iris landmarks
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

  // MediaPipe iris landmarks for eyeball contour:
  // 468-472 = left eye, 473-477 = right eye
  // We'll cover the eyeballs by drawing circles whose center is 468/473 and radius is average distance to 469-472/474-477

  function getAvgRadius(
    points: {
      x: number;
      y: number;
    }[],
    centerIndex: number,
    surroundingIndices: number[],
  ) {
    const center = points[centerIndex];
    if (!center) return 0;
    let sum = 0;
    let count = 0;
    for (const idx of surroundingIndices) {
      const p = points[idx];
      if (!p) continue;
      const dx = (p.x - center.x) * canvas.width;
      const dy = (p.y - center.y) * canvas.height;
      sum += Math.sqrt(dx * dx + dy * dy);
      count++;
    }
    return count > 0 ? sum / count : (options.radius ?? 8);
  }

  for (const points of landmarks) {
    // Defensive check for at least right structure
    if (!points) continue;

    // Left eyeball: center 468, contour 469-472
    const LEFT_CENTER = 468;
    const LEFT_SURROUND = [
      469,
      470,
      471,
      472,
    ];
    if (points.length > Math.max(...LEFT_SURROUND, LEFT_CENTER)) {
      const c = points[LEFT_CENTER];
      const radius = getAvgRadius(points, LEFT_CENTER, LEFT_SURROUND);
      const x = c.x * canvas.width;
      const y = c.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
      ctx.fill();
      ctx.closePath();
    }

    // Right eyeball: center 473, contour 474-477
    const RIGHT_CENTER = 473;
    const RIGHT_SURROUND = [
      474,
      475,
      476,
      477,
    ];
    if (points.length > Math.max(...RIGHT_SURROUND, RIGHT_CENTER)) {
      const c = points[RIGHT_CENTER];
      const radius = getAvgRadius(points, RIGHT_CENTER, RIGHT_SURROUND);
      const x = c.x * canvas.width;
      const y = c.y * canvas.height;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, 2 * Math.PI);
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
