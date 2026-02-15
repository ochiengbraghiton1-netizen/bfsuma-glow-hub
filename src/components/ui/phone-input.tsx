import * as React from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export interface CountryCode {
  code: string;
  dial: string;
  name: string;
  flag: string;
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪" },
  { code: "TZ", dial: "+255", name: "Tanzania", flag: "🇹🇿" },
  { code: "UG", dial: "+256", name: "Uganda", flag: "🇺🇬" },
  { code: "RW", dial: "+250", name: "Rwanda", flag: "🇷🇼" },
  { code: "ET", dial: "+251", name: "Ethiopia", flag: "🇪🇹" },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬" },
  { code: "GH", dial: "+233", name: "Ghana", flag: "🇬🇭" },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦" },
  { code: "CD", dial: "+243", name: "DR Congo", flag: "🇨🇩" },
  { code: "CM", dial: "+237", name: "Cameroon", flag: "🇨🇲" },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧" },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸" },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦" },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪" },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦" },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳" },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳" },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪" },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷" },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺" },
];

/**
 * Parse a full international phone string (e.g. "+254712345678") into
 * { dialCode, number } using the known COUNTRY_CODES list.
 */
export function parsePhone(fullPhone: string): { dialCode: string; number: string } {
  if (!fullPhone) return { dialCode: "+254", number: "" };

  // Try matching longest dial code first
  const sorted = [...COUNTRY_CODES].sort((a, b) => b.dial.length - a.dial.length);
  for (const cc of sorted) {
    if (fullPhone.startsWith(cc.dial)) {
      return { dialCode: cc.dial, number: fullPhone.slice(cc.dial.length) };
    }
  }
  return { dialCode: "+254", number: fullPhone.replace(/^\+/, "") };
}

/**
 * Format number for WhatsApp URL (strip + and spaces).
 */
export function formatForWhatsApp(fullPhone: string): string {
  return fullPhone.replace(/[^0-9]/g, "");
}

interface PhoneInputProps {
  value: string; // full international number e.g. "+254712345678"
  onChange: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  error?: boolean;
}

const PhoneInput = React.forwardRef<HTMLInputElement, PhoneInputProps>(
  ({ value, onChange, placeholder = "712 345 678", disabled, className, error }, ref) => {
    const { dialCode, number } = parsePhone(value);

    const handleDialCodeChange = (newDial: string) => {
      onChange(newDial + number);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      // Only allow digits and spaces
      const cleaned = e.target.value.replace(/[^\d\s]/g, "");
      onChange(dialCode + cleaned.replace(/\s/g, ""));
    };

    return (
      <div className={cn("flex gap-2", className)}>
        <Select value={dialCode} onValueChange={handleDialCodeChange} disabled={disabled}>
          <SelectTrigger className={cn("w-[120px] shrink-0", error && "border-destructive")}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="max-h-60">
            {COUNTRY_CODES.map((cc) => (
              <SelectItem key={cc.code} value={cc.dial}>
                <span className="flex items-center gap-2">
                  <span>{cc.flag}</span>
                  <span className="text-xs text-muted-foreground">{cc.dial}</span>
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Input
          ref={ref}
          type="tel"
          inputMode="numeric"
          value={number}
          onChange={handleNumberChange}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(error && "border-destructive")}
        />
      </div>
    );
  }
);
PhoneInput.displayName = "PhoneInput";

export { PhoneInput };
