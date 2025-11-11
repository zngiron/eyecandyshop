'use client';

import { useState } from 'react';

import { CameraView } from '@/components/camera/camera-view';
import { ProductSelector } from '@/components/products/product-selector';

export default function Page(_: PageProps<'/'>) {
  const [selectedProductPath, setSelectedProductPath] = useState<string | null>(
    null,
  );

  return (
    <div className="flex flex-col lg:flex-row items-start justify-center min-h-dvh px-4 sm:px-6 py-4 sm:py-8 gap-4 lg:gap-6">
      <div className="w-full lg:flex-1 lg:max-w-4xl">
        <CameraView selectedProductPath={selectedProductPath} />
      </div>
      <div className="w-full lg:w-80 lg:shrink-0">
        <ProductSelector onSelect={setSelectedProductPath} />
      </div>
    </div>
  );
}
