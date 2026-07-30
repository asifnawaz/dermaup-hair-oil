/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the page-section editor client chunk in the latest deployed
 * Cloudflare Worker and cross-checked against the surviving source index.
 */

import {
  getFieldsForSectionType,
  type FieldDef,
} from './section-fields';

export type PageSectionIconKey =
  | 'layout'
  | 'messageSquare'
  | 'shoppingCart'
  | 'playCircle'
  | 'wrench'
  | 'megaphone'
  | 'sparkles'
  | 'helpCircle'
  | 'zap'
  | 'leaf'
  | 'star'
  | 'barChart3'
  | 'video'
  | 'image'
  | 'arrowLeftRight'
  | 'shield'
  | 'bookOpen'
  | 'listOrdered';

export type PageSectionCategoryKey =
  | 'content'
  | 'social_proof'
  | 'commerce'
  | 'media'
  | 'utility';

export type PageSectionMeta = {
  label: string;
  description: string;
  icon: PageSectionIconKey;
  category: PageSectionCategoryKey;
};

export const SECTION_META: Record<string, PageSectionMeta> = {
  promo_banner: {
    label: 'Promo Banner',
    description: 'Top banner with editable promotional copy',
    icon: 'megaphone',
    category: 'utility',
  },
  hero: {
    label: 'Hero',
    description: 'Main headline, subheadline & CTA button',
    icon: 'sparkles',
    category: 'content',
  },
  problem: {
    label: 'Problem',
    description: 'Addresses customer pain points',
    icon: 'helpCircle',
    category: 'content',
  },
  solution: {
    label: 'Solution',
    description: 'Presents the product as the answer',
    icon: 'zap',
    category: 'content',
  },
  ingredients: {
    label: 'Ingredients',
    description: 'Showcases key ingredients with benefits',
    icon: 'leaf',
    category: 'utility',
  },
  testimonials: {
    label: 'Testimonials',
    description: 'Customer reviews & social proof',
    icon: 'messageSquare',
    category: 'social_proof',
  },
  pricing: {
    label: 'Pricing',
    description: 'Package options with pricing cards',
    icon: 'shoppingCart',
    category: 'commerce',
  },
  faq: {
    label: 'FAQ',
    description: 'Frequently asked questions accordion',
    icon: 'helpCircle',
    category: 'utility',
  },
  checkout: {
    label: 'Checkout',
    description: 'Order form with delivery & payment',
    icon: 'shoppingCart',
    category: 'commerce',
  },
  cta: {
    label: 'Call to Action',
    description: 'CTA button with supporting copy',
    icon: 'megaphone',
    category: 'commerce',
  },
  how_it_works: {
    label: 'How It Works',
    description: 'Step-by-step usage instructions',
    icon: 'listOrdered',
    category: 'content',
  },
  education: {
    label: 'Education',
    description: 'Educational content about the category or concern',
    icon: 'bookOpen',
    category: 'content',
  },
  results: {
    label: 'Results',
    description: 'Before/after results & statistics',
    icon: 'barChart3',
    category: 'social_proof',
  },
  reviews: {
    label: 'Reviews',
    description: 'Extended review section with ratings',
    icon: 'star',
    category: 'social_proof',
  },
  exit_intent: {
    label: 'Exit Intent Popup',
    description: 'Popup shown when user tries to leave',
    icon: 'shield',
    category: 'utility',
  },
  before_after: {
    label: 'Before / After',
    description: 'Before/after transformation gallery',
    icon: 'arrowLeftRight',
    category: 'social_proof',
  },
  benefits: {
    label: 'Benefits',
    description: 'Product benefits with icons',
    icon: 'zap',
    category: 'utility',
  },
  social_proof_bar: {
    label: 'Social Proof Bar',
    description: 'Trust badges & social proof metrics',
    icon: 'shield',
    category: 'social_proof',
  },
  video: {
    label: 'Video',
    description: 'Embedded video section',
    icon: 'video',
    category: 'media',
  },
  comparison: {
    label: 'Comparison',
    description: 'Product comparison table',
    icon: 'arrowLeftRight',
    category: 'media',
  },
  image_story: {
    label: 'Image Story',
    description: 'Visual storytelling with editable image blocks',
    icon: 'image',
    category: 'media',
  },
  clinical_stats: {
    label: 'Clinical Stats',
    description: 'Science proof card with stats and expert quote',
    icon: 'barChart3',
    category: 'social_proof',
  },
  product_hero: {
    label: 'Product Hero',
    description: 'Product image, name, pricing & add to cart',
    icon: 'shoppingCart',
    category: 'commerce',
  },
  guarantee: {
    label: 'Guarantee',
    description: 'Money-back guarantee with trust badges',
    icon: 'shield',
    category: 'commerce',
  },
  results_timeline: {
    label: 'Results Timeline',
    description: 'Expected results over time with milestones',
    icon: 'barChart3',
    category: 'content',
  },
  related_products: {
    label: 'Related Products',
    description: 'Products from the same category',
    icon: 'layout',
    category: 'commerce',
  },
  cross_sell: {
    label: 'Cross-Sell',
    description: 'Complete your routine with a complementary category',
    icon: 'zap',
    category: 'commerce',
  },
  policy_content: {
    label: 'Policy Content',
    description: 'Rich policy page content (Delivery/Returns/Terms etc.)',
    icon: 'bookOpen',
    category: 'utility',
  },
  article_body: {
    label: 'Article Body',
    description: 'Advertorial article with author, content & CTA',
    icon: 'bookOpen',
    category: 'content',
  },
  advert_urgency_banner: {
    label: 'Advert Urgency Banner',
    description: 'Advertorial banner for stock or campaign messaging',
    icon: 'megaphone',
    category: 'utility',
  },
  advert_final_cta: {
    label: 'Advert Final CTA',
    description: 'Final CTA with trust badges & disclaimer',
    icon: 'zap',
    category: 'commerce',
  },
};

export const SECTION_CATEGORIES: Record<
  PageSectionCategoryKey,
  { label: string; icon: PageSectionIconKey }
> = {
  content: { label: 'Content', icon: 'layout' },
  social_proof: { label: 'Social Proof', icon: 'messageSquare' },
  commerce: { label: 'Commerce', icon: 'shoppingCart' },
  media: { label: 'Media', icon: 'playCircle' },
  utility: { label: 'Utility', icon: 'wrench' },
};

export function getPageSectionDefinition(sectionType: string): {
  meta: PageSectionMeta;
  fields: FieldDef[];
} {
  const meta = SECTION_META[sectionType];

  if (!meta) {
    return {
      meta: {
        label: sectionType,
        description: 'Custom section',
        icon: 'layout',
        category: 'content',
      },
      fields: [],
    };
  }

  return {
    meta,
    fields: getFieldsForSectionType(sectionType),
  };
}
