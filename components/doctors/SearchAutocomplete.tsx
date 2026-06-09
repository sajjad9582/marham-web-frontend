"use client";

import { useEffect, useId, useRef, useState, type KeyboardEvent, type ReactNode } from "react";
import { cn } from "@/lib/utils";

export type SearchSuggestion = {
  id: string;
  label: string;
  value: string;
  secondaryLabel?: string;
  icon?: ReactNode;
  meta?: { kind: string; slug?: string };
};

type SearchAutocompleteProps = {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (suggestion: SearchSuggestion) => void;
  suggestions: SearchSuggestion[];
  placeholder: string;
  ariaLabel: string;
  leadingIcon?: ReactNode;
  containerClassName?: string;
  inputClassName?: string;
  fieldClassName?: string;
};

function filterSuggestions(suggestions: SearchSuggestion[], query: string): SearchSuggestion[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) return suggestions;

  return suggestions.filter(
    (item) =>
      item.label.toLowerCase().includes(normalized) ||
      item.value.toLowerCase().includes(normalized) ||
      item.secondaryLabel?.toLowerCase().includes(normalized),
  );
}

export function SearchAutocomplete({
  value,
  onChange,
  onSelect,
  suggestions,
  placeholder,
  ariaLabel,
  leadingIcon,
  containerClassName,
  inputClassName,
  fieldClassName,
}: SearchAutocompleteProps) {
  const listId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const [open, setOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(0);

  const filteredSuggestions = filterSuggestions(suggestions, value);

  useEffect(() => {
    setHighlightedIndex(0);
  }, [value, open]);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [open]);

  const selectSuggestion = (suggestion: SearchSuggestion) => {
    onChange(suggestion.value);
    onSelect?.(suggestion);
    setOpen(false);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (!open && (event.key === "ArrowDown" || event.key === "ArrowUp")) {
      setOpen(true);
      return;
    }

    if (!open || filteredSuggestions.length === 0) return;

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((index) => (index + 1) % filteredSuggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex(
        (index) => (index - 1 + filteredSuggestions.length) % filteredSuggestions.length,
      );
      return;
    }

    if (event.key === "Enter" && filteredSuggestions[highlightedIndex]) {
      event.preventDefault();
      selectSuggestion(filteredSuggestions[highlightedIndex]);
      return;
    }

    if (event.key === "Escape") {
      setOpen(false);
    }
  };

  const showSuggestions = open && filteredSuggestions.length > 0;

  return (
    <div ref={containerRef} className={cn("relative flex-1 min-w-0", containerClassName)}>
      <div
        className={cn(
          "flex items-center gap-1 md:gap-2 border border-[var(--color-paleblue)] rounded-sm px-0.5 md:px-3 transition-shadow",
          showSuggestions && "border-[var(--color-brandblue)] ring-2 ring-[var(--color-brandblue)]/30",
          fieldClassName,
        )}
      >
        {leadingIcon}
        <input
          type="text"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-label={ariaLabel}
          value={value}
          placeholder={placeholder}
          onFocus={() => setOpen(true)}
          onChange={(event) => {
            onChange(event.target.value);
            setOpen(true);
          }}
          onKeyDown={handleKeyDown}
          className={cn(
            "bg-transparent outline-none w-full text-sm capitalize text-[var(--color-darknavy)] py-2",
            inputClassName,
          )}
        />
      </div>

      {showSuggestions && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-[calc(100%+4px)] z-50 max-h-64 overflow-y-auto rounded-md border border-[var(--color-paleblue)] bg-white shadow-sm"
        >
          {filteredSuggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              role="option"
              aria-selected={index === highlightedIndex}
              onMouseDown={(event) => event.preventDefault()}
              onMouseEnter={() => setHighlightedIndex(index)}
              onClick={() => selectSuggestion(suggestion)}
              className={cn(
                "flex items-center gap-2.5 px-3 py-2.5 text-sm text-[var(--color-darknavy)] cursor-pointer border-b border-[var(--color-paleblue)] last:border-b-0",
                index === highlightedIndex && "bg-[var(--color-washblue)]",
              )}
            >
              {suggestion.icon}
              <span className="min-w-0">
                <span className="block">{suggestion.label}</span>
                {suggestion.secondaryLabel && (
                  <span className="block text-xs text-[var(--color-steelblue)] normal-case">
                    {suggestion.secondaryLabel}
                  </span>
                )}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
