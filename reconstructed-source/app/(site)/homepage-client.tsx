"use client";

import { useEffect, useState } from "react";

import type { ParsedPageSection } from "@/lib/content";
import type { HomepageViewModel } from "@/lib/homepage-view-model";
import { analytics } from "@/lib/zaraz";
import {
  Bestsellers,
  Consult,
  FinalCta,
  Guidance,
  HomepageHeroSection,
  MobileStickyCta,
  ProofBand,
  Research,
  Results,
} from "@/components/homepage/homepage-sections";

export function HomepageClient({
  viewModel,
  sections,
}: {
  viewModel: HomepageViewModel;
  sections?: ParsedPageSection[];
}) {
  const [showStickyCta, setShowStickyCta] = useState(false);
  const handleConsultClick = () => {
    analytics.whatsappClick("homepage_consult");
  };

  useEffect(() => {
    const updateStickyCta = () => {
      setShowStickyCta(
        window.scrollY > Math.min(520, 0.64 * window.innerHeight),
      );
    };
    updateStickyCta();
    window.addEventListener("scroll", updateStickyCta, { passive: true });
    return () => window.removeEventListener("scroll", updateStickyCta);
  }, []);

  const configuredSections = sections || [];

  return (
    <div className="min-h-screen overflow-x-hidden bg-white pb-20 text-[#16191b] md:pb-0">
      {configuredSections.length > 0 ? (
        configuredSections.map((section) => {
          const config = section.parsedConfig || undefined;
          switch (section.sectionType) {
            case "hero":
              return (
                <HomepageHeroSection
                  key={section.id}
                  hero={viewModel.hero}
                  isRtl={viewModel.isRtl}
                  config={config}
                />
              );
            case "social_proof_bar":
              return (
                <ProofBand
                  key={section.id}
                  proof={viewModel.proof}
                  isRtl={viewModel.isRtl}
                  config={config}
                />
              );
            case "testimonials":
            case "reviews":
            case "results":
              return (
                <Results
                  key={section.id}
                  results={viewModel.results}
                  isRtl={viewModel.isRtl}
                  config={config}
                />
              );
            case "featured_products":
              return (
                <Bestsellers
                  key={section.id}
                  bestsellers={viewModel.bestsellers}
                  isRtl={viewModel.isRtl}
                  config={config}
                />
              );
            case "image_story":
            case "ingredients":
            case "education":
              return (
                <Research
                  key={section.id}
                  isRtl={viewModel.isRtl}
                  config={config}
                />
              );
            case "how_it_works":
              return (
                <Guidance
                  key={section.id}
                  guidance={viewModel.guidance}
                  isRtl={viewModel.isRtl}
                  config={config}
                />
              );
            case "cta":
              if (config?.variant === "consult") {
                return (
                  <Consult
                    key={section.id}
                    consult={viewModel.consult}
                    whatsappUrl={viewModel.whatsappUrl}
                    isRtl={viewModel.isRtl}
                    onConsultClick={handleConsultClick}
                    config={config}
                  />
                );
              }
              return (
                <FinalCta
                  key={section.id}
                  finalCta={viewModel.finalCta}
                  isRtl={viewModel.isRtl}
                  config={config}
                />
              );
            default:
              return null;
          }
        })
      ) : (
        <>
          <HomepageHeroSection
            hero={viewModel.hero}
            isRtl={viewModel.isRtl}
          />
          <ProofBand proof={viewModel.proof} isRtl={viewModel.isRtl} />
          <Bestsellers
            bestsellers={viewModel.bestsellers}
            isRtl={viewModel.isRtl}
          />
          <Guidance
            guidance={viewModel.guidance}
            isRtl={viewModel.isRtl}
          />
          <Results results={viewModel.results} isRtl={viewModel.isRtl} />
          <Consult
            consult={viewModel.consult}
            whatsappUrl={viewModel.whatsappUrl}
            isRtl={viewModel.isRtl}
            onConsultClick={handleConsultClick}
          />
          <FinalCta
            finalCta={viewModel.finalCta}
            isRtl={viewModel.isRtl}
          />
        </>
      )}

      {showStickyCta && (
        <MobileStickyCta
          hero={viewModel.hero}
          consult={viewModel.consult}
          whatsappUrl={viewModel.whatsappUrl}
          isRtl={viewModel.isRtl}
          onConsultClick={handleConsultClick}
        />
      )}
    </div>
  );
}
