import Image from "next/image";

import { cn } from "@/lib/utils";

export interface FormulaShowcaseCard {
  title: string;
  body: string;
  imageUrl?: string | null;
}

export function FormulaStorySection({
  eyebrow,
  title,
  body,
  cards,
  isRtl = false,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  cards: FormulaShowcaseCard[];
  isRtl?: boolean;
}) {
  return (
    <section className="bg-[#f2f4f3] py-12 md:py-18">
      <div className="container mx-auto px-4">
        <div className={cn("mx-auto max-w-5xl", isRtl && "text-right")}>
          {eyebrow && (
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-[#6f7b76]">
              {eyebrow}
            </p>
          )}
          <h2
            className={cn(
              "mt-2 max-w-2xl text-3xl font-semibold text-[#171b1d] md:text-5xl",
              isRtl && "ml-auto font-urdu",
            )}
          >
            {title}
          </h2>
          {body && (
            <p
              className={cn(
                "mt-4 max-w-2xl text-sm leading-7 text-[#53615c]",
                isRtl && "ml-auto font-urdu",
              )}
            >
              {body}
            </p>
          )}
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {cards.map((card) => (
              <article
                key={card.title}
                className="overflow-hidden rounded-lg border border-[#dfe6e2] bg-white"
              >
                {card.imageUrl && (
                  <div className="relative aspect-[4/3] bg-[#eef3f0]">
                    <Image
                      src={card.imageUrl}
                      alt={card.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover"
                    />
                  </div>
                )}
                <div className="p-5">
                  <h3
                    className={cn(
                      "text-base font-black text-[#171b1d]",
                      isRtl && "font-urdu",
                    )}
                  >
                    {card.title}
                  </h3>
                  <p
                    className={cn(
                      "mt-2 text-sm leading-6 text-[#596661]",
                      isRtl && "font-urdu",
                    )}
                  >
                    {card.body}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
