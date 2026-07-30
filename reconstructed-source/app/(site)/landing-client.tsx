"use client";

import { useEffect, useMemo, useState } from "react";

import { AdvertFinalCta } from "../../components/landing/advert-final-cta";
import { AdvertStickyBar } from "../../components/landing/advert-sticky-bar";
import { AdvertUrgencyBanner } from "../../components/landing/advert-urgency-banner";
import { ArticleBodySection } from "../../components/landing/article-body-section";
import { BeforeAfterSection } from "../../components/landing/before-after-section";
import { BenefitsSection } from "../../components/landing/benefits-section";
import { CheckoutForm } from "../../components/landing/checkout-form";
import { ClinicalStatsSection } from "../../components/landing/clinical-stats-section";
import { ComparisonSection } from "../../components/landing/comparison-section";
import { CrossSellSection } from "../../components/landing/cross-sell-section";
import { FaqSection } from "../../components/landing/faq-section";
import { FeaturedCategoriesSection } from "../../components/landing/featured-categories-section";
import { FeaturedProductsSection } from "../../components/landing/featured-products-section";
import { FinalCtaSection } from "../../components/landing/final-cta-section";
import { GuaranteeSection } from "../../components/landing/guarantee-section";
import { HeroSection } from "../../components/landing/hero-section";
import { ImageStorySection } from "../../components/landing/image-story-section";
import { IngredientsSection } from "../../components/landing/ingredients-section";
import { LpCta } from "../../components/landing/lp-cta";
import { LpEducation } from "../../components/landing/lp-education";
import { LpFaq } from "../../components/landing/lp-faq";
import { LpHero } from "../../components/landing/lp-hero";
import { LpHowItWorks } from "../../components/landing/lp-how-it-works";
import { LpResults } from "../../components/landing/lp-results";
import { LpReviews } from "../../components/landing/lp-reviews";
import { PolicyContentSection } from "../../components/landing/policy-content-section";
import { PricingSection } from "../../components/landing/pricing-section";
import { ProblemSection } from "../../components/landing/problem-section";
import { ProductHeroSection } from "../../components/landing/product-hero-section";
import { PromoBanner } from "../../components/landing/promo-banner";
import { RelatedProductsSection } from "../../components/landing/related-products-section";
import { ResultsTimelineSection } from "../../components/landing/results-timeline-section";
import { SocialProofBar } from "../../components/landing/social-proof-bar";
import { SolutionSection } from "../../components/landing/solution-section";
import { StickyAddBar } from "../../components/landing/sticky-add-bar";
import { TestimonialsSection } from "../../components/landing/testimonials-section";
import type { LandingClientProps } from "../../components/landing/types";
import { VideoSection } from "../../components/landing/video-section";
import { getPublicProductPackageEntries } from "../../lib/content";
import { analytics, trackScrollDepth, trackTimeOnPage } from "../../lib/zaraz";

function blocksOfType(
  blocks: LandingClientProps["contentBlocks"],
  type: string,
) {
  return (blocks || []).filter((block) => block.type === type);
}

function configText(
  config: Record<string, unknown> | null | undefined,
  key: string,
): string | undefined {
  const value = config?.[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

function configBoolean(
  config: Record<string, unknown> | null | undefined,
  key: string,
  fallback: boolean,
): boolean {
  const value = config?.[key];
  if (typeof value === "boolean") return value;
  if (typeof value === "string") {
    if (["true", "1", "yes", "on"].includes(value.trim().toLowerCase())) return true;
    if (["false", "0", "no", "off"].includes(value.trim().toLowerCase())) return false;
  }
  return fallback;
}

export default function LandingClient({
  lang,
  pageSlug,
  pageType,
  sections,
  product,
  contentBlocks = [],
  siteSettings = {},
  allProducts = [],
}: LandingClientProps) {
  const packages = product?.parsedData.packages || {};
  const packageEntries = useMemo(
    () => getPublicProductPackageEntries(packages),
    [packages],
  );
  const heroConfig = sections.find(
    (section) => section.sectionType === "product_hero",
  )?.parsedConfig;
  const simplePackage = configText(heroConfig, "simplePackageType") || "single";
  const initialPackage =
    packageEntries.find(([id]) => id === simplePackage)?.[0] ||
    packageEntries.find(([, item]) => item.popular)?.[0] ||
    packageEntries[0]?.[0] ||
    "single";
  const [selectedPackage, setSelectedPackage] = useState(initialPackage);
  const isAdvertorial = pageType === "advertorial";

  useEffect(() => {
    setSelectedPackage(initialPackage);
  }, [initialPackage]);

  useEffect(() => {
    analytics.pageView(pageSlug || "landing", lang);
    const stopScroll = trackScrollDepth();
    const stopTime = trackTimeOnPage();
    return () => {
      stopScroll?.();
      stopTime?.();
    };
  }, [lang, pageSlug]);

  useEffect(() => {
    if (!isAdvertorial) return;
    document.body.classList.add("advertorial-mode");
    return () => document.body.classList.remove("advertorial-mode");
  }, [isAdvertorial]);

  if (!sections.length) return null;

  const testimonialBlocks = blocksOfType(contentBlocks, "testimonial");
  const activePackage =
    packages[selectedPackage] || packageEntries[0]?.[1];
  const stickyEnabled = configBoolean(heroConfig, "stickyAddBar", true);
  const stickyMobileOnly = configBoolean(
    heroConfig,
    "stickyAddBarMobileOnly",
    false,
  );

  return (
    <>
      {sections.map((section) => {
        const config = section.parsedConfig;
        const lpVariant = configText(config, "variant") === "lp";
        const key = section.id;

        switch (section.sectionType) {
          case "promo_banner":
            return <PromoBanner config={config} key={key} lang={lang} />;
          case "hero":
            return lpVariant ? (
              <LpHero config={config} key={key} lang={lang} />
            ) : (
              <HeroSection config={config} key={key} lang={lang} />
            );
          case "problem":
            return <ProblemSection config={config} key={key} lang={lang} />;
          case "solution":
            return <SolutionSection config={config} key={key} lang={lang} />;
          case "ingredients":
            return (
              <IngredientsSection
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "ingredient")}
                key={key}
                lang={lang}
              />
            );
          case "testimonials":
            return (
              <TestimonialsSection
                config={config}
                contentBlocks={testimonialBlocks}
                key={key}
                lang={lang}
              />
            );
          case "pricing":
            return (
              <PricingSection
                config={config}
                key={key}
                lang={lang}
                onSelectPackage={setSelectedPackage}
                packages={packages}
                selectedPackage={selectedPackage}
              />
            );
          case "faq":
            return lpVariant ? (
              <LpFaq
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "faq")}
                key={key}
                lang={lang}
              />
            ) : (
              <FaqSection
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "faq")}
                key={key}
                lang={lang}
              />
            );
          case "checkout":
            return (
              <CheckoutForm
                config={config}
                key={key}
                lang={lang}
                onPackageChange={setSelectedPackage}
                packages={packages}
                productId={product?.id}
                selectedPackage={selectedPackage}
                siteSettings={siteSettings}
              />
            );
          case "cta":
            return lpVariant ? (
              <LpCta config={config} key={key} lang={lang} />
            ) : (
              <FinalCtaSection config={config} key={key} lang={lang} />
            );
          case "how_it_works":
            return (
              <LpHowItWorks
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "how_to_use")}
                key={key}
                lang={lang}
              />
            );
          case "education":
            return (
              <LpEducation
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "education")}
                key={key}
                lang={lang}
              />
            );
          case "results":
            return (
              <LpResults
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "result")}
                key={key}
                lang={lang}
              />
            );
          case "reviews":
            return (
              <LpReviews
                config={config}
                contentBlocks={testimonialBlocks}
                key={key}
                lang={lang}
              />
            );
          case "before_after":
            return <BeforeAfterSection config={config} key={key} lang={lang} />;
          case "benefits":
            return (
              <BenefitsSection
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "benefit")}
                key={key}
                lang={lang}
              />
            );
          case "social_proof_bar":
            return (
              <SocialProofBar
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "social_proof")}
                key={key}
                lang={lang}
              />
            );
          case "video":
            return <VideoSection config={config} key={key} lang={lang} />;
          case "comparison":
            return (
              <ComparisonSection
                config={config}
                contentBlocks={blocksOfType(contentBlocks, "comparison")}
                key={key}
                lang={lang}
              />
            );
          case "image_story":
            return (
              <ImageStorySection
                allProducts={allProducts}
                config={config}
                contentBlocks={contentBlocks}
                key={key}
                lang={lang}
                product={product}
              />
            );
          case "clinical_stats":
            return <ClinicalStatsSection config={config} key={key} lang={lang} />;
          case "featured_products":
            return (
              <FeaturedProductsSection
                config={config}
                key={key}
                lang={lang}
                products={allProducts}
              />
            );
          case "featured_categories":
            return (
              <FeaturedCategoriesSection
                config={config}
                key={key}
                lang={lang}
                products={allProducts}
              />
            );
          case "product_hero": {
            if (!product) return null;
            const average =
              testimonialBlocks.length > 0
                ? (
                    testimonialBlocks.reduce(
                      (total, block) =>
                        total + (Number(block.parsedData.rating) || 5),
                      0,
                    ) / testimonialBlocks.length
                  ).toFixed(1)
                : undefined;
            return (
              <ProductHeroSection
                allProducts={allProducts}
                avgRating={average}
                config={config}
                contentBlocks={contentBlocks}
                key={key}
                lang={lang}
                onSelectPackage={setSelectedPackage}
                product={product}
                selectedPackage={selectedPackage}
                testimonialCount={testimonialBlocks.length}
              />
            );
          }
          case "guarantee":
            return <GuaranteeSection config={config} key={key} lang={lang} />;
          case "results_timeline":
            return <ResultsTimelineSection config={config} key={key} lang={lang} />;
          case "related_products":
            return (
              <RelatedProductsSection
                config={config}
                currentCategory={product?.category || undefined}
                currentProductId={product?.id}
                key={key}
                lang={lang}
                products={allProducts}
              />
            );
          case "cross_sell":
            return (
              <CrossSellSection
                config={config}
                currentCategory={product?.category || undefined}
                currentProductId={product?.id}
                key={key}
                lang={lang}
                products={allProducts}
              />
            );
          case "policy_content":
            return <PolicyContentSection config={config} key={key} lang={lang} />;
          case "article_body":
            return <ArticleBodySection config={config} key={key} lang={lang} />;
          case "advert_urgency_banner":
            return <AdvertUrgencyBanner config={config} key={key} lang={lang} />;
          case "advert_final_cta":
            return <AdvertFinalCta config={config} key={key} lang={lang} />;
          default:
            return null;
        }
      })}
      {isAdvertorial && product ? (
        <AdvertStickyBar
          lang={lang}
          productHref={`/products/${product.slug}`}
          productName={product.name}
          productNameUr={product.nameUr || undefined}
        />
      ) : null}
      {!isAdvertorial && stickyEnabled && product && activePackage ? (
        <StickyAddBar
          buttonText={
            lang === "ur"
              ? configText(heroConfig, "stickyAddBarButtonTextUr")
              : configText(heroConfig, "stickyAddBarButtonText")
          }
          guaranteeText={
            lang === "ur"
              ? configText(heroConfig, "stickyAddBarGuaranteeTextUr")
              : configText(heroConfig, "stickyAddBarGuaranteeText")
          }
          lang={lang}
          mobileOnly={stickyMobileOnly}
          product={{
            productId: product.id,
            productSlug: product.slug,
            productName: product.name,
            productNameUr: product.nameUr || undefined,
            productImage: product.imageUrl || undefined,
            packageType: selectedPackage,
            packageName: activePackage.name,
            packageNameUr: activePackage.nameUr,
            isPreorder: product.parsedData.preorderEnabled === true,
            preorderNote: configText(product.parsedData, "preorderNote"),
            preorderNoteUr: configText(product.parsedData, "preorderNoteUr"),
            price: Number(activePackage.price),
            originalPrice: Number(
              activePackage.originalPrice || activePackage.price,
            ),
            bottles: Number(activePackage.bottles || 1),
            freeDelivery: configBoolean(heroConfig, "stickyAddBarFreeDelivery", Boolean(activePackage.freeDelivery)),
          }}
        />
      ) : null}
    </>
  );
}
