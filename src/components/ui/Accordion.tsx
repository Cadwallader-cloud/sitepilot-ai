"use client";

import {
  createContext,
  useContext,
  useState,
  type ReactNode,
} from "react";
import { inset, paddingBottom, spacing } from "./tokens";
import { useThemeStyle } from "./theme-context";

type AccordionContextValue = {
  openIndex: number;
  toggle: (index: number) => void;
};

const AccordionContext = createContext<AccordionContextValue | null>(null);

export type AccordionProps = {
  children: ReactNode;
  defaultIndex?: number;
  allowCollapse?: boolean;
  className?: string;
};

export function Accordion({
  children,
  defaultIndex = 0,
  allowCollapse = true,
  className = "",
}: AccordionProps) {
  const [openIndex, setOpenIndex] = useState(defaultIndex);

  function toggle(index: number) {
    setOpenIndex((current) => {
      if (current === index) {
        return allowCollapse ? -1 : index;
      }
      return index;
    });
  }

  return (
    <AccordionContext.Provider value={{ openIndex, toggle }}>
      <div className={className} data-component="Accordion">
        {children}
      </div>
    </AccordionContext.Provider>
  );
}

export type AccordionItemProps = {
  index: number;
  title: string;
  children: ReactNode;
  className?: string;
};

export function AccordionItem({
  index,
  title,
  children,
  className = "",
}: AccordionItemProps) {
  const context = useContext(AccordionContext);
  const { color } = useThemeStyle();
  if (!context) {
    throw new Error("AccordionItem must be used within Accordion");
  }

  const open = context.openIndex === index;

  return (
    <div className={className} data-component="AccordionItem">
      <button
        type="button"
        className={`flex w-full items-start justify-between ${spacing.lg} text-left ${inset.accordionItem}`}
        onClick={() => context.toggle(index)}
        aria-expanded={open}
      >
        <span className="font-semibold text-zinc-900">{title}</span>
        <span
          className="text-xl leading-none"
          style={color()}
          aria-hidden
        >
          {open ? "−" : "+"}
        </span>
      </button>
      {open ? (
        <div className={`text-sm leading-relaxed text-zinc-600 ${paddingBottom.sm}`}>{children}</div>
      ) : null}
    </div>
  );
}
