import { Injectable, signal, computed } from '@angular/core';
import { Product, ProductCategory, ProductReview, SearchFilters } from '../models/product.model';

const INITIAL_CATEGORIES: ProductCategory[] = [
  { id: 'cat-1', name: 'Frutas y Verduras', icon: 'leaf', imageUrl: '', productCount: 24 },
  { id: 'cat-2', name: 'Lácteos', icon: 'milk', imageUrl: '', productCount: 18 },
  { id: 'cat-3', name: 'Carnes', icon: 'drumstick', imageUrl: '', productCount: 15 },
  { id: 'cat-4', name: 'Panadería', icon: 'bread', imageUrl: '', productCount: 12 },
  { id: 'cat-5', name: 'Bebidas', icon: 'cup-soda', imageUrl: '', productCount: 30 },
  { id: 'cat-6', name: 'Snacks', icon: 'cookie', imageUrl: '', productCount: 22 },
  { id: 'cat-7', name: 'Limpieza', icon: 'brush', imageUrl: '', productCount: 16 },
  { id: 'cat-8', name: 'Cuidado Personal', icon: 'bottle-lotion', imageUrl: '', productCount: 14 },
];

const INITIAL_PRODUCTS: Product[] = [
  {
    id: 'prod-1', name: 'Manzana Roja (kg)', description: 'Manzanas rojas frescas de temporada, ideales para toda la familia.',
    price: 45.90, originalPrice: 54.90, images: ['assets/images/productos/manzanasrojas-Photoroom.png'], category: 'Frutas y Verduras', categoryId: 'cat-1',
    rating: 4.5, reviewCount: 28, inStock: true, stockQuantity: 50, tags: ['oferta', 'fresco'],
  },
  {
    id: 'prod-2', name: 'Leche Entera 1L', description: 'Leche fresca pasteurizada, rica en calcio y vitaminas.',
    price: 28.50, images: ['assets/images/productos/leche-Photoroom.png'], category: 'Lácteos', categoryId: 'cat-2',
    rating: 4.8, reviewCount: 45, inStock: true, stockQuantity: 100,
  },
  {
    id: 'prod-3', name: 'Pechuga de Pollo (kg)', description: 'Pechuga de pollo sin hueso, fresca y de la mejor calidad.',
    price: 129.90, images: ['assets/images/productos/pechuga-Photoroom.png'], category: 'Carnes', categoryId: 'cat-3',
    rating: 4.3, reviewCount: 19, inStock: true, stockQuantity: 30,
    variants: [
      { id: 'v1', type: 'weight', label: 'Peso', value: '500g', priceModifier: -64.95, inStock: true },
      { id: 'v2', type: 'weight', label: 'Peso', value: '1kg', priceModifier: 0, inStock: true },
      { id: 'v3', type: 'weight', label: 'Peso', value: '2kg', priceModifier: 129.90, inStock: false },
    ],
  },
  {
    id: 'prod-4', name: 'Pan Bimbo Grande', description: 'Pan de caja blanco, suave y fresco para toda la familia.',
    price: 62.00, images: ['assets/images/productos/panbimbo-Photoroom.png'], category: 'Panadería', categoryId: 'cat-4',
    rating: 4.1, reviewCount: 33, inStock: true, stockQuantity: 40,
  },
  {
    id: 'prod-5', name: 'Coca-Cola 2L', description: 'Refresco de cola, perfecto para acompañar tus comidas.',
    price: 35.00, originalPrice: 39.00, images: ['assets/images/productos/cocacola-Photoroom.png'], category: 'Bebidas', categoryId: 'cat-5',
    rating: 4.7, reviewCount: 67, inStock: true, stockQuantity: 200,
  },
  {
    id: 'prod-6', name: 'Doritos Nacho 170g', description: 'Totopos de maíz con sabor a nacho, crujientes y deliciosos.',
    price: 48.50, images: ['assets/images/productos/doritos-Photoroom.png'], category: 'Snacks', categoryId: 'cat-6',
    rating: 4.4, reviewCount: 52, inStock: false, stockQuantity: 0,
  },
  {
    id: 'prod-7', name: 'Fabuloso Lavanda 1L', description: 'Limpiador multiusos con aroma a lavanda.',
    price: 32.90, images: ['assets/images/productos/fabuloso-Photoroom.png'], category: 'Limpieza', categoryId: 'cat-7',
    rating: 4.6, reviewCount: 14, inStock: true, stockQuantity: 60,
  },
  {
    id: 'prod-8', name: 'Plátano (kg)', description: 'Plátanos maduros, ricos en potasio y fibra natural.',
    price: 22.90, images: ['assets/images/productos/platano-Photoroom.png'], category: 'Frutas y Verduras', categoryId: 'cat-1',
    rating: 4.2, reviewCount: 31, inStock: true, stockQuantity: 80,
  },
];

@Injectable({ providedIn: 'root' })
export class ProductService {
  private favoriteIds = signal<Set<string>>(new Set());
  readonly favorites = computed(() => this.favoriteIds());

  private categoriesSignal = signal<ProductCategory[]>([]);
  private productsSignal = signal<Product[]>([]);

  // Backward compatible properties using getters
  get mockCategories(): ProductCategory[] {
    return this.categoriesSignal();
  }

  get mockProducts(): Product[] {
    return this.productsSignal();
  }

  readonly mockReviews: ProductReview[] = [
    { id: 'r1', userId: 'u1', userName: 'María López', rating: 5, comment: '¡Excelente calidad! Siempre frescos.', date: new Date('2026-05-01') },
    { id: 'r2', userId: 'u2', userName: 'Juan García', rating: 4, comment: 'Buen producto, llegó rápido.', date: new Date('2026-04-28') },
    { id: 'r3', userId: 'u3', userName: 'Ana Martínez', rating: 5, comment: 'Lo mejor de la tienda, lo recomiendo mucho.', date: new Date('2026-04-25') },
  ];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    const storedProducts = localStorage.getItem('admin_products');
    const storedCategories = localStorage.getItem('admin_categories');

    if (storedProducts) {
      this.productsSignal.set(JSON.parse(storedProducts));
    } else {
      this.productsSignal.set(INITIAL_PRODUCTS);
      this.saveProductsToStorage();
    }

    if (storedCategories) {
      const parsed = JSON.parse(storedCategories);
      // Reset to initial if any category has no icon, an emoji, or non-alphanumeric icon name
      const hasInvalidOrEmojiIcon = parsed.some((c: any) => {
        if (!c.icon) return true;
        const isEmoji = /[\u2600-\u27BF]|[\uD800-\uDBFF][\uDC00-\uDFFF]/.test(c.icon);
        const isLegacyEmoji = !/^[a-zA-Z0-9\-]+$/.test(c.icon);
        return isEmoji || isLegacyEmoji;
      });
      if (hasInvalidOrEmojiIcon) {
        this.categoriesSignal.set(INITIAL_CATEGORIES);
        this.saveCategoriesToStorage();
      } else {
        this.categoriesSignal.set(parsed);
      }
    } else {
      this.categoriesSignal.set(INITIAL_CATEGORIES);
      this.saveCategoriesToStorage();
    }
  }

  private saveProductsToStorage(): void {
    localStorage.setItem('admin_products', JSON.stringify(this.productsSignal()));
  }

  private saveCategoriesToStorage(): void {
    localStorage.setItem('admin_categories', JSON.stringify(this.categoriesSignal()));
  }

  getCategories(): ProductCategory[] {
    return this.categoriesSignal();
  }

  getProducts(): Product[] {
    return this.productsSignal();
  }

  getProductsByCategory(categoryId: string): Product[] {
    return this.productsSignal().filter((p) => p.categoryId === categoryId);
  }

  getProductById(id: string): Product | undefined {
    return this.productsSignal().find((p) => p.id === id);
  }

  searchProducts(filters: SearchFilters): Product[] {
    let results = [...this.productsSignal()];

    if (filters.query) {
      const q = filters.query.toLowerCase();
      results = results.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }
    if (filters.categoryId) {
      results = results.filter((p) => p.categoryId === filters.categoryId);
    }
    if (filters.minPrice !== undefined) {
      results = results.filter((p) => p.price >= filters.minPrice!);
    }
    if (filters.maxPrice !== undefined) {
      results = results.filter((p) => p.price <= filters.maxPrice!);
    }
    if (filters.sortBy) {
      switch (filters.sortBy) {
        case 'price-asc': results.sort((a, b) => a.price - b.price); break;
        case 'price-desc': results.sort((a, b) => b.price - a.price); break;
        case 'rating': results.sort((a, b) => b.rating - a.rating); break;
      }
    }
    return results;
  }

  getReviews(productId: string): ProductReview[] {
    return this.mockReviews;
  }

  toggleFavorite(productId: string): void {
    const current = new Set(this.favoriteIds());
    if (current.has(productId)) {
      current.delete(productId);
    } else {
      current.add(productId);
    }
    this.favoriteIds.set(current);
  }

  isFavorite(productId: string): boolean {
    return this.favoriteIds().has(productId);
  }

  getFavoriteProducts(): Product[] {
    return this.productsSignal().filter((p) => this.favoriteIds().has(p.id));
  }

  getSuggestions(): string[] {
    return ['Leche', 'Pan', 'Huevo', 'Frutas', 'Verduras', 'Pollo', 'Refresco', 'Agua'];
  }

  // --- Admin Methods ---

  addProduct(product: Omit<Product, 'id'>): void {
    const newProduct: Product = {
      ...product,
      id: `prod-${Date.now()}`,
      rating: 5.0,
      reviewCount: 0,
    };
    this.productsSignal.set([...this.productsSignal(), newProduct]);
    this.saveProductsToStorage();
    this.updateCategoryProductCounts();
  }

  updateProduct(product: Product): void {
    this.productsSignal.set(this.productsSignal().map((p) => (p.id === product.id ? product : p)));
    this.saveProductsToStorage();
    this.updateCategoryProductCounts();
  }

  deleteProduct(id: string): void {
    this.productsSignal.set(this.productsSignal().filter((p) => p.id !== id));
    this.saveProductsToStorage();
    this.updateCategoryProductCounts();
  }

  addCategory(category: Omit<ProductCategory, 'id' | 'productCount'>): void {
    const newCategory: ProductCategory = {
      ...category,
      id: `cat-${Date.now()}`,
      productCount: 0,
    };
    this.categoriesSignal.set([...this.categoriesSignal(), newCategory]);
    this.saveCategoriesToStorage();
  }

  updateCategory(category: ProductCategory): void {
    this.categoriesSignal.set(this.categoriesSignal().map((c) => (c.id === category.id ? category : c)));
    this.saveCategoriesToStorage();
  }

  deleteCategory(id: string): void {
    this.categoriesSignal.set(this.categoriesSignal().filter((c) => c.id !== id));
    this.saveCategoriesToStorage();
  }

  private updateCategoryProductCounts(): void {
    const counts = this.productsSignal().reduce((acc, p) => {
      acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const updated = this.categoriesSignal().map((c) => ({
      ...c,
      productCount: counts[c.id] || 0,
    }));
    this.categoriesSignal.set(updated);
    this.saveCategoriesToStorage();
  }
}
