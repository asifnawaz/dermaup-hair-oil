export type SectionCatalogItem = {
  type: string;
  label: string;
  description: string;
  category: 'content' | 'social' | 'commerce' | 'media' | 'utility';
};

export const SECTION_CATALOG: SectionCatalogItem[] = [
  {
    type: 'promo_banner',
    label: 'Promo Banner',
    description: 'Top banner with editable promotional copy',
    category: 'utility',
  },
  {
    type: 'hero',
    label: 'Hero',
    description: 'Main headline, subheadline & CTA button',
    category: 'content',
  },
  {
    type: 'problem',
    label: 'Problem',
    description: 'Addresses customer pain points',
    category: 'content',
  },
  {
    type: 'solution',
    label: 'Solution',
    description: 'Presents the product as the answer',
    category: 'content',
  },
  {
    type: 'ingredients',
    label: 'Ingredients',
    description: 'Showcases key ingredients with benefits',
    category: 'content',
  },
  {
    type: 'testimonials',
    label: 'Testimonials',
    description: 'Customer reviews & social proof',
    category: 'social',
  },
  {
    type: 'pricing',
    label: 'Pricing',
    description: 'Package options with pricing cards',
    category: 'commerce',
  },
  {
    type: 'faq',
    label: 'FAQ',
    description: 'Frequently asked questions accordion',
    category: 'content',
  },
  {
    type: 'checkout',
    label: 'Checkout',
    description: 'Order form with delivery & payment',
    category: 'commerce',
  },
  {
    type: 'cta',
    label: 'Call to Action',
    description: 'CTA button with supporting copy',
    category: 'commerce',
  },
  {
    type: 'how_it_works',
    label: 'How It Works',
    description: 'Step-by-step usage instructions',
    category: 'content',
  },
  {
    type: 'education',
    label: 'Education',
    description: 'Educational content about the category or concern',
    category: 'content',
  },
  {
    type: 'results',
    label: 'Results',
    description: 'Before/after results & statistics',
    category: 'social',
  },
  {
    type: 'reviews',
    label: 'Reviews',
    description: 'Extended review section with ratings',
    category: 'social',
  },
  {
    type: 'exit_intent',
    label: 'Exit Intent Popup',
    description: 'Popup shown when user tries to leave',
    category: 'utility',
  },
  {
    type: 'before_after',
    label: 'Before / After',
    description: 'Before/after transformation gallery',
    category: 'social',
  },
  {
    type: 'benefits',
    label: 'Benefits',
    description: 'Product benefits with icons',
    category: 'content',
  },
  {
    type: 'social_proof_bar',
    label: 'Social Proof Bar',
    description: 'Trust badges & social proof metrics',
    category: 'social',
  },
  {
    type: 'video',
    label: 'Video',
    description: 'Embedded video section',
    category: 'media',
  },
  {
    type: 'comparison',
    label: 'Comparison',
    description: 'Product comparison table',
    category: 'content',
  },
  {
    type: 'image_story',
    label: 'Image Story',
    description: 'Visual storytelling with editable image blocks',
    category: 'media',
  },
  {
    type: 'clinical_stats',
    label: 'Clinical Stats',
    description: 'Science proof card with stats and expert quote',
    category: 'social',
  },
  {
    type: 'product_hero',
    label: 'Product Hero',
    description: 'Product image, name, pricing & add to cart',
    category: 'commerce',
  },
  {
    type: 'guarantee',
    label: 'Guarantee',
    description: 'Money-back guarantee with trust badges',
    category: 'commerce',
  },
  {
    type: 'results_timeline',
    label: 'Results Timeline',
    description: 'Expected results over time with milestones',
    category: 'social',
  },
  {
    type: 'related_products',
    label: 'Related Products',
    description: 'Products from the same category',
    category: 'commerce',
  },
  {
    type: 'cross_sell',
    label: 'Cross-Sell',
    description: 'Complete your routine with a complementary category',
    category: 'commerce',
  },
  {
    type: 'policy_content',
    label: 'Policy Content',
    description: 'Rich policy page content (Delivery/Returns/Terms etc.)',
    category: 'content',
  },
  {
    type: 'article_body',
    label: 'Article Body',
    description: 'Advertorial article with author, content & CTA',
    category: 'content',
  },
  {
    type: 'advert_urgency_banner',
    label: 'Advert Urgency Banner',
    description: 'Advertorial banner for stock or campaign messaging',
    category: 'utility',
  },
  {
    type: 'advert_final_cta',
    label: 'Advert Final CTA',
    description: 'Final CTA with trust badges & disclaimer',
    category: 'commerce',
  },
];

export function getSectionLabel(type: string) {
  return (
    SECTION_CATALOG.find((item) => item.type === type)?.label ||
    type.replaceAll('_', ' ')
  );
}
