// products.component.ts
import { Component, inject, signal, computed } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { SlicePipe } from '@angular/common';
import { ProductService } from '../../../core/services/product.service';
import { Product, ProductCategory } from '../../../core/models/product.model';
import { MxnCurrencyPipe } from '../../../shared/pipes/currency.pipe';
import { IconComponent } from '../../../shared/components/icon/icon';

@Component({
  selector: 'app-product-manager',
  standalone: true,
  imports: [FormsModule, MxnCurrencyPipe, SlicePipe, IconComponent],
  template: `
    <div class="product-manager">
      <!-- Header -->
      <div class="manager-header">
        <div class="header-content">
          <h1 class="page-title">
            Administración de Productos
          </h1>
          <p class="page-subtitle">Gestiona tu catálogo, precios, existencias y categorías</p>
        </div>
        <div class="header-actions">
          <button (click)="openCategoryModal()" class="btn btn-secondary">
            <app-icon name="tag" size="16" color="var(--primary)" />
            Categorías
          </button>
          <button (click)="openAddModal()" class="btn btn-primary">
            <app-icon name="plus" size="16" color="white" />
            Nuevo Producto
          </button>
        </div>
      </div>

      <!-- Filters Bar -->
      <div class="filters-bar">
        <div class="search-input-wrapper">
          <span class="search-icon"><app-icon name="search" size="18" color="var(--text-muted)" /></span>
          <input 
            type="text" 
            [ngModel]="searchQuery()" 
            (ngModelChange)="searchQuery.set($event)"
            placeholder="Buscar por nombre o descripción..."
            class="form-control"
          />
        </div>
        <div class="filter-dropdowns">
          <select [ngModel]="selectedCategoryFilter()" (ngModelChange)="selectedCategoryFilter.set($event)" class="form-control select-control">
            <option value="">Todas las Categorías</option>
            @for (cat of productService.getCategories(); track cat.id) {
              <option [value]="cat.id">{{ cat.name }}</option>
            }
          </select>

          <select [ngModel]="selectedStockFilter()" (ngModelChange)="selectedStockFilter.set($event)" class="form-control select-control">
            <option value="all">Todos los Inventarios</option>
            <option value="instock">En Stock</option>
            <option value="lowstock">Stock Bajo (&lt;=10)</option>
            <option value="out">Agotados</option>
          </select>
        </div>
        <div class="stats-badge">
          <app-icon name="package" size="16" color="white" />
          <span>{{ filteredProducts().length }} productos</span>
        </div>
      </div>

      <!-- Products Table -->
      <div class="card table-card">
        <div class="table-responsive">
          <table class="products-table">
            <thead>
              <tr>
                <th class="col-product">
                  <app-icon name="shopping-cart" size="14" color="var(--text-muted)" />
                  Producto
                </th>
                <th>
                  <app-icon name="tag" size="14" color="var(--text-muted)" />
                  Categoría
                </th>
                <th>
                  <app-icon name="dollar-sign" size="14" color="var(--text-muted)" />
                  Precio
                </th>
                <th class="col-stock">
                  <app-icon name="package" size="14" color="var(--text-muted)" />
                  Existencias
                </th>
                <th>Estado</th>
                <th class="col-actions">Acciones</th>
              </tr>
            </thead>
            <tbody>
              @for (prod of filteredProducts(); track prod.id) {
                <tr>
                  <td>
                    <div class="product-info-cell">
                      <div class="product-cell-emoji">
                        <img [src]="prod.images[0] || 'https://placehold.co/400x400?text=Sin+Imagen'" [alt]="prod.name" />
                      </div>
                      <div>
                        <h4 class="product-cell-name">{{ prod.name }}</h4>
                        <p class="product-cell-desc">{{ prod.description | slice:0:60 }}{{ prod.description.length > 60 ? '...' : '' }}</p>
                        @if (prod.originalPrice) {
                          <span class="cell-promo-tag">
                            <app-icon name="star" size="10" color="#FFD700" fill="currentColor" />
                            Oferta
                          </span>
                        }
                      </div>
                    </div>
                  </td>
                  <td>
                    <span class="category-tag">
                      <app-icon [name]="getCategoryIcon(prod.categoryId)" size="12" color="var(--primary)" />
                      {{ prod.category }}
                    </span>
                  </td>
                  <td>
                    <div class="price-cell">
                      <span class="current-price">{{ prod.price | mxnCurrency }}</span>
                      @if (prod.originalPrice) {
                        <span class="original-price-strike">{{ prod.originalPrice | mxnCurrency }}</span>
                      }
                    </div>
                  </td>
                  <td>
                    <div class="stock-adjuster">
                      <button (click)="adjustStock(prod, -1)" class="btn-stock-adjust" [disabled]="prod.stockQuantity <= 0">
                        <app-icon name="minus" size="12" />
                      </button>
                      <span class="stock-qty-text" [class.low-stock]="prod.stockQuantity <= 10 && prod.stockQuantity > 0" [class.out-stock]="prod.stockQuantity === 0">
                        {{ prod.stockQuantity }}
                      </span>
                      <button (click)="adjustStock(prod, 1)" class="btn-stock-adjust">
                        <app-icon name="plus" size="12" />
                      </button>
                    </div>
                  </td>
                  <td>
                    <label class="switch-label">
                      <input 
                        type="checkbox" 
                        [checked]="prod.inStock" 
                        (change)="toggleInStock(prod)"
                        class="switch-input"
                      />
                      <span class="switch-slider"></span>
                      <span class="status-text" [class.active-status]="prod.inStock">
                        <app-icon [name]="prod.inStock ? 'check' : 'clock'" size="12" color="currentColor" />
                        {{ prod.inStock ? 'Activo' : 'Pausado' }}
                      </span>
                    </label>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button (click)="fileInput.click()" class="action-btn btn-image" title="Subir Imagen">
                        <app-icon name="image" size="14" color="var(--primary)" />
                      </button>
                      <input type="file" #fileInput style="display: none" accept="image/*" (change)="onFileSelected($event, prod.id)" />
                      <button (click)="openEditModal(prod)" class="action-btn btn-edit" title="Editar">
                        <app-icon name="pencil" size="14" color="var(--primary)" />
                      </button>
                      <button (click)="deleteProduct(prod)" class="action-btn btn-delete" title="Eliminar">
                        <app-icon name="trash" size="14" color="var(--danger)" />
                      </button>
                    </div>
                  </td>
                </tr>
              } @empty {
                <tr>
                  <td colspan="6" class="table-empty">
                    <app-icon name="package" size="48" color="var(--text-muted)" />
                    <p>No se encontraron productos con los filtros seleccionados.</p>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Product Modal -->
    @if (isProductModalOpen()) {
      <div class="modal-backdrop" (click)="closeProductModal()"></div>
      <div class="modal-drawer">
        <div class="modal-header">
          <div class="drawer-header-title">
            <app-icon name="package" size="20" color="var(--primary)" />
            <h2>{{ modalTitle() }}</h2>
          </div>
          <button (click)="closeProductModal()" class="modal-close-btn">&times;</button>
        </div>
        <form (ngSubmit)="saveProductForm()" class="modal-form">
          <div class="form-group">
            <label for="p-name" class="label-control">
              <app-icon name="pencil" size="12" color="var(--text-muted)" />
              Nombre del Producto *
            </label>
            <input 
              type="text" 
              id="p-name" 
              name="name" 
              [(ngModel)]="productForm.name" 
              required 
              placeholder="Ej. Manzana Roja (kg)"
              class="form-control"
            />
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="p-price" class="label-control">
                <app-icon name="dollar-sign" size="12" color="var(--text-muted)" />
                Precio al Público *
              </label>
              <input 
                type="number" 
                id="p-price" 
                name="price" 
                [(ngModel)]="productForm.price" 
                step="0.01" 
                min="0.01"
                required 
                class="form-control"
              />
            </div>
            <div class="form-group">
              <label for="p-origPrice" class="label-control">
                <app-icon name="tag" size="12" color="var(--text-muted)" />
                Precio Original (Opcional)
              </label>
              <input 
                type="number" 
                id="p-origPrice" 
                name="originalPrice" 
                [(ngModel)]="productForm.originalPrice" 
                step="0.01"
                placeholder="Para ofertas"
                class="form-control"
              />
            </div>
          </div>

          <div class="form-row-2">
            <div class="form-group">
              <label for="p-category" class="label-control">
                <app-icon name="tag" size="12" color="var(--text-muted)" />
                Categoría *
              </label>
              <select 
                id="p-category" 
                name="categoryId" 
                [(ngModel)]="productForm.categoryId" 
                required 
                class="form-control select-control"
              >
                <option value="">Selecciona Categoría</option>
                @for (cat of productService.getCategories(); track cat.id) {
                  <option [value]="cat.id">{{ cat.name }}</option>
                }
              </select>
            </div>
            <div class="form-group">
              <label for="p-stock" class="label-control">
                <app-icon name="package" size="12" color="var(--text-muted)" />
                Existencias Iniciales *
              </label>
              <input 
                type="number" 
                id="p-stock" 
                name="stockQuantity" 
                [(ngModel)]="productForm.stockQuantity" 
                min="0"
                required 
                class="form-control"
              />
            </div>
          </div>

          <div class="form-group">
            <label for="p-desc" class="label-control">
              <app-icon name="file-text" size="12" color="var(--text-muted)" />
              Descripción *
            </label>
            <textarea 
              id="p-desc" 
              name="description" 
              [(ngModel)]="productForm.description" 
              rows="4" 
              required
              placeholder="Escribe los detalles y beneficios del producto..."
              class="form-control textarea-control"
            ></textarea>
          </div>

          <div class="form-group">
            <label for="p-image" class="label-control">
              <app-icon name="image" size="12" color="var(--text-muted)" />
              Imagen del Producto
            </label>
            <div
              class="image-upload-zone"
              [class.has-file]="selectedModalFile"
              (click)="modalFileInput.click()"
            >
              @if (!selectedModalFile) {
                <div class="upload-icon">
                  <app-icon name="upload" size="22" color="var(--primary)" />
                </div>
                <span class="upload-text">Haz clic para elegir una imagen</span>
                <span class="upload-subtext">JPG, PNG o WebP &bull; Máx. 5 MB</span>
              } @else {
                <div class="upload-preview">
                  <img [src]="modalFilePreview" class="upload-preview-img" alt="preview" />
                  <div class="upload-preview-info">
                    <span class="upload-preview-name">{{ selectedModalFile.name }}</span>
                    <span class="upload-preview-size">{{ (selectedModalFile.size / 1024).toFixed(0) }} KB</span>
                    <button type="button" class="upload-change-btn" (click)="$event.stopPropagation(); modalFileInput.click()">
                      Cambiar imagen
                    </button>
                  </div>
                </div>
              }
            </div>
            <input
              type="file"
              #modalFileInput
              id="p-image"
              (change)="onModalFileSelected($event)"
              accept="image/*"
              style="display: none"
            />
          </div>

          <div class="form-group checkbox-group">
            <label class="switch-label">
              <input 
                type="checkbox" 
                name="inStock"
                [(ngModel)]="productForm.inStock" 
                class="switch-input"
              />
              <span class="switch-slider"></span>
              <span class="status-text font-bold">
                <app-icon [name]="productForm.inStock ? 'check' : 'clock'" size="14" color="var(--primary)" />
                Disponible para Venta Directa
              </span>
            </label>
          </div>

          <div class="modal-footer">
            <button type="button" (click)="closeProductModal()" class="btn btn-secondary btn-full">
              <app-icon name="x" size="16" />
              Cancelar
            </button>
            <button type="submit" class="btn btn-primary btn-full">
              <app-icon name="check" size="16" color="white" />
              Guardar Producto
            </button>
          </div>
        </form>
      </div>
    }

    <!-- Category Modal -->
    @if (isCategoryModalOpen()) {
      <div class="modal-backdrop" (click)="closeCategoryModal()"></div>
      <div class="modal-drawer mini-drawer">
        <div class="modal-header">
          <div class="drawer-header-title">
            <app-icon name="tag" size="20" color="var(--primary)" />
            <h2>Gestión de Categorías</h2>
          </div>
          <button (click)="closeCategoryModal()" class="modal-close-btn">&times;</button>
        </div>
        <div class="modal-content-scroll">
          
          <!-- Add Category form -->
          <form (ngSubmit)="saveCategoryForm()" class="category-add-form">
            <h3>
              <app-icon name="plus" size="14" color="var(--primary)" />
              Nueva Categoría
            </h3>
            <div class="form-row-category">
              <input 
                type="text" 
                name="catName"
                [(ngModel)]="categoryForm.name" 
                required 
                placeholder="Nombre (Ej. Congelados)"
                class="form-control"
              />
              <input 
                type="text" 
                name="catIcon"
                [(ngModel)]="categoryForm.icon" 
                required 
                placeholder="Icono (Ej. leaf, bread)"
                class="form-control icon-input"
              />
              <button type="submit" class="btn btn-primary btn-icon-only">
                <app-icon name="plus" size="18" color="white" />
              </button>
            </div>
          </form>

          <!-- Categories List -->
          <div class="category-list-wrapper">
            <h3>
              <app-icon name="list" size="14" color="var(--primary)" />
              Categorías Existentes
            </h3>
            <div class="cat-list">
              @for (cat of productService.getCategories(); track cat.id) {
                <div class="cat-item-row">
                  <div class="cat-item-info">
                    <span class="cat-item-emoji">
                      <app-icon [name]="cat.icon" size="24" color="var(--primary)" />
                    </span>
                    <div>
                      <h4>{{ cat.name }}</h4>
                      <p>{{ cat.productCount }} productos activos</p>
                    </div>
                  </div>
                  <button (click)="deleteCategory(cat)" class="action-btn btn-delete btn-sm" [disabled]="cat.productCount > 0" title="Eliminar (Debe estar vacía)">
                    <app-icon name="trash" size="14" color="var(--danger)" />
                  </button>
                </div>
              }
            </div>
          </div>

        </div>
      </div>
    }
  `,
  styleUrl: './products.css',
})
export class ProductManager {
  protected productService = inject(ProductService);

  searchQuery = signal('');
  selectedCategoryFilter = signal('');
  selectedStockFilter = signal('all');

  isProductModalOpen = signal<boolean>(false);
  isCategoryModalOpen = signal<boolean>(false);
  modalTitle = signal<string>('Nuevo Producto');

  productForm = {
    id: '',
    name: '',
    description: '',
    price: 0,
    originalPrice: undefined as number | undefined,
    categoryId: '',
    category: '',
    stockQuantity: 0,
    inStock: true,
  };
  selectedModalFile: File | null = null;
  modalFilePreview: string | null = null;

  categoryForm = {
    name: '',
    icon: '',
  };

  readonly filteredProducts = computed(() => {
    let list = this.productService.getProducts();

    if (this.searchQuery()) {
      const q = this.searchQuery().toLowerCase();
      list = list.filter((p) => p.name.toLowerCase().includes(q) || p.description.toLowerCase().includes(q));
    }

    if (this.selectedCategoryFilter()) {
      list = list.filter((p) => p.categoryId === this.selectedCategoryFilter());
    }

    if (this.selectedStockFilter() !== 'all') {
      if (this.selectedStockFilter() === 'instock') {
        list = list.filter((p) => p.stockQuantity > 0 && p.inStock);
      } else if (this.selectedStockFilter() === 'lowstock') {
        list = list.filter((p) => p.stockQuantity > 0 && p.stockQuantity <= 10);
      } else if (this.selectedStockFilter() === 'out') {
        list = list.filter((p) => p.stockQuantity === 0 || !p.inStock);
      }
    }

    return list;
  });

  getCategoryIcon(categoryId: string): string {
    return this.productService.getCategories().find((c) => c.id === categoryId)?.icon ?? 'package';
  }

  onFileSelected(event: Event, productId: string): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.productService.uploadProductImage(productId, file);
      input.value = '';
    }
  }

  onModalFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedModalFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => { this.modalFilePreview = e.target?.result as string; };
      reader.readAsDataURL(this.selectedModalFile);
    } else {
      this.selectedModalFile = null;
      this.modalFilePreview = null;
    }
  }

  adjustStock(product: Product, delta: number): void {
    const newQty = Math.max(0, product.stockQuantity + delta);
    const updated: Product = {
      ...product,
      stockQuantity: newQty,
      inStock: newQty > 0 ? product.inStock : false,
    };
    this.productService.updateProduct(updated);
  }

  toggleInStock(product: Product): void {
    const updated: Product = {
      ...product,
      inStock: !product.inStock,
    };
    this.productService.updateProduct(updated);
  }

  openAddModal(): void {
    this.modalTitle.set('Nuevo Producto');
    this.productForm = {
      id: '',
      name: '',
      description: '',
      price: 0,
      originalPrice: undefined,
      categoryId: '',
      category: '',
      stockQuantity: 10,
      inStock: true,
    };
    this.selectedModalFile = null;
    this.modalFilePreview = null;
    this.isProductModalOpen.set(true);
  }

  openEditModal(product: Product): void {
    this.modalTitle.set('Editar Producto');
    this.productForm = {
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      originalPrice: product.originalPrice,
      categoryId: product.categoryId,
      category: product.category,
      stockQuantity: product.stockQuantity,
      inStock: product.inStock,
    };
    this.selectedModalFile = null;
    this.modalFilePreview = null;
    this.isProductModalOpen.set(true);
  }

  closeProductModal(): void {
    this.isProductModalOpen.set(false);
  }

  saveProductForm(): void {
    const cat = this.productService.getCategories().find((c) => c.id === this.productForm.categoryId);
    const categoryName = cat ? cat.name : 'Varios';

    const pData: Omit<Product, 'id'> & { id?: string } = {
      name: this.productForm.name,
      description: this.productForm.description,
      price: this.productForm.price,
      originalPrice: this.productForm.originalPrice || undefined,
      categoryId: this.productForm.categoryId,
      category: categoryName,
      stockQuantity: this.productForm.stockQuantity,
      inStock: this.productForm.stockQuantity > 0 ? this.productForm.inStock : false,
      images: [],
      rating: 5.0,
      reviewCount: 0,
    };

    if (this.productForm.id) {
      const fullProduct: Product = {
        ...pData,
        id: this.productForm.id,
        rating: 4.5,
        reviewCount: 15,
      };
      this.productService.updateProduct(fullProduct, this.selectedModalFile || undefined);
    } else {
      this.productService.addProduct(pData, this.selectedModalFile || undefined);
    }

    this.closeProductModal();
  }

  deleteProduct(product: Product): void {
    const confirmDelete = confirm(`¿Estás seguro de que deseas eliminar el producto "${product.name}"?`);
    if (confirmDelete) {
      this.productService.deleteProduct(product.id);
    }
  }

  openCategoryModal(): void {
    this.categoryForm = { name: '', icon: '' };
    this.isCategoryModalOpen.set(true);
  }

  closeCategoryModal(): void {
    this.isCategoryModalOpen.set(false);
  }

  saveCategoryForm(): void {
    if (!this.categoryForm.name || !this.categoryForm.icon) return;

    this.productService.addCategory({
      name: this.categoryForm.name,
      icon: this.categoryForm.icon,
      imageUrl: '',
    });

    this.categoryForm = { name: '', icon: '' };
  }

  deleteCategory(category: ProductCategory): void {
    if (category.productCount > 0) return;
    const confirmDelete = confirm(`¿Deseas eliminar la categoría "${category.name}"?`);
    if (confirmDelete) {
      this.productService.deleteCategory(category.id);
    }
  }
}
