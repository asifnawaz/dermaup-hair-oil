import type {
  ParsedContentBlock,
  ParsedPageSection,
  ParsedProduct,
  ProductPackage,
} from "../../lib/content";
import type { Language } from "../../lib/constants";

export type LandingConfig = Record<string, unknown>;

export type BaseSectionProps = {
  lang: Language;
  config?: LandingConfig | null;
};

export type ContentSectionProps = BaseSectionProps & {
  contentBlocks?: ParsedContentBlock[];
};

export type ProductCollectionProps = BaseSectionProps & {
  products: ParsedProduct[];
  currentProductId?: string;
  currentCategory?: string;
};

export type ProductHeroProps = BaseSectionProps & {
  product: ParsedProduct;
  selectedPackage: string;
  onSelectPackage: (packageId: string) => void;
  testimonialCount?: number;
  avgRating?: string;
  contentBlocks?: ParsedContentBlock[];
  allProducts?: ParsedProduct[];
};

export type StickyProduct = {
  productId: string;
  productSlug: string;
  productName: string;
  productNameUr?: string;
  productImage?: string;
  packageType: string;
  packageName?: string;
  packageNameUr?: string;
  price: number;
  originalPrice?: number;
  bottles?: number;
  freeDelivery?: boolean;
  isPreorder?: boolean;
  preorderNote?: string;
  preorderNoteUr?: string;
};

export type LandingClientProps = {
  lang: Language;
  pageSlug: string;
  pageType?: string | null;
  pageTitle?: string | null;
  sections: ParsedPageSection[];
  product?: ParsedProduct | null;
  contentBlocks?: ParsedContentBlock[];
  siteSettings?: Record<string, unknown>;
  allProducts?: ParsedProduct[];
};

export type { Language, ParsedContentBlock, ParsedPageSection, ParsedProduct, ProductPackage };
