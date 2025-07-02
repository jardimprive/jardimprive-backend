"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectProps {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
}

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  selected?: boolean;
}

export function Select({ value, onValueChange, children }: SelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <SelectTrigger onClick={() => setOpen(!open)}>
        <SelectValue>{value || "Selecione"}</SelectValue>
        <ChevronDown
          className={cn(
            "ml-2 h-4 w-4 transition-transform",
            open ? "rotate-180" : ""
          )}
        />
      </SelectTrigger>

      {open && (
        <SelectContent>
          {React.Children.map(children, (child) => {
            if (!React.isValidElement<SelectItemProps>(child)) return null;

            return React.cloneElement(child, {
              onSelect: (val: string) => {
                onValueChange(val);
                setOpen(false);
              },
              selected: child.props.value === value,
            });
          })}
        </SelectContent>
      )}
    </div>
  );
}

export function SelectTrigger({
  children,
  onClick,
}: {
  children: React.ReactNode;
  onClick?: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center justify-between px-4 py-2 border rounded shadow bg-white"
    >
      {children}
    </button>
  );
}

export function SelectContent({ children }: { children: React.ReactNode }) {
  return (
    <div className="absolute z-10 mt-2 w-full rounded border bg-white shadow-md">
      {children}
    </div>
  );
}

export function SelectItem({
  value,
  onSelect,
  selected,
  children,
}: SelectItemProps) {
  return (
    <div
      onClick={() => onSelect?.(value)}
      className={cn(
        "px-4 py-2 cursor-pointer hover:bg-gray-100",
        selected && "bg-gray-100 font-semibold"
      )}
    >
      {children}
    </div>
  );
}

export function SelectValue({ children }: { children: React.ReactNode }) {
  return <span>{children}</span>;
}
