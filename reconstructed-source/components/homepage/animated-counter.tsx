"use client";

import { useEffect, useRef, useState } from "react";

export function AnimatedCounter({
  value,
  duration = 900,
  suffix = "",
}: {
  value: number;
  duration?: number;
  suffix?: string;
}) {
  const [displayValue, setDisplayValue] = useState(0);
  const frame = useRef<number | null>(null);

  useEffect(() => {
    const startedAt = performance.now();
    const update = (now: number) => {
      const progress = Math.min(1, (now - startedAt) / duration);
      setDisplayValue(Math.round(value * (1 - (1 - progress) ** 3)));
      if (progress < 1) frame.current = requestAnimationFrame(update);
    };
    frame.current = requestAnimationFrame(update);
    return () => {
      if (frame.current !== null) cancelAnimationFrame(frame.current);
    };
  }, [duration, value]);

  return (
    <span>
      {displayValue.toLocaleString("en-PK")}
      {suffix}
    </span>
  );
}
