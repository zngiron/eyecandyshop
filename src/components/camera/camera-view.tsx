'use client';

import { Button } from '@/components/ui/button';
import { useCamera } from '@/hooks/useCamera';

export function CameraView() {
  const { videoRef, isCameraActive, startCamera, stopCamera } = useCamera();

  return (
    <div className="overflow-hidden relative size-full max-w-4xl rounded-xl aspect-video bg-muted">
      <video
        ref={videoRef}
        className="absolute inset-0 size-full object-cover"
        playsInline
        muted
      />
      <div className="absolute inset-x-0 bottom-0 p-4">
        <Button
          type="button"
          className="cursor-pointer bg-primary/30 backdrop-blur-lg"
          onClick={isCameraActive ? stopCamera : startCamera}
        >
          {isCameraActive ? 'Stop Camera' : 'Start Camera'}
        </Button>
      </div>
    </div>
  );
}
