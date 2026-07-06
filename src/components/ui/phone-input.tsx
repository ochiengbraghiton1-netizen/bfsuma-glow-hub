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
  /** Expected national number length (digits after dial code). Single number or [min,max]. */
  length: number | [number, number];
}

export const COUNTRY_CODES: CountryCode[] = [
  { code: "KE", dial: "+254", name: "Kenya", flag: "🇰🇪", length: 9 },
  { code: "TZ", dial: "+255", name: "Tanzania", flag: "🇹🇿", length: 9 },
  { code: "UG", dial: "+256", name: "Uganda", flag: "🇺🇬", length: 9 },
  { code: "RW", dial: "+250", name: "Rwanda", flag: "🇷🇼", length: 9 },
  { code: "ET", dial: "+251", name: "Ethiopia", flag: "🇪🇹", length: 9 },
  { code: "NG", dial: "+234", name: "Nigeria", flag: "🇳🇬", length: 10 },
  { code: "GH", dial: "+233", name: "Ghana", flag: "🇬🇭", length: 9 },
  { code: "ZA", dial: "+27", name: "South Africa", flag: "🇿🇦", length: 9 },
  { code: "CD", dial: "+243", name: "DR Congo", flag: "🇨🇩", length: 9 },
  { code: "CM", dial: "+237", name: "Cameroon", flag: "🇨🇲", length: 9 },
  { code: "GB", dial: "+44", name: "United Kingdom", flag: "🇬🇧", length: 10 },
  { code: "US", dial: "+1", name: "United States", flag: "🇺🇸", length: 10 },
  { code: "CA", dial: "+1", name: "Canada", flag: "🇨🇦", length: 10 },
  { code: "AE", dial: "+971", name: "UAE", flag: "🇦🇪", length: 9 },
  { code: "SA", dial: "+966", name: "Saudi Arabia", flag: "🇸🇦", length: 9 },
  { code: "IN", dial: "+91", name: "India", flag: "🇮🇳", length: 10 },
  { code: "CN", dial: "+86", name: "China", flag: "🇨🇳", length: 11 },
  { code: "DE", dial: "+49", name: "Germany", flag: "🇩🇪", length: [10, 11] },
  { code: "FR", dial: "+33", name: "France", flag: "🇫🇷", length: 9 },
  { code: "AU", dial: "+61", name: "Australia", flag: "🇦🇺", length: 9 },
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

/** Validate a full international phone against the selected country's expected digit length. */
export function isValidInternationalPhone(fullPhone: string): boolean {
  if (!fullPhone || !fullPhone.startsWith("+")) return false;
  const { dialCode, number } = parsePhone(fullPhone);
  const digits = number.replace(/\D/g, "");
  const cc = COUNTRY_CODES.find((c) => c.dial === dialCode);
  if (!cc) return digits.length >= 7 && digits.length <= 15;
  const len = cc.length;
  if (Array.isArray(len)) return digits.length >= len[0] && digits.length <= len[1];
  return digits.length === len;
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
            {COUNTRY_CODES.filter((cc, i, arr) =>
              arr.findIndex((c) => c.dial === cc.dial) === i
            ).map((cc) => (
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
