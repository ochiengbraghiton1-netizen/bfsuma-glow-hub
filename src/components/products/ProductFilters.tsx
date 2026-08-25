import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FilterCategory {
  id: string;
  name: string;
  /** Number of currently visible products in this category (0 is allowed). */
  productCount?: number;
}

export interface FilterState {
  /** Stable database category IDs — single source of truth for category filtering. */
  categoryIds: string[];
  priceMin: string;
  priceMax: string;
  inStockOnly: boolean;
}

export const defaultFilters: FilterState = {
  categoryIds: [],
  priceMin: "",
  priceMax: "",
  inStockOnly: false,
};

/**
 * Sanitises persisted filter state (sessionStorage may still hold the legacy
 * `healthConcerns` string list from the previous text-matching implementation).
 */
export const normalizeFilters = (value: unknown): FilterState => {
  if (!value || typeof value !== "object") return defaultFilters;
  const raw = value as Record<string, unknown>;
  return {
    categoryIds: Array.isArray(raw.categoryIds)
      ? (raw.categoryIds.filter((id) => typeof id === "string") as string[])
      : [],
    priceMin: typeof raw.priceMin === "string" ? raw.priceMin : "",
    priceMax: typeof raw.priceMax === "string" ? raw.priceMax : "",
    inStockOnly: raw.inStockOnly === true,
  };
};

export const getActiveFilterCount = (filters: FilterState): number => {
  let count = 0;
  count += filters.categoryIds.length;
  if (filters.priceMin) count++;
  if (filters.priceMax) count++;
  if (filters.inStockOnly) count++;
  return count;
};

interface ProductFiltersProps {
  filters: FilterState;
  categories: FilterCategory[];
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  className?: string;
}

const ProductFilters = ({ filters, categories, onChange, onClear, className }: ProductFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState({
    health: true,
    price: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleCategory = (categoryId: string) => {
    const updated = filters.categoryIds.includes(categoryId)
      ? filters.categoryIds.filter((id) => id !== categoryId)
      : [...filters.categoryIds, categoryId];
    onChange({ ...filters, categoryIds: updated });
  };

  return (
    <div className={cn("space-y-5", className)}>
      {/* Health Concern */}
      <div>
        <button
          onClick={() => toggleSection("health")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-3"
        >
          Health Concern
          {expandedSections.health ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.health && (
          <div className="space-y-2.5">
            {categories.length === 0 ? (
              <p className="text-sm text-muted-foreground">No categories available.</p>
            ) : (
              categories.map((category) => (
                <label
                  key={category.id}
                  className="flex items-center gap-2.5 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  <Checkbox
                    checked={filters.categoryIds.includes(category.id)}
                    onCheckedChange={() => toggleCategory(category.id)}
                  />
                  <span className="flex-1">{category.name}</span>
                  {typeof category.productCount === "number" && (
                    <span className="text-xs text-muted-foreground/70">({category.productCount})</span>
                  )}
                </label>
              ))
            )}
          </div>
        )}
      </div>

      {/* Price Range */}
      <div>
        <button
          onClick={() => toggleSection("price")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-3"
        >
          Price Range (KSh)
          {expandedSections.price ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.price && (
          <div className="flex items-center gap-2">
            <Input
              type="number"
              placeholder="Min"
              value={filters.priceMin}
              onChange={(e) => onChange({ ...filters, priceMin: e.target.value })}
              className="h-9 text-sm rounded-lg"
            />
            <span className="text-muted-foreground text-sm">to</span>
            <Input
              type="number"
              placeholder="Max"
              value={filters.priceMax}
              onChange={(e) => onChange({ ...filters, priceMax: e.target.value })}
              className="h-9 text-sm rounded-lg"
            />
          </div>
        )}
      </div>

      {/* Availability */}
      <div>
        <button
          onClick={() => toggleSection("availability")}
          className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-3"
        >
          Availability
          {expandedSections.availability ? (
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          ) : (
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          )}
        </button>
        {expandedSections.availability && (
          <label className="flex items-center gap-2.5 cursor-pointer text-sm text-muted-foreground">
            <Switch
              checked={filters.inStockOnly}
              onCheckedChange={(checked) => onChange({ ...filters, inStockOnly: checked })}
            />
            In Stock Only
          </label>
        )}
      </div>

      {/* Clear All */}
      {getActiveFilterCount(filters) > 0 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={onClear}
          className="w-full text-destructive hover:text-destructive"
        >
          <X className="h-3.5 w-3.5 mr-1" />
          Clear All Filters
        </Button>
      )}
    </div>
  );
};

// Mobile filter trigger button
export const MobileFilterButton = ({
  activeCount,
  onClick,
}: {
  activeCount: number;
  onClick: () => void;
}) => (
  <Button
    variant="outline"
    size="sm"
    onClick={onClick}
    className="rounded-full border-border/50 lg:hidden"
  >
    <Filter className="h-4 w-4 mr-1.5" />
    Filters
    {activeCount > 0 && (
      <span className="ml-1.5 bg-primary text-primary-foreground text-xs rounded-full px-1.5 py-0.5 min-w-[20px] text-center">
        {activeCount}
      </span>
    )}
  </Button>
);

export default ProductFilters;
