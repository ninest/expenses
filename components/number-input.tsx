"use client";

import { Input } from "@/components/ui/input";
import { ComponentProps, forwardRef } from "react";

type NumberInputProps = ComponentProps<typeof Input> & {
  placeholder?: string;
  prefixBefore?: string;
  prefixAfter?: string;
};

export const NumberInput = forwardRef<HTMLInputElement, NumberInputProps>(
  ({ placeholder = "00.0", prefixBefore, prefixAfter, ...props }, ref) => {
    return (
      <div className="flex items-center space-x-2 text-lg font-bold tabular-nums">
        {prefixBefore && <div className="text-muted-foreground">{prefixBefore}</div>}
        <Input
          ref={ref}
          type="number"
          placeholder={placeholder}
          // Select all on click
          onFocus={(e) => e.target.select()}
          // Prevent scrollwheel changing value
          onWheel={(e) => e.currentTarget.blur()}
          {...props}
        />
        {prefixAfter && <div className="text-muted-foreground">{prefixAfter}</div>}
      </div>
    );
  }
);
