"use client";

import { Check, ChevronDown } from "lucide-react";
import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
}

interface SelectProps {
  id?: string;
  name?: string;
  value?: string;
  defaultValue?: string;
  onChange?: (e: { target: { value: string } }) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
  children?: ReactNode;
}

function parseOptions(children: ReactNode): SelectOption[] {
  const options: SelectOption[] = [];
  Children.forEach(children, (child) => {
    if (
      isValidElement<{ value?: string; children?: ReactNode }>(child) &&
      child.type === "option"
    ) {
      options.push({
        value: String(child.props.value ?? ""),
        label: String(child.props.children ?? ""),
      });
    }
  });
  return options;
}

export function Select({
  id,
  name,
  value,
  defaultValue = "",
  onChange,
  disabled,
  required,
  className,
  children,
}: SelectProps) {
  const options = parseOptions(children);
  const [open, setOpen] = useState(false);
  const [internalValue, setInternalValue] = useState(defaultValue);
  const [menuStyle, setMenuStyle] = useState<React.CSSProperties>({});
  const containerRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLUListElement>(null);

  const currentValue = value !== undefined ? value : internalValue;
  const selected = options.find((o) => o.value === currentValue);
  const displayLabel = selected?.label ?? "בחר אפשרות";

  const updateMenuPosition = useCallback(() => {
    const trigger = triggerRef.current;
    if (!trigger) return;

    const rect = trigger.getBoundingClientRect();
    const gap = 6;
    const maxHeight = 240;
    const spaceBelow = window.innerHeight - rect.bottom - gap;
    const spaceAbove = rect.top - gap;
    const openUpward = spaceBelow < 160 && spaceAbove > spaceBelow;

    const height = Math.min(maxHeight, openUpward ? spaceAbove : spaceBelow);

    setMenuStyle({
      position: "fixed",
      left: rect.left,
      width: rect.width,
      zIndex: 9999,
      maxHeight: height,
      ...(openUpward
        ? { bottom: window.innerHeight - rect.top + gap }
        : { top: rect.bottom + gap }),
    });
  }, []);

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  useEffect(() => {
    if (!open) return;

    updateMenuPosition();

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        containerRef.current?.contains(target) ||
        menuRef.current?.contains(target)
      ) {
        return;
      }
      setOpen(false);
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };

    const handleReposition = () => updateMenuPosition();

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEscape);
    window.addEventListener("resize", handleReposition);
    window.addEventListener("scroll", handleReposition, true);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEscape);
      window.removeEventListener("resize", handleReposition);
      window.removeEventListener("scroll", handleReposition, true);
    };
  }, [open, updateMenuPosition]);

  const selectValue = (newValue: string) => {
    if (value === undefined) setInternalValue(newValue);
    onChange?.({ target: { value: newValue } });
    setOpen(false);
  };

  const dropdown =
    open &&
    typeof document !== "undefined" &&
    createPortal(
      <ul
        ref={menuRef}
        role="listbox"
        style={menuStyle}
        className="overflow-auto rounded-xl border border-stone-200/80 bg-white py-1.5 shadow-xl shadow-black/15"
      >
        {options.map((option) => {
          const isSelected = option.value === currentValue;
          return (
            <li
              key={option.value || "__empty"}
              role="option"
              aria-selected={isSelected}
              onClick={() => selectValue(option.value)}
              className={cn(
                "mx-1.5 flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors",
                isSelected
                  ? "bg-blue-600 font-medium text-white"
                  : "text-[#1a1714] hover:bg-blue-50"
              )}
            >
              <span className="truncate">{option.label}</span>
              {isSelected && <Check className="h-4 w-4 shrink-0" />}
            </li>
          );
        })}
      </ul>,
      document.body
    );

  return (
    <div ref={containerRef} className={cn("relative", className)}>
      {name && (
        <input
          type="hidden"
          name={name}
          value={currentValue}
          required={required && currentValue === ""}
        />
      )}
      <button
        ref={triggerRef}
        type="button"
        id={id}
        disabled={disabled}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={cn(
          "flex h-11 w-full items-center justify-between gap-2 rounded-xl border border-[#c4a055]/25 bg-white/80 px-4 py-2 text-sm text-[#1a1714] shadow-sm transition-all",
          "hover:border-[#c4a055]/40",
          "focus-visible:border-blue-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-100",
          open && "border-blue-400 ring-2 ring-blue-100",
          disabled && "cursor-not-allowed opacity-50"
        )}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown
          className={cn(
            "h-4 w-4 shrink-0 text-stone-400 transition-transform duration-200",
            open && "rotate-180 text-blue-600"
          )}
        />
      </button>
      {dropdown}
    </div>
  );
}
