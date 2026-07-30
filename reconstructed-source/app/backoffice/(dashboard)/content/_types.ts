export type ProductData = {
  volume?: string;
  description?: string;
  descriptionUr?: string;
  preorderEnabled?: boolean;
  preorderNote?: string;
  preorderNoteUr?: string;
  packages?: Record<string, ProductPackage>;
  [key: string]: unknown;
};

export type ProductPackage = {
  id: string;
  name: string;
  nameUr?: string;
  bottles: number;
  volume: string;
  supply: string;
  supplyUr?: string;
  price: number;
  originalPrice: number;
  savings: number;
  freeDelivery: boolean;
  popular?: boolean;
  stock?: number | null;
};

export type ProductRecord = {
  id: string;
  slug: string;
  name: string;
  nameUr?: string | null;
  sku?: string | null;
  data?: string | null;
  parsedData?: ProductData;
  active: boolean;
  sortOrder?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type ContentBlockRecord = {
  id: string;
  type: string;
  slug: string;
  productId?: string | null;
  data?: string | null;
  parsedData?: Record<string, unknown>;
  active: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PageSectionRecord = {
  id: string;
  pageId: string;
  sectionType: string;
  sortOrder: number;
  active: boolean;
  config?: string | null;
  parsedConfig?: Record<string, unknown>;
};

export type PageRecord = {
  id: string;
  slug: string;
  productId?: string | null;
  title: string;
  meta?: string | null;
  parsedMeta?: {
    description?: string;
    keywords?: string;
    [key: string]: unknown;
  };
  active: boolean;
  sections?: PageSectionRecord[];
  createdAt?: string;
  updatedAt?: string;
};
