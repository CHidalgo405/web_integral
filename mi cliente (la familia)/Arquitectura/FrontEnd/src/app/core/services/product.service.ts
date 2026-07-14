import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { API_BASE_URL } from '../api.config';
import { Product, ProductCategory, ProductReview, SearchFilters } from '../models/product.model';

interface ApiCategory {
  id: string;
  name: string;
  slug?: string;
  parent_id?: string | null;
}

interface ApiInventoryItem {
  id: string;
  name: string;
  sku?: string | null;
  description?: string | null;
  category_id?: string | null;
  category?: string | null;
  uom_id?: string | null;
  price: string | number;
  cost?: string | number | null;
  stock?: number | null;
  min_stock?: number | null;
  active?: boolean | null;
  has_expiration?: boolean | null;
  image_url?: string | null;
}

const CATEGORY_ICONS: Record<string, string> = {
  dairy: 'milk',
  lacteos: 'milk',
  beverages: 'cup-soda',
  bebidas: 'cup-soda',
  fruits: 'leaf',
  frutas: 'leaf',
  vegetables: 'leaf',
  verduras: 'leaf',
  bakery: 'bread',
  panaderia: 'bread',
  meats: 'drumstick',
  carnes: 'drumstick',
  snacks: 'cookie',
  cleaning: 'brush',
  limpieza: 'brush',
};

@Injectable({ providedIn: 'root' })
export class ProductService {
  private http = inject(HttpClient);
  private favoriteIds = signal<Set<string>>(new Set());
  private inventoryMeta = new Map<string, Partial<ApiInventoryItem>>();
  private categoriesSignal = signal<ProductCategory[]>([]);
  private productsSignal = signal<Product[]>([]);

  readonly favorites = computed(() => this.favoriteIds());
  readonly isLoading = signal(false);
  readonly loadError = signal<string | null>(null);


  constructor() {
    this.refresh();
  }


  refresh(): void {
    this.isLoading.set(true);
    this.loadError.set(null);

    this.http.get<ApiCategory[]>(`${API_BASE_URL}/categories`).subscribe({
      next: (categories) => {
        this.categoriesSignal.set(categories.map((category) => this.mapCategory(category)));
        this.loadProducts();
      },
      error: () => {
        this.loadError.set('No se pudo cargar el catalogo desde el servidor.');
        this.isLoading.set(false);
      },
    });
  }

  private loadProducts(): void {
    this.http.get<ApiInventoryItem[]>(`${API_BASE_URL}/inventory`, { params: { active: 'true' } }).subscribe({
      next: (items) => {
        const products = items.map((item) => this.mapInventoryItem(item));
        this.productsSignal.set(products);
        this.updateCategoryProductCounts();
        this.isLoading.set(false);
      },
      error: () => {
        this.loadError.set('No se pudo cargar el inventario desde el servidor.');
        this.isLoading.set(false);
      },
    });
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
    if (filters.categoryId) results = results.filter((p) => p.categoryId === filters.categoryId);
    if (filters.minPrice !== undefined) results = results.filter((p) => p.price >= filters.minPrice!);
    if (filters.maxPrice !== undefined) results = results.filter((p) => p.price <= filters.maxPrice!);
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
    return [];
  }

  toggleFavorite(productId: string): void {
    const current = new Set(this.favoriteIds());
    current.has(productId) ? current.delete(productId) : current.add(productId);
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

  addProduct(product: Omit<Product, 'id'>, imageFile?: File): void {
    this.http.post<ApiInventoryItem>(`${API_BASE_URL}/inventory`, this.toInventoryPayload(product)).subscribe({
      next: (created) => {
        if (imageFile) {
          this.uploadProductImage(created.id, imageFile);
        } else {
          this.productsSignal.set([...this.productsSignal(), this.mapInventoryItem(created)]);
          this.updateCategoryProductCounts();
        }
      },
      error: () => this.loadError.set('No se pudo crear el producto.'),
    });
  }

  updateProduct(product: Product, imageFile?: File): void {
    this.http.put<ApiInventoryItem>(`${API_BASE_URL}/inventory/${product.id}`, this.toInventoryPayload(product)).subscribe({
      next: (updated) => {
        if (imageFile) {
          this.uploadProductImage(updated.id, imageFile);
        } else {
          const mapped = this.mapInventoryItem(updated);
          this.productsSignal.set(this.productsSignal().map((p) => (p.id === product.id ? mapped : p)));
          this.updateCategoryProductCounts();
        }
      },
      error: () => this.loadError.set('No se pudo actualizar el producto.'),
    });
  }

  deleteProduct(id: string): void {
    this.http.delete<void>(`${API_BASE_URL}/inventory/${id}`).subscribe({
      next: () => {
        this.productsSignal.set(this.productsSignal().filter((p) => p.id !== id));
        this.updateCategoryProductCounts();
      },
      error: () => this.loadError.set('No se pudo eliminar el producto.'),
    });
  }

  addCategory(category: Omit<ProductCategory, 'id' | 'productCount'>): void {
    this.http.post<ApiCategory>(`${API_BASE_URL}/categories`, {
      name: category.name,
      slug: this.slugify(category.name),
      parent_id: null,
    }).subscribe({
      next: (created) => this.categoriesSignal.set([...this.categoriesSignal(), this.mapCategory(created)]),
      error: () => this.loadError.set('No se pudo crear la categoria.'),
    });
  }

  updateCategory(category: ProductCategory): void {
    this.http.put<ApiCategory>(`${API_BASE_URL}/categories/${category.id}`, {
      name: category.name,
      slug: this.slugify(category.name),
      parent_id: null,
    }).subscribe({
      next: (updated) => {
        const mapped = this.mapCategory(updated);
        this.categoriesSignal.set(this.categoriesSignal().map((c) => (c.id === category.id ? mapped : c)));
        this.updateCategoryProductCounts();
      },
      error: () => this.loadError.set('No se pudo actualizar la categoria.'),
    });
  }

  deleteCategory(id: string): void {
    this.http.delete<void>(`${API_BASE_URL}/categories/${id}`).subscribe({
      next: () => this.categoriesSignal.set(this.categoriesSignal().filter((c) => c.id !== id)),
      error: () => this.loadError.set('No se pudo eliminar la categoria.'),
    });
  }

  uploadProductImage(productId: string, file: File): void {
    const formData = new FormData();
    formData.append('image', file);
    this.http.post<ApiInventoryItem>(`${API_BASE_URL}/inventory/${productId}/image`, formData).subscribe({
      next: (updated) => {
        const mapped = this.mapInventoryItem(updated);
        this.productsSignal.set(this.productsSignal().map((p) => (p.id === productId ? mapped : p)));
      },
      error: () => this.loadError.set('No se pudo subir la imagen.'),
    });
  }

  private mapCategory(category: ApiCategory): ProductCategory {
    return {
      id: category.id,
      name: category.name,
      icon: this.iconForCategory(category.name, category.slug),
      imageUrl: '',
      productCount: this.productsSignal().filter((p) => p.categoryId === category.id).length,
    };
  }

  private mapInventoryItem(item: ApiInventoryItem): Product {
    this.inventoryMeta.set(item.id, item);
    const categoryId = item.category_id ?? '';
    const category = item.category ?? this.categoriesSignal().find((c) => c.id === categoryId)?.name ?? 'Varios';
    const stock = Number(item.stock ?? 0);
    return {
      id: item.id,
      name: item.name,
      description: item.description ?? 'Producto disponible en tienda.',
      price: Number(item.price),
      images: [item.image_url || 'https://placehold.co/400x400?text=Sin+Imagen'],
      category,
      categoryId,
      rating: 5,
      reviewCount: 0,
      inStock: (item.active ?? true) && stock > 0,
      stockQuantity: stock,
    };
  }

  private toInventoryPayload(product: Omit<Product, 'id'> | Product): Record<string, unknown> {
    const existing = 'id' in product ? this.inventoryMeta.get(product.id) : undefined;
    return {
      name: product.name,
      sku: existing?.sku ?? undefined,
      description: product.description,
      category_id: product.categoryId || null,
      uom_id: existing?.uom_id ?? null,
      price: product.price,
      cost: existing?.cost ?? null,
      stock: product.stockQuantity,
      min_stock: existing?.min_stock ?? 0,
      has_expiration: existing?.has_expiration ?? false,
      active: product.inStock,
    };
  }

  private updateCategoryProductCounts(): void {
    const counts = this.productsSignal().reduce((acc, p) => {
      acc[p.categoryId] = (acc[p.categoryId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    this.categoriesSignal.set(this.categoriesSignal().map((c) => ({ ...c, productCount: counts[c.id] || 0 })));
  }

  private iconForCategory(name: string, slug?: string): string {
    const key = this.normalize(slug || name);
    return CATEGORY_ICONS[key] ?? 'package';
  }

  private slugify(value: string): string {
    return this.normalize(value).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || `categoria-${Date.now()}`;
  }

  private normalize(value: string): string {
    return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}





