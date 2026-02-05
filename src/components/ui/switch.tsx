import * as React from "react";
import { cn } from "@/lib/utils";

export interface SwitchProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
}

export function Switch({ className, label, ...props }: SwitchProps) {
  return (
    <label className={cn("inline-flex items-center gap-2", className)}>
      <input
        type="checkbox"
        className="peer sr-only"
        {...props}
      />
      <span className="h-6 w-11 rounded-full bg-muted transition peer-checked:bg-primary relative">
        <span className="absolute left-1 top-1 h-4 w-4 rounded-full bg-white transition peer-checked:translate-x-5" />
      </span>
      {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
    </label>
  );
}
