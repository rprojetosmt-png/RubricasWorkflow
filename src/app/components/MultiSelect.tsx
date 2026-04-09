import * as React from "react";
import { X, Check, ChevronsUpDown } from "lucide-react";
import { Badge } from "./ui/badge";
import { Button } from "./ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "./ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "./ui/popover";
import { cn } from "./ui/utils";
import { Checkbox } from "./ui/checkbox";

export interface Option {
  label: string;
  value: string;
}

interface MultiSelectProps {
  options: Option[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Selecione as opções...",
  className,
  error,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);

  const handleUnselect = (value: string) => {
    onChange(selected.filter((s) => s !== value));
  };

  const handleSelect = (value: string) => {
    if (selected.includes(value)) {
      handleUnselect(value);
    } else {
      onChange([...selected, value]);
    }
  };

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className={cn(
              "justify-between h-auto min-h-10 text-left font-normal py-2 px-3",
              error && "border-red-500",
              !selected.length && "text-muted-foreground",
              "hover:bg-accent/50 transition-colors border-2"
            )}
          >
            <div className="flex flex-wrap gap-1.5 items-center">
              {selected.length > 0 ? (
                selected.map((val) => {
                  const option = options.find((o) => o.value === val);
                  return (
                    <Badge
                      key={val}
                      variant="secondary"
                      className="bg-blue-100 text-blue-800 border-blue-200 gap-1 px-1.5 py-0.5 hover:bg-blue-200"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUnselect(val);
                      }}
                    >
                      {option?.label || val}
                      <X className="h-3 w-3 text-blue-600 hover:text-blue-900 cursor-pointer" />
                    </Badge>
                  );
                })
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0" align="start">
          <Command className="border-none">
            <CommandInput placeholder="Pesquisar..." className="border-none focus:ring-0" />
            <CommandList>
              <CommandEmpty>Nenhuma opção encontrada.</CommandEmpty>
              <CommandGroup>
                {options.map((option) => (
                  <CommandItem
                    key={option.value}
                    onSelect={() => handleSelect(option.value)}
                    className="flex items-center gap-2 cursor-pointer"
                  >
                    <Checkbox
                      checked={selected.includes(option.value)}
                      className="border-slate-300"
                    />
                    <span className="flex-1">{option.label}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
}
