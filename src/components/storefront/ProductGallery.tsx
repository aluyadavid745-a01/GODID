'use client'
import { useState } from "react";
import type { Product } from "../../types/domain";

export const ProductGallery = ({ product }: { product: Product }) => {
  const [active, setActive] = useState(product.images[0]);
  return (
    <div className="grid gap-4 lg:grid-cols-[88px_1fr]">
      <div className="order-2 flex gap-3 overflow-x-auto lg:order-1 lg:flex-col">
        {product.images.map((image) => (
          <button key={image} className={`focus-ring h-24 w-20 shrink-0 border bg-bone ${active === image ? "border-ink" : "border-line"}`} onClick={() => setActive(image)}>
            <img src={image} alt={`${product.name} thumbnail`} className="h-full w-full object-contain" />
          </button>
        ))}
      </div>
      <div className="order-1 flex items-center justify-center bg-bone lg:order-2">
        <img src={active} alt={product.name} className="w-full object-contain" />
      </div>
    </div>
  );
};
