import { CameraView } from '@/components/camera/camera-view';

export default function Page(_: PageProps<'/'>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh px-6">
      <CameraView />
    </div>
  );
}
