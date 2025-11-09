import Image from 'next/image';

export default function Page(_: PageProps<'/'>) {
  return (
    <div className="flex flex-col items-center justify-center min-h-dvh">
      <Image
        className="size-16"
        src="/static/frontend-dev-icon.svg"
        alt="Front-End Development"
        width={64}
        height={64}
        draggable={false}
        priority
      />
    </div>
  );
}
