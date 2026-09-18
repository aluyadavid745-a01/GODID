import type { Product } from "../../types/domain";
import { ProductCard } from "./ProductCard";

export const ProductGrid = ({ products, empty = "No products match your filters." }: { products: Product[]; empty?: string }) => {
  if (!products.length) return <div className="border border-line bg-white p-10 text-center text-muted">{empty}</div>;
  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-8 sm:gap-x-5 sm:gap-y-10 lg:grid-cols-3 xl:grid-cols-4">
      {products.map((product) => <ProductCard key={product.id} product={product} />)}
    </div>
  );
};
