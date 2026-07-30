"use client";

import * as React from "react";

import { cn } from "@/lib/utils";

export const sectionVariants = {
  hidden: { opacity: 0, transform: "translateY(18px)" },
  visible: { opacity: 1, transform: "translateY(0)" },
};

export const luxuryChildVariants = sectionVariants;

export interface LuxurySectionBaseProps
  extends React.HTMLAttributes<HTMLElement> {
  as?: "section" | "div" | "article";
  delay?: number;
}

export type LuxurySectionProps = LuxurySectionBaseProps;

export function LuxurySection({
  as: Component = "section",
  delay = 0,
  className,
  children,
  ...props
}: LuxurySectionProps) {
  return (
    <Component
      className={cn(
        "transition-[opacity,transform] duration-700 ease-out",
        className,
      )}
      style={{ transitionDelay: `${delay}s`, ...props.style }}
      {...props}
    >
      {children}
    </Component>
  );
}

export function LuxuryMotionChild({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn(className)} {...props}>
      {children}
    </div>
  );
}
