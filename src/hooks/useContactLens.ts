import { FaceLandmarker, FilesetResolver } from '@mediapipe/tasks-vision';
import { useEffect, useRef, useState } from 'react';

// MediaPipe landmark indices
const LEFT_CENTER = 468;
const LEFT_SURROUND = [
  469,
  470,
  471,
  472,
];
const RIGHT_CENTER = 473;
const RIGHT_SURROUND = [
  474,
  475,
  476,
  477,
];

// Eye closure threshold
const EYE_CLOSURE_THRESHOLD = 0.3;

interface EyeData {
  x: number;
  y: number;
  radius: number;
  isClosed: boolean;
  boundingBox?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
}

function getAvgRadius(
  points: Array<{
    x: number;
    y: number;
  }>,
  centerIndex: number,
  surroundingIndices: number[],
  canvasWidth: number,
  canvasHeight: number,
): number {
  const center = points[centerIndex];
  if (!center) return 0;
  let sum = 0;
  let count = 0;
  for (const idx of surroundingIndices) {
    const p = points[idx];
    if (!p) continue;
    const dx = (p.x - center.x) * canvasWidth;
    const dy = (p.y - center.y) * canvasHeight;
    sum += Math.sqrt(dx * dx + dy * dy);
    count++;
  }
  return count > 0 ? sum / count : 0;
}

function getEyeClosure(
  blendshapes:
    | Array<{
        categories: Array<{
          categoryName: string;
          score: number;
        }>;
      }>
    | undefined,
  eyeName: 'eyeCloseL' | 'eyeCloseR',
): boolean {
  if (!blendshapes || blendshapes.length === 0) return false;

  for (const classification of blendshapes) {
    const category = classification.categories.find(
      (cat) => cat.categoryName === eyeName,
    );
    if (category && category.score > EYE_CLOSURE_THRESHOLD) {
      return true;
    }
  }
  return false;
}

function calculateEyeBoundingBox(
  points: Array<{
    x: number;
    y: number;
  }>,
  eyeIndices: number[],
  canvasWidth: number,
  canvasHeight: number,
):
  | {
      x: number;
      y: number;
      width: number;
      height: number;
    }
  | undefined {
  const eyePoints = eyeIndices
    .map((idx) => points[idx])
    .filter((p) => p !== undefined);

  if (eyePoints.length === 0) return undefined;

  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;

  for (const point of eyePoints) {
    const x = point.x * canvasWidth;
    const y = point.y * canvasHeight;
    minX = Math.min(minX, x);
    minY = Math.min(minY, y);
    maxX = Math.max(maxX, x);
    maxY = Math.max(maxY, y);
  }

  return {
    x: minX,
    y: minY,
    width: maxX - minX,
    height: maxY - minY,
  };
}

function drawContactLens(
  ctx: CanvasRenderingContext2D,
  eye: EyeData,
  image: HTMLImageElement,
) {
  if (!image.complete || image.naturalWidth === 0) return;

  ctx.save();
  ctx.globalCompositeOperation = 'darken'; // or 'darken' for more subtle effect
  ctx.globalAlpha = 0.5;

  const size = eye.radius * 2.5;
  const x = eye.x - size / 2;
  const y = eye.y - size / 2;

  if (eye.isClosed && eye.boundingBox) {
    // Crop to eye bounding box when closed
    ctx.beginPath();
    ctx.rect(
      eye.boundingBox.x,
      eye.boundingBox.y,
      eye.boundingBox.width,
      eye.boundingBox.height,
    );
    ctx.clip();
  } else {
    // Clip to circular shape of the eyeball
    ctx.beginPath();
    ctx.arc(eye.x, eye.y, eye.radius * 1.2, 0, 2 * Math.PI);
    ctx.clip();
  }

  ctx.drawImage(image, x, y, size, size);
  ctx.restore();
}

export function useContactLens(
  videoRef: React.RefObject<HTMLVideoElement | null>,
  selectedProductPath: string | null,
) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const faceLandmarkerRef = useRef<FaceLandmarker | null>(null);
  const animationFrameRef = useRef<number>(0);
  const imageCacheRef = useRef<Map<string, HTMLImageElement>>(new Map());
  const [imageLoaded, setImageLoaded] = useState(false);

  // Load and cache contact lens image
  useEffect(() => {
    if (!selectedProductPath) {
      setImageLoaded(false);
      return;
    }

    const cached = imageCacheRef.current.get(selectedProductPath);
    if (cached?.complete) {
      setImageLoaded(true);
      return;
    }

    const img = new Image();
    img.onload = () => {
      imageCacheRef.current.set(selectedProductPath, img);
      setImageLoaded(true);
    };
    img.onerror = () => {
      console.error(
        '[ERROR] useContactLens: Failed to load image:',
        selectedProductPath,
      );
      setImageLoaded(false);
    };
    img.src = selectedProductPath;
  }, [
    selectedProductPath,
  ]);

  // Initialize FaceLandmarker
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
          '[ERROR] useContactLens: Unable to initialize FaceLandmarker:',
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

  // Animation loop to process video and draw contact lenses
  useEffect(() => {
    function draw() {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const faceLandmarker = faceLandmarkerRef.current;

      if (
        video &&
        canvas &&
        faceLandmarker &&
        video.readyState >= 2 &&
        !video.paused &&
        !video.ended
      ) {
        // Resize canvas to match video size
        if (
          canvas.width !== video.videoWidth ||
          canvas.height !== video.videoHeight
        ) {
          canvas.width = video.videoWidth;
          canvas.height = video.videoHeight;
        }

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Detect face landmarks
        const results = faceLandmarker.detectForVideo(video, performance.now());

        if (
          results?.faceLandmarks?.length &&
          selectedProductPath &&
          imageLoaded
        ) {
          const landmarks = results.faceLandmarks[0];
          const blendshapes = results.faceBlendshapes;

          if (landmarks && landmarks.length > 0) {
            const image = imageCacheRef.current.get(selectedProductPath);
            if (!image) return;

            const canvasWidth = canvas.width;
            const canvasHeight = canvas.height;

            // Process left eye
            if (landmarks.length > Math.max(...LEFT_SURROUND, LEFT_CENTER)) {
              const center = landmarks[LEFT_CENTER];
              const radius = getAvgRadius(
                landmarks,
                LEFT_CENTER,
                LEFT_SURROUND,
                canvasWidth,
                canvasHeight,
              );
              const isClosed = getEyeClosure(blendshapes, 'eyeCloseL');

              const leftEye: EyeData = {
                x: center.x * canvasWidth,
                y: center.y * canvasHeight,
                radius,
                isClosed,
              };

              if (isClosed) {
                // Calculate bounding box for left eye (landmarks 33-46)
                const leftEyeIndices = Array.from(
                  {
                    length: 14,
                  },
                  (_, i) => 33 + i,
                );
                leftEye.boundingBox = calculateEyeBoundingBox(
                  landmarks,
                  leftEyeIndices,
                  canvasWidth,
                  canvasHeight,
                );
              }

              drawContactLens(ctx, leftEye, image);
            }

            // Process right eye
            if (landmarks.length > Math.max(...RIGHT_SURROUND, RIGHT_CENTER)) {
              const center = landmarks[RIGHT_CENTER];
              const radius = getAvgRadius(
                landmarks,
                RIGHT_CENTER,
                RIGHT_SURROUND,
                canvasWidth,
                canvasHeight,
              );
              const isClosed = getEyeClosure(blendshapes, 'eyeCloseR');

              const rightEye: EyeData = {
                x: center.x * canvasWidth,
                y: center.y * canvasHeight,
                radius,
                isClosed,
              };

              if (isClosed) {
                // Calculate bounding box for right eye (landmarks 263-276)
                const rightEyeIndices = Array.from(
                  {
                    length: 14,
                  },
                  (_, i) => 263 + i,
                );
                rightEye.boundingBox = calculateEyeBoundingBox(
                  landmarks,
                  rightEyeIndices,
                  canvasWidth,
                  canvasHeight,
                );
              }

              drawContactLens(ctx, rightEye, image);
            }
          }
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
    selectedProductPath,
    imageLoaded,
  ]);

  return {
    canvasRef,
  };
}
