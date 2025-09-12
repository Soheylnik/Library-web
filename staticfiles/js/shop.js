// Shop functionality
class ShopManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 12;
    this.currentFilters = {
      category: '',
      minPrice: 0,
      maxPrice: 1000000,
      featured: false,
      new: false,
      discount: false,
      search: '',
      sort: 'newest'
    };
    this.currentView = 'grid';
    this.products = [];
    this.totalProducts = 0;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadProducts();
  }

  bindEvents() {
    // Search functionality
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');
    
    if (searchInput) {
      searchInput.addEventListener('input', this.debounce(() => {
        this.currentFilters.search = searchInput.value;
        this.currentPage = 1;
        this.loadProducts();
      }, 500));
    }

    if (searchBtn) {
      searchBtn.addEventListener('click', () => {
        this.currentFilters.search = searchInput.value;
        this.currentPage = 1;
        this.loadProducts();
      });
    }

    // Category filter
    const categoryLinks = document.querySelectorAll('[data-category]');
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        categoryLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        this.currentFilters.category = link.dataset.category;
        this.currentPage = 1;
        this.loadProducts();
      });
    });

    // Price range filter
    const priceRange = document.getElementById('priceRange');
    if (priceRange) {
      priceRange.addEventListener('input', () => {
        this.currentFilters.maxPrice = parseInt(priceRange.value);
        document.getElementById('maxPrice').textContent = this.formatPrice(priceRange.value);
        this.currentPage = 1;
        this.loadProducts();
      });
    }

    // Feature filters
    const featuredFilter = document.getElementById('featuredFilter');
    const newFilter = document.getElementById('newFilter');
    const discountFilter = document.getElementById('discountFilter');

    if (featuredFilter) {
      featuredFilter.addEventListener('change', () => {
        this.currentFilters.featured = featuredFilter.checked;
        this.currentPage = 1;
        this.loadProducts();
      });
    }

    if (newFilter) {
      newFilter.addEventListener('change', () => {
        this.currentFilters.new = newFilter.checked;
        this.currentPage = 1;
        this.loadProducts();
      });
    }

    if (discountFilter) {
      discountFilter.addEventListener('change', () => {
        this.currentFilters.discount = discountFilter.checked;
        this.currentPage = 1;
        this.loadProducts();
      });
    }

    // Sort functionality
    const sortSelect = document.getElementById('sortSelect');
    if (sortSelect) {
      sortSelect.addEventListener('change', () => {
        this.currentFilters.sort = sortSelect.value;
        this.currentPage = 1;
        this.loadProducts();
      });
    }

    // View toggle
    const viewBtns = document.querySelectorAll('.view-btn');
    viewBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        viewBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.currentView = btn.dataset.view;
        this.renderProducts();
      });
    });

    // Cart functionality
    this.bindCartEvents();
  }

  bindCartEvents() {
    // Cart button click
    const cartBtn = document.getElementById('cartBtn');
    if (cartBtn) {
      cartBtn.addEventListener('click', () => {
        // Redirect to cart page or show cart modal
        window.location.href = 'cart.html';
      });
    }

    // User button click
    const userBtn = document.getElementById('userBtn');
    if (userBtn) {
      userBtn.addEventListener('click', () => {
        // Check if user is logged in
        const token = localStorage.getItem('token');
        if (token) {
          window.location.href = 'profile.html';
        } else {
          window.location.href = 'login.html';
        }
      });
    }
  }

  async loadProducts() {
    try {
      this.showLoading(true);
      
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage,
        sort: this.currentFilters.sort
      });

      if (this.currentFilters.category) {
        params.append('category', this.currentFilters.category);
      }

      if (this.currentFilters.search) {
        params.append('search', this.currentFilters.search);
      }

      if (this.currentFilters.minPrice > 0) {
        params.append('minPrice', this.currentFilters.minPrice);
      }

      if (this.currentFilters.maxPrice < 1000000) {
        params.append('maxPrice', this.currentFilters.maxPrice);
      }

      if (this.currentFilters.featured) {
        params.append('featured', 'true');
      }

      if (this.currentFilters.new) {
        params.append('new', 'true');
      }

      const response = await fetch(`/api/books?${params}`);
      const data = await response.json();

      if (data.success) {
        this.products = data.data.books;
        this.totalProducts = data.data.pagination.totalItems;
        this.renderProducts();
        this.renderPagination(data.data.pagination);
        this.updateToolbar();
      } else {
        this.showError('خطا در بارگذاری محصولات');
      }
    } catch (error) {
      console.error('Error loading products:', error);
      this.showError('خطا در بارگذاری محصولات');
    } finally {
      this.showLoading(false);
    }
  }

  renderProducts() {
    const productsGrid = document.getElementById('productsGrid');
    if (!productsGrid) return;

    if (this.products.length === 0) {
      productsGrid.innerHTML = `
        <div class="no-products">
          <ion-icon name="book-outline" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></ion-icon>
          <h3>محصولی یافت نشد</h3>
          <p>لطفاً فیلترهای جستجو را تغییر دهید</p>
        </div>
      `;
      return;
    }

    const gridClass = this.currentView === 'grid' ? 'grid-list' : 'list-view';
    productsGrid.className = `products-${this.currentView} ${gridClass}`;

    productsGrid.innerHTML = this.products.map(product => this.createProductCard(product)).join('');
  }

  createProductCard(product) {
    const discountBadge = product.discount > 0 ? 
      `<span class="card-badge">${product.discount}% تخفیف</span>` : '';
    
    const newBadge = product.isNew ? 
      `<span class="card-badge">جدید</span>` : '';

    const featuredBadge = product.isFeatured ? 
      `<span class="card-badge featured">ویژه</span>` : '';

    const badges = [discountBadge, newBadge, featuredBadge].filter(Boolean).join('');

    const originalPrice = product.discount > 0 ? 
      `<data class="card-price original" value="${product.price}">${this.formatPrice(product.price)}</data>` : '';

    const finalPrice = product.discount > 0 ? 
      product.price * (1 - product.discount / 100) : product.price;

    const rating = this.createRatingStars(product.rating?.average || 0);

    if (this.currentView === 'list') {
      return `
        <div class="product-card list-view">
          <div class="card-banner img-holder" style="--width: 200; --height: 250;">
            <img src="${product.images[0]?.url || './assets/images/book-1.png'}" 
                 alt="${product.title}" class="img-cover">
            ${badges}
          </div>
          
          <div class="card-content">
            <h3 class="h3">
              <a href="product-detail.html?id=${product._id}" class="card-title">${product.title}</a>
            </h3>
            
            <p class="card-author">نویسنده: ${product.author}</p>
            
            <p class="card-description">${product.description.substring(0, 150)}...</p>
            
            <div class="card-price-wrapper">
              ${originalPrice}
              <data class="card-price" value="${finalPrice}">${this.formatPrice(finalPrice)}</data>
            </div>
            
            <div class="rating-wrapper">
              ${rating}
              <span class="rating-count">(${product.rating?.count || 0})</span>
            </div>
            
            <div class="card-action">
              <button class="action-btn" onclick="shopManager.addToCart('${product._id}')" title="افزودن به سبد خرید">
                <ion-icon name="bag-handle-outline"></ion-icon>
              </button>
              <button class="action-btn" onclick="shopManager.addToWishlist('${product._id}')" title="افزودن به علاقه‌مندی‌ها">
                <ion-icon name="heart-outline"></ion-icon>
              </button>
              <a href="product-detail.html?id=${product._id}" class="action-btn" title="مشاهده جزئیات">
                <ion-icon name="eye-outline"></ion-icon>
              </a>
            </div>
          </div>
        </div>
      `;
    }

    return `
      <div class="product-card">
        ${badges}
        
        <div class="card-banner img-holder" style="--width: 384; --height: 480;">
          <img src="${product.images[0]?.url || './assets/images/book-1.png'}" 
               alt="${product.title}" class="img-cover">
          
          <div class="card-action">
            <button class="action-btn" onclick="shopManager.addToCart('${product._id}')" title="افزودن به سبد خرید">
              <ion-icon name="bag-handle-outline"></ion-icon>
            </button>
            <button class="action-btn" onclick="shopManager.addToWishlist('${product._id}')" title="افزودن به علاقه‌مندی‌ها">
              <ion-icon name="heart-outline"></ion-icon>
            </button>
            <a href="product-detail.html?id=${product._id}" class="action-btn" title="مشاهده جزئیات">
              <ion-icon name="eye-outline"></ion-icon>
            </a>
          </div>
        </div>
        
        <div class="card-content">
          <h3 class="h3">
            <a href="product-detail.html?id=${product._id}" class="card-title">${product.title}</a>
          </h3>
          
          <p class="card-author">${product.author}</p>
          
          <div class="card-price-wrapper">
            ${originalPrice}
            <data class="card-price" value="${finalPrice}">${this.formatPrice(finalPrice)}</data>
          </div>
          
          <div class="rating-wrapper">
            ${rating}
            <span class="rating-count">(${product.rating?.count || 0})</span>
          </div>
        </div>
      </div>
    `;
  }

  createRatingStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);

    let stars = '';
    
    // Full stars
    for (let i = 0; i < fullStars; i++) {
      stars += '<ion-icon name="star" style="color: #ffc107;"></ion-icon>';
    }
    
    // Half star
    if (hasHalfStar) {
      stars += '<ion-icon name="star-half" style="color: #ffc107;"></ion-icon>';
    }
    
    // Empty stars
    for (let i = 0; i < emptyStars; i++) {
      stars += '<ion-icon name="star-outline" style="color: #ddd;"></ion-icon>';
    }
    
    return stars;
  }

  renderPagination(pagination) {
    const paginationEl = document.getElementById('pagination');
    if (!paginationEl) return;

    if (pagination.totalPages <= 1) {
      paginationEl.innerHTML = '';
      return;
    }

    let paginationHTML = '';

    // Previous button
    if (pagination.currentPage > 1) {
      paginationHTML += `
        <button class="pagination-btn" onclick="shopManager.goToPage(${pagination.currentPage - 1})">
          <ion-icon name="chevron-back"></ion-icon>
          قبلی
        </button>
      `;
    }

    // Page numbers
    const startPage = Math.max(1, pagination.currentPage - 2);
    const endPage = Math.min(pagination.totalPages, pagination.currentPage + 2);

    for (let i = startPage; i <= endPage; i++) {
      const isActive = i === pagination.currentPage ? 'active' : '';
      paginationHTML += `
        <button class="pagination-btn ${isActive}" onclick="shopManager.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    // Next button
    if (pagination.currentPage < pagination.totalPages) {
      paginationHTML += `
        <button class="pagination-btn" onclick="shopManager.goToPage(${pagination.currentPage + 1})">
          بعدی
          <ion-icon name="chevron-forward"></ion-icon>
        </button>
      `;
    }

    paginationEl.innerHTML = paginationHTML;
  }

  updateToolbar() {
    const showingCount = document.getElementById('showingCount');
    const totalCount = document.getElementById('totalCount');

    if (showingCount && totalCount) {
      const start = (this.currentPage - 1) * this.itemsPerPage + 1;
      const end = Math.min(this.currentPage * this.itemsPerPage, this.totalProducts);
      
      showingCount.textContent = `${start}-${end}`;
      totalCount.textContent = this.totalProducts;
    }
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async addToCart(productId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        // Redirect to login if not authenticated
        window.location.href = 'login.html';
        return;
      }

      // Add to cart logic here
      // For now, just show a success message
      this.showMessage('کتاب به سبد خرید اضافه شد', 'success');
      
      // Update cart count
      this.updateCartCount();
    } catch (error) {
      console.error('Error adding to cart:', error);
      this.showMessage('خطا در افزودن به سبد خرید', 'error');
    }
  }

  async addToWishlist(productId) {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        window.location.href = 'login.html';
        return;
      }

      // Add to wishlist logic here
      this.showMessage('کتاب به علاقه‌مندی‌ها اضافه شد', 'success');
    } catch (error) {
      console.error('Error adding to wishlist:', error);
      this.showMessage('خطا در افزودن به علاقه‌مندی‌ها', 'error');
    }
  }

  updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      // Get cart count from localStorage or API
      const count = localStorage.getItem('cartCount') || 0;
      cartCount.textContent = count;
    }
  }

  showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'flex' : 'none';
    }
  }

  showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        document.body.removeChild(toast);
      }, 300);
    }, 3000);
  }

  showError(message) {
    this.showMessage(message, 'error');
  }

  formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  }
}

// Initialize shop manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.shopManager = new ShopManager();
});

// Add CSS for additional styles
const additionalStyles = `
  .products-list {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }
  
  .product-card.list-view {
    display: flex;
    gap: 2rem;
    padding: 1.5rem;
    border: 1px solid #eee;
    border-radius: 10px;
  }
  
  .product-card.list-view .card-banner {
    flex-shrink: 0;
    width: 200px;
  }
  
  .product-card.list-view .card-content {
    flex: 1;
  }
  
  .card-author {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }
  
  .card-description {
    color: #777;
    line-height: 1.6;
    margin-bottom: 1rem;
  }
  
  .card-price-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }
  
  .card-price.original {
    text-decoration: line-through;
    color: #999;
    font-size: 0.9rem;
  }
  
  .rating-count {
    color: #666;
    font-size: 0.8rem;
    margin-right: 0.5rem;
  }
  
  .no-products {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
  }
  
  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 5px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
  }
  
  .toast.show {
    transform: translateX(0);
  }
  
  .toast-success {
    background-color: #27ae60;
  }
  
  .toast-error {
    background-color: #e74c3c;
  }
  
  .toast-info {
    background-color: #3498db;
  }
  
  .loading-spinner {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 4rem;
  }
  
  .spinner {
    width: 40px;
    height: 40px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }
  
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
  
  .page-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 4rem 0;
    text-align: center;
  }
  
  .page-title {
    font-size: 3rem;
    margin-bottom: 1rem;
  }
  
  .breadcrumb {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    font-size: 1.1rem;
  }
  
  .breadcrumb-link {
    color: rgba(255, 255, 255, 0.8);
    text-decoration: none;
  }
  
  .breadcrumb-link:hover {
    color: white;
  }
  
  .breadcrumb-separator {
    color: rgba(255, 255, 255, 0.6);
  }
  
  .breadcrumb-current {
    color: white;
    font-weight: 500;
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);

// Enhanced Shop Styles
const enhancedShopStyles = `
  /* Enhanced Shop Page Styles */
  .shop {
    padding: 2rem 0;
  }

  .shop-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 3rem;
  }

  .shop-sidebar {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .sidebar-card {
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #f8f9fa;
  }

  .sidebar-card:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .sidebar-card .card-title {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #2c3e50;
    margin-bottom: 1.5rem;
    font-size: 1.1rem;
  }

  .sidebar-card .card-title ion-icon {
    color: #667eea;
  }

  .sidebar-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .sidebar-list li {
    margin-bottom: 0.5rem;
  }

  .sidebar-link {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    width: 100%;
    padding: 0.8rem 1rem;
    background: none;
    border: none;
    border-radius: 10px;
    color: #666;
    text-align: right;
    cursor: pointer;
    transition: all 0.3s ease;
    font-family: var(--ff-vazir);
  }

  .sidebar-link:hover,
  .sidebar-link.active {
    background: #667eea;
    color: white;
  }

  .sidebar-link ion-icon {
    font-size: 1.1rem;
  }

  .price-range {
    margin-top: 1rem;
  }

  .price-inputs {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .price-input {
    flex: 1;
    padding: 0.6rem;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    font-family: var(--ff-vazir);
    text-align: center;
  }

  .price-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .price-separator {
    color: #666;
    font-size: 0.9rem;
  }

  .price-range-slider {
    width: 100%;
    height: 6px;
    border-radius: 3px;
    background: #e1e8ed;
    outline: none;
    margin-bottom: 1rem;
  }

  .price-range-slider::-webkit-slider-thumb {
    appearance: none;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
  }

  .price-range-slider::-moz-range-thumb {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: #667eea;
    cursor: pointer;
    border: none;
  }

  .price-range-value {
    text-align: center;
    color: #666;
    font-size: 0.9rem;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 0.8rem;
    cursor: pointer;
    padding: 0.5rem 0;
  }

  .checkbox-input {
    display: none;
  }

  .checkbox-mark {
    width: 20px;
    height: 20px;
    border: 2px solid #e1e8ed;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    flex-shrink: 0;
  }

  .checkbox-input:checked + .checkbox-mark {
    background: #667eea;
    border-color: #667eea;
  }

  .checkbox-input:checked + .checkbox-mark::after {
    content: '✓';
    color: white;
    font-size: 12px;
    font-weight: bold;
  }

  .checkbox-label {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    color: #666;
    font-size: 0.9rem;
  }

  .checkbox-label ion-icon {
    color: #f39c12;
    font-size: 1rem;
  }

  .rating-stars {
    display: flex;
    gap: 0.1rem;
  }

  .rating-stars ion-icon {
    color: #f39c12;
    font-size: 0.9rem;
  }

  .rating-text {
    margin-right: 0.5rem;
    font-size: 0.8rem;
  }

  .sidebar-actions {
    margin-top: 2rem;
  }

  .shop-main {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  }

  .shop-toolbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f8f9fa;
  }

  .toolbar-text {
    color: #666;
    font-size: 0.9rem;
  }

  .toolbar-right {
    display: flex;
    align-items: center;
    gap: 1.5rem;
  }

  .sort-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .sort-label {
    color: #666;
    font-size: 0.9rem;
  }

  .sort-select {
    padding: 0.5rem 1rem;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    background: white;
    color: #666;
    font-family: var(--ff-vazir);
    cursor: pointer;
  }

  .sort-select:focus {
    outline: none;
    border-color: #667eea;
  }

  .view-toggle {
    display: flex;
    gap: 0.5rem;
  }

  .view-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #e1e8ed;
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .view-btn:hover,
  .view-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .products-grid.list-view {
    grid-template-columns: 1fr;
  }

  .product-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    transition: all 0.3s ease;
    position: relative;
  }

  .product-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
  }

  .product-card.list-view {
    display: flex;
    align-items: center;
    padding: 1.5rem;
  }

  .product-image {
    position: relative;
    height: 300px;
    overflow: hidden;
  }

  .product-card.list-view .product-image {
    width: 200px;
    height: 250px;
    flex-shrink: 0;
    margin-left: 1.5rem;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .product-card:hover .product-image img {
    transform: scale(1.05);
  }

  .product-badges {
    position: absolute;
    top: 15px;
    right: 15px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .product-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
  }

  .badge-new {
    background: #27ae60;
  }

  .badge-featured {
    background: #f39c12;
  }

  .badge-discount {
    background: #e74c3c;
  }

  .badge-bestseller {
    background: #9b59b6;
  }

  .product-actions {
    position: absolute;
    top: 15px;
    left: 15px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .product-card:hover .product-actions {
    opacity: 1;
  }

  .action-btn {
    width: 40px;
    height: 40px;
    background: white;
    border: none;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 2px 10px rgba(0,0,0,0.1);
  }

  .action-btn:hover {
    background: #667eea;
    color: white;
    transform: scale(1.1);
  }

  .wishlist-btn:hover {
    background: #e74c3c;
  }

  .compare-btn:hover {
    background: #3498db;
  }

  .product-content {
    padding: 1.5rem;
  }

  .product-card.list-view .product-content {
    flex: 1;
    padding: 0;
  }

  .product-title {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
    line-height: 1.4;
  }

  .product-author {
    color: #666;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .product-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .rating {
    display: flex;
    gap: 0.1rem;
  }

  .rating ion-icon {
    color: #f39c12;
    font-size: 0.9rem;
  }

  .rating-text {
    color: #666;
    font-size: 0.8rem;
  }

  .product-price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 1rem;
  }

  .current-price {
    color: #667eea;
    font-weight: 700;
    font-size: 1.2rem;
  }

  .original-price {
    color: #999;
    text-decoration: line-through;
    font-size: 0.9rem;
  }

  .product-actions-bottom {
    display: flex;
    gap: 0.5rem;
  }

  .btn-add-cart {
    flex: 1;
    padding: 0.8rem 1rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    font-family: var(--ff-vazir);
    font-weight: 500;
    cursor: pointer;
    transition: background 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .btn-add-cart:hover {
    background: #764ba2;
  }

  .btn-quick-view {
    padding: 0.8rem;
    background: #f8f9fa;
    color: #666;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .btn-quick-view:hover {
    background: #667eea;
    color: white;
  }

  .loading-spinner {
    text-align: center;
    padding: 4rem 2rem;
  }

  .spinner {
    width: 50px;
    height: 50px;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  .no-results {
    text-align: center;
    padding: 4rem 2rem;
  }

  .no-results-content {
    max-width: 400px;
    margin: 0 auto;
  }

  .no-results-content ion-icon {
    font-size: 4rem;
    color: #ccc;
    margin-bottom: 1rem;
  }

  .no-results-content h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .no-results-content p {
    color: #666;
    margin-bottom: 2rem;
  }

  .pagination {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    margin-top: 3rem;
  }

  .pagination-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #e1e8ed;
    background: white;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: #666;
  }

  .pagination-btn:hover,
  .pagination-btn.active {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .pagination-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pagination-info {
    color: #666;
    font-size: 0.9rem;
    margin: 0 1rem;
  }

  @media (max-width: 768px) {
    .shop-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .shop-sidebar {
      position: static;
      order: 2;
    }

    .shop-main {
      order: 1;
    }

    .shop-toolbar {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .toolbar-right {
      justify-content: space-between;
    }

    .products-grid {
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 1.5rem;
    }

    .product-card.list-view {
      flex-direction: column;
    }

    .product-card.list-view .product-image {
      width: 100%;
      height: 200px;
      margin-left: 0;
      margin-bottom: 1rem;
    }

    .product-card.list-view .product-content {
      padding: 0;
    }
  }

  @media (max-width: 480px) {
    .products-grid {
      grid-template-columns: 1fr;
    }

    .toolbar-right {
      flex-direction: column;
      gap: 1rem;
    }

    .sort-wrapper {
      justify-content: space-between;
    }
  }
`;

// Add enhanced styles to document
const enhancedStyleSheet = document.createElement('style');
enhancedStyleSheet.textContent = enhancedShopStyles;
document.head.appendChild(enhancedStyleSheet);
