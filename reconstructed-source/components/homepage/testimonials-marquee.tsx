"use client";

import { Star } from "lucide-react";

import type { HomepageTestimonialCardViewModel } from "@/lib/homepage-view-model";
import { cn } from "@/lib/utils";

export function TestimonialsMarquee({
  testimonials,
  isRtl = false,
}: {
  testimonials: HomepageTestimonialCardViewModel[];
  isRtl?: boolean;
}) {
  if (!testimonials.length) return null;
  const repeated = [...testimonials, ...testimonials];

  return (
    <div className="overflow-hidden">
      <div
        className={cn(
          "flex min-w-max gap-3 motion-safe:animate-marquee",
          isRtl && "flex-row-reverse",
        )}
      >
        {repeated.map((testimonial, index) => (
          <article
            key={`${testimonial.name}-${index}`}
            className={cn(
              "w-[290px] shrink-0 rounded-lg border border-[#e2e7e4] bg-white p-4 shadow-sm",
              isRtl && "text-right",
            )}
          >
            <div
              className={cn(
                "flex gap-1 text-[#f5b742]",
                isRtl && "flex-row-reverse",
              )}
            >
              {Array.from({ length: testimonial.rating || 5 }).map(
                (_, star) => (
                  <Star key={star} className="h-3.5 w-3.5 fill-current" />
                ),
              )}
            </div>
            <p
              className={cn(
                "mt-3 line-clamp-4 text-sm leading-6 text-[#34413c]",
                isRtl && "font-urdu",
              )}
            >
              “{testimonial.text}”
            </p>
            <div className="mt-4 text-sm font-bold text-[#15191b]">
              {testimonial.name}
            </div>
            <div className="text-xs text-[#87918d]">{testimonial.city}</div>
          </article>
        ))}
      </div>
    </div>
  );
}
