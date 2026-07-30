/**
 * RECONSTRUCTED SOURCE
 *
 * Recovered from the content-block editor client chunk in the latest deployed
 * Cloudflare Worker and cross-checked against the surviving source index.
 */

export type FieldDef = {
  key: string;
  label: string;
  placeholder?: string;
  type?: 'number';
  multiline?: boolean;
  richtext?: boolean;
};

export function getFieldsForType(type: string): FieldDef[] {
  switch (type) {
    case 'testimonial':
      return [
        { key: 'name', label: 'Name (EN)', placeholder: 'Ahmad K.' },
        { key: 'nameUr', label: 'Name (UR)', placeholder: 'احمد ک۔' },
        { key: 'city', label: 'City (EN)', placeholder: 'Karachi' },
        { key: 'cityUr', label: 'City (UR)', placeholder: 'کراچی' },
        { key: 'age', label: 'Age', placeholder: '32', type: 'number' },
        {
          key: 'rating',
          label: 'Rating (1-5)',
          placeholder: '5',
          type: 'number',
        },
        { key: 'textEn', label: 'Testimonial (EN)', multiline: true },
        { key: 'textUr', label: 'Testimonial (UR)', multiline: true },
      ];
    case 'faq':
      return [
        { key: 'questionEn', label: 'Question (EN)', multiline: true },
        { key: 'questionUr', label: 'Question (UR)', multiline: true },
        {
          key: 'answerEn',
          label: 'Answer (EN)',
          multiline: true,
          richtext: true,
        },
        {
          key: 'answerUr',
          label: 'Answer (UR)',
          multiline: true,
          richtext: true,
        },
      ];
    case 'ingredient':
      return [
        { key: 'name', label: 'Name (EN)', placeholder: 'Caffeine' },
        { key: 'nameUr', label: 'Name (UR)', placeholder: 'کیفین' },
        {
          key: 'benefit',
          label: 'Benefit (EN)',
          placeholder: 'Stimulates hair follicles',
        },
        { key: 'benefitUr', label: 'Benefit (UR)' },
        {
          key: 'description',
          label: 'Description (EN)',
          multiline: true,
          richtext: true,
        },
        {
          key: 'descriptionUr',
          label: 'Description (UR)',
          multiline: true,
          richtext: true,
        },
        { key: 'evidenceNote', label: 'Evidence Note (EN)', multiline: true },
        {
          key: 'evidenceNoteUr',
          label: 'Evidence Note (UR)',
          multiline: true,
        },
        {
          key: 'sourceTitle',
          label: 'Source Title (EN)',
          placeholder: 'PubMed: ingredient reference',
        },
        { key: 'sourceTitleUr', label: 'Source Title (UR)' },
        {
          key: 'sourceUrl',
          label: 'Source URL',
          placeholder: 'https://pubmed.ncbi.nlm.nih.gov/...',
        },
        { key: 'icon', label: 'Icon', placeholder: 'shield' },
      ];
    case 'before_after':
      return [
        {
          key: 'customerName',
          label: 'Customer Name (EN)',
          placeholder: 'Ali M.',
        },
        { key: 'customerNameUr', label: 'Customer Name (UR)' },
        {
          key: 'beforeImage',
          label: 'Before Image URL',
          placeholder: '/images/before-1.jpg',
        },
        {
          key: 'afterImage',
          label: 'After Image URL',
          placeholder: '/images/after-1.jpg',
        },
        {
          key: 'timeframe',
          label: 'Timeframe (EN)',
          placeholder: '3 months',
        },
        {
          key: 'timeframeUr',
          label: 'Timeframe (UR)',
          placeholder: '3 ماہ',
        },
        {
          key: 'description',
          label: 'Description (EN)',
          multiline: true,
          richtext: true,
        },
        {
          key: 'descriptionUr',
          label: 'Description (UR)',
          multiline: true,
          richtext: true,
        },
      ];
    case 'benefit':
      return [
        {
          key: 'title',
          label: 'Title (EN)',
          placeholder: 'Reduces Hair Fall',
        },
        { key: 'titleUr', label: 'Title (UR)' },
        {
          key: 'description',
          label: 'Description (EN)',
          multiline: true,
          richtext: true,
        },
        {
          key: 'descriptionUr',
          label: 'Description (UR)',
          multiline: true,
          richtext: true,
        },
        { key: 'icon', label: 'Icon', placeholder: 'shield' },
      ];
    case 'how_to_use':
      return [
        {
          key: 'step',
          label: 'Step Title (EN)',
          placeholder: 'Apply to scalp',
        },
        { key: 'stepUr', label: 'Step Title (UR)' },
        {
          key: 'description',
          label: 'Instructions (EN)',
          multiline: true,
          richtext: true,
        },
        {
          key: 'descriptionUr',
          label: 'Instructions (UR)',
          multiline: true,
          richtext: true,
        },
        { key: 'icon', label: 'Icon', placeholder: 'droplet' },
        {
          key: 'order',
          label: 'Step Number',
          placeholder: '1',
          type: 'number',
        },
      ];
    case 'social_proof':
      return [
        {
          key: 'platform',
          label: 'Platform',
          placeholder: 'Google Reviews',
        },
        { key: 'metric', label: 'Metric (EN)', placeholder: '4.8★ Rating' },
        { key: 'metricUr', label: 'Metric (UR)' },
        { key: 'value', label: 'Value (EN)', placeholder: '10,000+' },
        { key: 'valueUr', label: 'Value (UR)' },
        { key: 'icon', label: 'Icon', placeholder: 'star' },
      ];
    case 'comparison':
      return [
        {
          key: 'featureEn',
          label: 'Feature (EN)',
          placeholder: 'Clinically Tested',
        },
        { key: 'featureUr', label: 'Feature (UR)' },
        { key: 'us', label: 'Us (true/false)', placeholder: 'true' },
        {
          key: 'others',
          label: 'Others (true/false)',
          placeholder: 'false',
        },
      ];
    case 'result':
      return [
        { key: 'name', label: 'Customer Name', placeholder: 'Imran' },
        { key: 'age', label: 'Age', placeholder: '34', type: 'number' },
        {
          key: 'timeline',
          label: 'Timeline (EN)',
          placeholder: '4 months',
        },
        {
          key: 'timelineUr',
          label: 'Timeline (UR)',
          placeholder: '4 ماہ',
        },
        {
          key: 'area',
          label: 'Treatment Area (EN)',
          placeholder: 'Crown/Vertex',
        },
        { key: 'areaUr', label: 'Treatment Area (UR)' },
        { key: 'quote', label: 'Quote (EN)', multiline: true },
        { key: 'quoteUr', label: 'Quote (UR)', multiline: true },
      ];
    case 'education':
      return [
        {
          key: 'labelEn',
          label: 'Label (EN)',
          placeholder: 'DHT Blocking',
        },
        { key: 'labelUr', label: 'Label (UR)' },
        { key: 'icon', label: 'Icon', placeholder: 'shield' },
        {
          key: 'descriptionEn',
          label: 'Description (EN)',
          multiline: true,
          richtext: true,
        },
        {
          key: 'descriptionUr',
          label: 'Description (UR)',
          multiline: true,
          richtext: true,
        },
      ];
    case 'inside_out_support':
      return [
        {
          key: 'sectionLabel',
          label: 'Section Label (EN)',
          placeholder: 'Routine Support',
        },
        { key: 'sectionLabelUr', label: 'Section Label (UR)' },
        { key: 'headline', label: 'Heading (EN)', multiline: true },
        { key: 'headlineUr', label: 'Heading (UR)', multiline: true },
        {
          key: 'subtitle',
          label: 'Paragraph (EN)',
          multiline: true,
          richtext: true,
        },
        {
          key: 'subtitleUr',
          label: 'Paragraph (UR)',
          multiline: true,
          richtext: true,
        },
        { key: 'item1Title', label: 'Tip 1 (EN)' },
        { key: 'item1TitleUr', label: 'Tip 1 (UR)' },
        { key: 'item2Title', label: 'Tip 2 (EN)' },
        { key: 'item2TitleUr', label: 'Tip 2 (UR)' },
        { key: 'item3Title', label: 'Tip 3 (EN)' },
        { key: 'item3TitleUr', label: 'Tip 3 (UR)' },
        { key: 'item4Title', label: 'Tip 4 (EN)' },
        { key: 'item4TitleUr', label: 'Tip 4 (UR)' },
        { key: 'item5Title', label: 'Tip 5 (EN)' },
        { key: 'item5TitleUr', label: 'Tip 5 (UR)' },
        { key: 'closingText', label: 'Closing Line (EN)', multiline: true },
        {
          key: 'closingTextUr',
          label: 'Closing Line (UR)',
          multiline: true,
        },
        {
          key: 'disclaimerText',
          label: 'Diet/Safety Disclaimer (EN)',
          multiline: true,
        },
        {
          key: 'disclaimerTextUr',
          label: 'Diet/Safety Disclaimer (UR)',
          multiline: true,
        },
      ];
    case 'expert_review':
      return [
        {
          key: 'name',
          label: 'Expert Name (EN)',
          placeholder: 'Dr Khurram Mushir',
        },
        { key: 'nameUr', label: 'Expert Name (UR)' },
        {
          key: 'role',
          label: 'Role (EN)',
          placeholder: 'Board certified dermatologist',
        },
        { key: 'roleUr', label: 'Role (UR)' },
        { key: 'quote', label: 'Review Quote (EN)', multiline: true },
        { key: 'quoteUr', label: 'Review Quote (UR)', multiline: true },
        {
          key: 'image',
          label: 'Expert Image',
          placeholder: '/dermatologists/dr-khurram-mushir.png',
        },
        { key: 'imageAlt', label: 'Image Alt Text' },
        {
          key: 'badgeText',
          label: 'Badge Text (EN)',
          placeholder: 'Dermatologist Reviewed',
        },
        { key: 'badgeTextUr', label: 'Badge Text (UR)' },
        {
          key: 'productFocus',
          label: 'Product/Brand Focus (EN)',
          multiline: true,
        },
        {
          key: 'productFocusUr',
          label: 'Product/Brand Focus (UR)',
          multiline: true,
        },
      ];
    default:
      return [];
  }
}
