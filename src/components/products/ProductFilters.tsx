import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Filter, X, ChevronDown, ChevronUp } from "lucide-react";
import { cn } from "@/lib/utils";

export const HEALTH_CONCERNS = [
  "Women's Health",
  "Men's Health",
  "Immunity",
  "Digestive Health",
  "Joint & Bone Health",
  "Brain & Energy",
  "Weight Management",
  "Skin & Beauty",
] as const;

export interface FilterState {
  healthConcerns: string[];
  priceMin: string;
  priceMax: string;
  inStockOnly: boolean;
}

export const defaultFilters: FilterState = {
  healthConcerns: [],
  priceMin: "",
  priceMax: "",
  inStockOnly: false,
};

export const getActiveFilterCount = (filters: FilterState): number => {
  let count = 0;
  if (filters.healthConcerns.length > 0) count += filters.healthConcerns.length;
  if (filters.priceMin) count++;
  if (filters.priceMax) count++;
  if (filters.inStockOnly) count++;
  return count;
};

interface ProductFiltersProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  onClear: () => void;
  className?: string;
}

const ProductFilters = ({ filters, onChange, onClear, className }: ProductFiltersProps) => {
  const [expandedSections, setExpandedSections] = useState({
    health: true,
    price: true,
    availability: true,
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections((prev) => ({ ...prev, [section]: !prev[section] }));
  };

  const toggleConcern = (concern: string) => {
    const updated = filters.healthConcerns.includes(concern)
      ? filters.healthConcerns.filter((c) => c !== concern)
      : [...filters.healthConcerns, concern];
    onChange({ ...filters, healthConcerns: updated });
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
            {HEALTH_CONCERNS.map((concern) => (
              <label
                key={concern}
                className="flex items-center gap-2.5 cursor-pointer text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Checkbox
                  checked={filters.healthConcerns.includes(concern)}
                  onCheckedChange={() => toggleConcern(concern)}
                />
                {concern}
              </label>
            ))}
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
            <span className="text-muted-foreground text-sm">—</span>
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
