import * as React from "react";
import { cn } from "@/lib/utils";

export interface SliderProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "value"> {
  value: number;
  onValueChange: (value: number) => void;
}

export function Slider({
  className,
  value,
  onValueChange,
  min,
  max,
  step,
  ...props
}: SliderProps) {
  return (
    <input
      type="range"
      className={cn(
        "w-full accent-primary",
        "focus:outline-none focus:ring-2 focus:ring-ring",
        className
      )}
      value={value}
      min={min}
      max={max}
      step={step}
      onChange={(event) => onValueChange(Number(event.target.value))}
      {...props}
    />
  );
}
