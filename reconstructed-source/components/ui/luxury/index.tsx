import Link from "next/link";
import * as React from "react";

import { cn } from "@/lib/utils";

export function LuxuryContainer({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "mx-auto max-w-7xl px-4 py-10 md:px-8 md:py-24",
        className,
      )}
      {...props}
    />
  );
}

export type HeadingTag = "h1" | "h2" | "h3";
export interface LuxuryHeadingProps
  extends React.HTMLAttributes<HTMLHeadingElement> {
  as?: HeadingTag;
}

export function LuxuryHeading({
  as: Component = "h2",
  className,
  ...props
}: LuxuryHeadingProps) {
  return (
    <Component
      className={cn(
        "font-heading font-semibold tracking-[0] text-[#111111]",
        Component === "h1" &&
          "text-5xl leading-[0.95] sm:text-6xl lg:text-7xl",
        Component === "h2" &&
          "text-3xl leading-[1.03] md:text-5xl lg:text-6xl",
        Component === "h3" && "text-xl leading-tight md:text-2xl",
        className,
      )}
      {...props}
    />
  );
}

export function LuxuryParagraph({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("leading-loose text-[#333333]", className)}
      {...props}
    />
  );
}

export interface LuxuryCardProps
  extends React.HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
}

export function LuxuryCard({
  className,
  interactive,
  ...props
}: LuxuryCardProps) {
  return (
    <div
      className={cn(
        "rounded-[2rem] border border-black/10 bg-white/90 p-6 shadow-[0_24px_70px_rgba(17,17,17,0.08)]",
        interactive &&
          "transition duration-300 hover:-translate-y-1 hover:shadow-[0_30px_80px_rgba(17,17,17,0.14)]",
        className,
      )}
      {...props}
    />
  );
}

export interface LuxuryButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  secondary?: boolean;
}

export function LuxuryButton({
  href,
  secondary,
  className,
  children,
  ...props
}: LuxuryButtonProps) {
  const classes = cn(
    "inline-flex min-h-12 items-center justify-center rounded-full px-7 py-3 text-sm font-semibold transition",
    secondary
      ? "border border-black/15 bg-white text-[#111111] hover:border-black/30"
      : "bg-[#111111] text-white shadow-lg hover:bg-black/85",
    className,
  );
  if (href) {
    return (
      <Link href={href} className={classes}>
        {children}
      </Link>
    );
  }
  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}

export interface LuxuryBadgeProps
  extends React.HTMLAttributes<HTMLSpanElement> {
  active?: boolean;
}

export function LuxuryBadge({
  active,
  className,
  ...props
}: LuxuryBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full border border-black/10 bg-white/80 px-4 py-1.5 text-sm font-semibold text-stone-700 transition",
        active
          ? "border-[#111111] bg-[#111111] text-white"
          : "hover:border-[#B48446]",
        className,
      )}
      {...props}
    />
  );
}

export interface LuxuryStepProps
  extends React.HTMLAttributes<HTMLDivElement> {
  step: number | string;
  showConnector?: boolean;
}

export function LuxuryStep({
  step,
  showConnector = false,
  className,
  children,
  ...props
}: LuxuryStepProps) {
  return (
    <div
      className={cn(
        "relative flex h-full flex-col items-center text-center",
        className,
      )}
      {...props}
    >
      {showConnector ? (
        <span className="absolute left-1/2 top-6 hidden h-px w-full bg-black/10 md:block" />
      ) : null}
      <span className="relative z-10 mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#111111] text-sm font-bold text-white">
        {step}
      </span>
      {children}
    </div>
  );
}
