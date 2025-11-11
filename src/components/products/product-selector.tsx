'use client';

import Image from 'next/image';

import { CheckCircle, CheckCircle2 } from 'lucide-react';
import { useEffect, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { cn } from '@/lib/utils';
import productsData from '@/data/products.json';

interface Product {
  id: string;
  name: string;
  description: string;
  image: string;
  price: number;
  externalUrl: string;
}

interface ProductSelectorProps {
  onSelect?: (productPath: string | null) => void;
  className?: string;
}

export function ProductSelector({ onSelect, className }: ProductSelectorProps) {
  const products = productsData as Product[];
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(
    products.length ? products[0] : null,
  );

  // Fix: Only notify parent when selectedProduct changes, not unnecessarily on mount.
  useEffect(() => {
    if (selectedProduct) {
      onSelect?.(selectedProduct.image);
    } else {
      onSelect?.(null);
    }
  }, [
    onSelect,
    selectedProduct,
  ]);

  const handleSelect = (product: Product) => {
    // Fix: Don't allow setting the same product again or updating if already selected
    if (selectedProduct?.id !== product.id) {
      setSelectedProduct(product);
      onSelect?.(product.image);
    }
  };

  if (!products.length) {
    return (
      <div className={cn('w-full flex flex-col gap-3', className)}>
        <h2 className="text-xs font-semibold uppercase tracking-wide">
          Contact Lenses
        </h2>
        <div className="text-sm text-gray-500">No products available.</div>
      </div>
    );
  }

  return (
    <div className={cn('w-full flex flex-col gap-3', className)}>
      {/* Product Details - Above Gallery */}
      {selectedProduct && (
        <Card className="border-b py-3 shadow-none">
          <div className="flex gap-3 px-4 pb-3">
            <div className="flex-1 min-w-0">
              <CardHeader className="p-0 pb-2">
                <CardTitle className="text-sm font-semibold">
                  {selectedProduct.name}
                </CardTitle>
                <CardDescription
                  className="text-xs mt-1"
                  style={{
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {selectedProduct.description}
                </CardDescription>
              </CardHeader>
              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold">
                  ${selectedProduct.price.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="w-20 h-20 shrink-0 rounded-lg overflow-hidden relative">
              <Image
                src={selectedProduct.image}
                alt={selectedProduct.name}
                fill
                className="object-cover"
                priority
              />
            </div>
          </div>
          <CardFooter className="pt-0 px-4 flex flex-col gap-2">
            <Button
              variant="default"
              size="sm"
              className="w-full text-xs h-8"
              onClick={() => window.open(selectedProduct.externalUrl, '_blank')}
            >
              View Product
            </Button>
          </CardFooter>
        </Card>
      )}

      {/* Product Gallery */}
      <div className="flex flex-col gap-2">
        {products.map((product) => {
          const isSelected = selectedProduct?.id === product.id;
          return (
            <Card
              key={product.id}
              className={cn(
                'relative overflow-hidden cursor-pointe border-muted transition-all p-0 shadow-none',
                'hover:border-primary border-2',
                isSelected && 'border-primary',
              )}
              onClick={() => handleSelect(product)}
            >
              <div className="flex items-center gap-2 p-2">
                <div className="w-12 h-12 shrink-0 rounded overflow-hidden relative">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium truncate">{product.name}</p>
                </div>
                {isSelected && (
                  <div className="shrink-0">
                    <CheckCircle2 />
                  </div>
                )}
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
