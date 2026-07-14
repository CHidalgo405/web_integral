export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  images: string[];
  category: string;
  categoryId: string;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  stockQuantity: number;
  variants?: ProductVariant[];
  tags?: string[];
}

export interface ProductVariant {
  id: string;
  type: string; // 'size', 'color', 'weight', etc.
  label: string;
  value: string;
  priceModifier?: number;
  inStock: boolean;
}

export interface ProductCategory {
  id: string;
  name: string;
  icon: string;
  imageUrl: string;
  productCount: number;
}

export interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  rating: number;
  comment: string;
  date: Date;
  updatedAt: Date;
  verifiedPurchase: boolean;
  isMine: boolean;
  images?: string[];
}

export interface ReviewSummary {
  average: number;
  total: number;
  distribution: Record<1 | 2 | 3 | 4 | 5, number>;
}

export type ReviewEligibilityReason =
  | 'already_reviewed'
  | 'purchase_required'
  | 'customer_only'
  | 'product_not_found'
  | null;

export interface ReviewEligibility {
  canReview: boolean;
  reason: ReviewEligibilityReason;
  reviewId?: string;
}

export interface ProductReviewsResult {
  reviews: ProductReview[];
  summary: ReviewSummary;
  eligibility: ReviewEligibility;
}

export interface ReviewInput {
  rating: number;
  comment: string;
}

export interface SearchFilters {
  query: string;
  categoryId?: string;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
