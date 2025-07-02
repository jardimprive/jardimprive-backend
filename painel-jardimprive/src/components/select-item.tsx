"use client";

import React from "react";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface SelectItemProps {
  value: string;
  children: React.ReactNode;
  onSelect?: (value: string) => void;
  selected?: boolean;
}

export const SelectItem = ({
  value,
  children,
  onSelect,
  selected,
}: SelectItemProps) => {
  return (
    <div
      onClick={() => onSelect?.(value)}
      className={cn(
        "flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-zinc-100",
        selected && "bg-zinc-100 font-semibold"
      )}
    >
      {children}
      {selected && <Check className="w-4 h-4 text-green-600" />}
    </div>
  );
};
