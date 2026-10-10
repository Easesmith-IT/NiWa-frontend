import React from "react";
import Link from "next/link";
import { Package } from "lucide-react";
import { Card } from "../../../components/ui/card";
import type { SearchProductResult } from "../search.types";

export interface SearchProductsSectionProps {
  isLoading: boolean;
  products: SearchProductResult[];
}

export const SearchProductsSection: React.FC<SearchProductsSectionProps> = ({
  isLoading,
  products,
}) => {
  if (!isLoading && products.length === 0) return null;

  return (
    <Card className="space-y-3.5 p-4">
      <div className="flex items-center gap-2 border-b border-[#F0F0F2] pb-2 dark:border-[#202326]">
        <Package className="h-4 w-4 text-[#176B4D] dark:text-[#359B76]" />
        <div>
          <h2 className="text-sm font-semibold text-foreground">Products</h2>
        </div>
      </div>
      <div className="space-y-2.5">
        {isLoading ? (
          <div className="rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 animate-pulse space-y-2 dark:border-[#292C2F] dark:bg-[#17191B]">
            <div className="h-3.5 w-36 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
            <div className="h-3 w-28 rounded bg-[#E4E4E7] dark:bg-[#292C2F]" />
          </div>
        ) : null}
        {products.map((item) => (
          <Link
            className="block rounded-md border border-[#E4E4E7] bg-[#FAFAFA] p-3 transition-colors hover:border-[#D4D4D8] dark:border-[#292C2F] dark:bg-[#17191B] dark:hover:border-[#3A3E42]"
            href={`/products/${encodeURIComponent(item._id)}`}
            key={item._id}
          >
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs font-semibold text-foreground">{item.name}</p>
              <span className="rounded bg-[#F4F4F5] px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground dark:bg-[#202326]">
                {item.status}
              </span>
            </div>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground">SKU: {item.productId}</p>
            {item.description ? (
              <p className="mt-1 line-clamp-1 text-xs text-muted-foreground">{item.description}</p>
            ) : null}
          </Link>
        ))}
      </div>
    </Card>
  );
};
