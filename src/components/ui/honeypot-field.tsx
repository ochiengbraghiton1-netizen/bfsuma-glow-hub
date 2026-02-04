import * as React from "react";

interface HoneypotFieldProps {
  value: string;
  onChange: (value: string) => void;
  name?: string;
}

/**
 * Honeypot field component for bot detection.
 * This field is invisible to human users but gets filled by automated bots.
 * If the field contains any value on form submission, the submission should be rejected.
 */
export const HoneypotField = React.forwardRef<HTMLInputElement, HoneypotFieldProps>(
  ({ value, onChange, name = "website" }, ref) => {
    return (
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          left: '-9999px',
          top: '-9999px',
          width: '1px',
          height: '1px',
          overflow: 'hidden',
        }}
      >
        <label htmlFor={name}>
          Please leave this field empty
        </label>
        <input
          ref={ref}
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
    );
  }
);

HoneypotField.displayName = "HoneypotField";

export default HoneypotField;
