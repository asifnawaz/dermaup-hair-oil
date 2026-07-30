import { readString, readText, SectionHeading, SectionShell } from "./shared";
import type { BaseSectionProps } from "./types";

export function VideoSection({ lang, config }: BaseSectionProps) {
  const source = readString(config?.videoSrc, readString(config?.src));
  return (
    <SectionShell id={readString(config?.sectionId)} tone="dark">
      <SectionHeading
        inverted
        title={readText(config, "headline", lang, "See the routine in action")}
        subtitle={readText(config, "subtitle", lang)}
      />
      {source ? (
        <video
          className="mx-auto mt-8 aspect-video w-full max-w-4xl rounded-2xl bg-black object-cover"
          controls
          playsInline
          poster={readString(config?.poster)}
          preload="metadata"
          src={source}
        />
      ) : null}
    </SectionShell>
  );
}
