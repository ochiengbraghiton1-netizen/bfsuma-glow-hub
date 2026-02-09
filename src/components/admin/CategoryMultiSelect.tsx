import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2 } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface CategoryMultiSelectProps {
  selectedCategoryIds: string[];
  onChange: (categoryIds: string[]) => void;
  disabled?: boolean;
}

const CategoryMultiSelect = ({ selectedCategoryIds, onChange, disabled }: CategoryMultiSelectProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data, error } = await supabase
        .from('categories')
        .select('id, name, slug')
        .eq('is_active', true)
        .order('display_order', { ascending: true });

      if (!error && data) {
        setCategories(data);
      }
      setLoading(false);
    };

    fetchCategories();
  }, []);

  const handleToggle = (categoryId: string) => {
    if (disabled) return;
    
    if (selectedCategoryIds.includes(categoryId)) {
      onChange(selectedCategoryIds.filter(id => id !== categoryId));
    } else {
      onChange([...selectedCategoryIds, categoryId]);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Loading categories...</span>
      </div>
    );
  }

  if (categories.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        No categories available. Create categories first.
      </p>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-2 mb-2">
        {selectedCategoryIds.length > 0 ? (
          categories
            .filter(cat => selectedCategoryIds.includes(cat.id))
            .map(cat => (
              <Badge key={cat.id} variant="secondary">
                {cat.name}
              </Badge>
            ))
        ) : (
          <span className="text-sm text-muted-foreground">No categories selected</span>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto border rounded-md p-3">
        {categories.map((category) => (
          <div key={category.id} className="flex items-center space-x-2">
            <Checkbox
              id={`cat-${category.id}`}
              checked={selectedCategoryIds.includes(category.id)}
              onCheckedChange={() => handleToggle(category.id)}
              disabled={disabled}
            />
            <Label
              htmlFor={`cat-${category.id}`}
              className="text-sm font-normal cursor-pointer"
            >
              {category.name}
            </Label>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CategoryMultiSelect;
