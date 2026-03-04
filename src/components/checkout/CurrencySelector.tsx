import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { type CurrencyCode, CURRENCY_OPTIONS } from '@/hooks/use-currency';

const CURRENCY_LABELS: Record<CurrencyCode, string> = {
  USD: '🇺🇸 USD',
  KES: '🇰🇪 KES',
  EUR: '🇪🇺 EUR',
  GBP: '🇬🇧 GBP',
};

interface CurrencySelectorProps {
  value: CurrencyCode;
  onChange: (value: CurrencyCode) => void;
}

const CurrencySelector = ({ value, onChange }: CurrencySelectorProps) => {
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-muted-foreground">Currency:</span>
      <Select value={value} onValueChange={(v) => onChange(v as CurrencyCode)}>
        <SelectTrigger className="w-[130px] h-9">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {CURRENCY_OPTIONS.map((code) => (
            <SelectItem key={code} value={code}>
              {CURRENCY_LABELS[code]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default CurrencySelector;
