// Cart functionality
class CartManager {
  constructor() {
    this.cart = this.loadCart();
    this.init();
  }

  init() {
    this.bindEvents();
    this.renderCart();
    this.updateCartSummary();
    this.loadRecommendedProducts();
  }

  bindEvents() {
    // Quantity controls
    this.bindQuantityControls();
    
    // Remove items
    this.bindRemoveButtons();
    
    // Wishlist buttons
    this.bindWishlistButtons();
    
    // Coupon code
    this.bindCouponCode();
    
    // Checkout button
    this.bindCheckoutButton();
  }

  bindQuantityControls() {
    const quantityBtns = document.querySelectorAll('.quantity-btn');
    quantityBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const action = e.currentTarget.dataset.action;
        const cartItem = e.currentTarget.closest('.cart-item');
        const itemId = cartItem.dataset.id;
        const quantityInput = cartItem.querySelector('.quantity-input');
        
        let newQuantity = parseInt(quantityInput.value);
        
        if (action === 'increase' && newQuantity < 10) {
          newQuantity++;
        } else if (action === 'decrease' && newQuantity > 1) {
          newQuantity--;
        }
        
        this.updateQuantity(itemId, newQuantity);
        quantityInput.value = newQuantity;
        this.updateItemTotal(cartItem);
        this.updateCartSummary();
      });
    });

    // Direct input change
    const quantityInputs = document.querySelectorAll('.quantity-input');
    quantityInputs.forEach(input => {
      input.addEventListener('change', (e) => {
        const cartItem = e.target.closest('.cart-item');
        const itemId = cartItem.dataset.id;
        const newQuantity = Math.max(1, Math.min(10, parseInt(e.target.value) || 1));
        
        this.updateQuantity(itemId, newQuantity);
        e.target.value = newQuantity;
        this.updateItemTotal(cartItem);
        this.updateCartSummary();
      });
    });
  }

  bindRemoveButtons() {
    const removeBtns = document.querySelectorAll('.remove-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        const itemId = cartItem.dataset.id;
        
        if (confirm('آیا مطمئن هستید که می‌خواهید این محصول را از سبد خرید حذف کنید؟')) {
          this.removeItem(itemId);
          cartItem.remove();
          this.updateCartSummary();
          this.checkEmptyCart();
        }
      });
    });
  }

  bindWishlistButtons() {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    wishlistBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const cartItem = e.target.closest('.cart-item');
        const itemId = cartItem.dataset.id;
        
        this.addToWishlist(itemId);
        this.showMessage('محصول به لیست علاقه‌مندی‌ها اضافه شد', 'success');
      });
    });
  }

  bindCouponCode() {
    const applyBtn = document.getElementById('applyCoupon');
    const couponInput = document.getElementById('couponInput');
    
    if (applyBtn && couponInput) {
      applyBtn.addEventListener('click', () => {
        const couponCode = couponInput.value.trim();
        if (couponCode) {
          this.applyCoupon(couponCode);
        }
      });
      
      couponInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
          const couponCode = couponInput.value.trim();
          if (couponCode) {
            this.applyCoupon(couponCode);
          }
        }
      });
    }
  }

  bindCheckoutButton() {
    const checkoutBtn = document.querySelector('.checkout-btn');
    if (checkoutBtn) {
      checkoutBtn.addEventListener('click', (e) => {
        if (this.cart.length === 0) {
          e.preventDefault();
          this.showMessage('سبد خرید شما خالی است', 'error');
        }
      });
    }
  }

  loadCart() {
    const savedCart = localStorage.getItem('cart');
    return savedCart ? JSON.parse(savedCart) : [];
  }

  saveCart() {
    localStorage.setItem('cart', JSON.stringify(this.cart));
    this.updateCartCount();
  }

  updateQuantity(itemId, quantity) {
    const item = this.cart.find(item => item.id === itemId);
    if (item) {
      item.quantity = quantity;
      this.saveCart();
    }
  }

  removeItem(itemId) {
    this.cart = this.cart.filter(item => item.id !== itemId);
    this.saveCart();
  }

  addToWishlist(itemId) {
    const item = this.cart.find(item => item.id === itemId);
    if (item) {
      let wishlist = JSON.parse(localStorage.getItem('wishlist') || '[]');
      if (!wishlist.find(w => w.id === itemId)) {
        wishlist.push(item);
        localStorage.setItem('wishlist', JSON.stringify(wishlist));
      }
    }
  }

  async applyCoupon(couponCode) {
    try {
      this.showLoading(true);
      
      const response = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: couponCode,
          total: this.calculateSubtotal()
        })
      });

      const result = await response.json();
      
      if (result.success) {
        this.coupon = result.data;
        this.updateCartSummary();
        this.showCouponMessage('کد تخفیف با موفقیت اعمال شد', 'success');
      } else {
        this.showCouponMessage(result.message || 'کد تخفیف نامعتبر است', 'error');
      }
    } catch (error) {
      console.error('Error applying coupon:', error);
      this.showCouponMessage('خطا در اعمال کد تخفیف', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  renderCart() {
    const cartItems = document.getElementById('cartItems');
    const emptyCart = document.getElementById('emptyCart');
    
    if (this.cart.length === 0) {
      cartItems.style.display = 'none';
      emptyCart.style.display = 'block';
      return;
    }
    
    cartItems.style.display = 'block';
    emptyCart.style.display = 'none';
    
    cartItems.innerHTML = this.cart.map(item => this.createCartItemHTML(item)).join('');
    
    // Re-bind events for new items
    this.bindEvents();
  }

  createCartItemHTML(item) {
    const discount = item.originalPrice > item.price ? 
      Math.round(((item.originalPrice - item.price) / item.originalPrice) * 100) : 0;
    
    return `
      <div class="cart-item" data-id="${item.id}">
        <div class="item-image">
          <img src="${item.image}" alt="${item.title}" class="img-cover">
          ${discount > 0 ? `<span class="discount-badge">${discount}%</span>` : ''}
        </div>
        
        <div class="item-details">
          <h3 class="item-title">${item.title}</h3>
          <p class="item-author">${item.author}</p>
          <div class="item-meta">
            <span class="item-category">${item.category}</span>
            <div class="item-rating">
              <div class="rating">
                ${this.generateStars(item.rating)}
              </div>
              <span class="rating-text">(${item.rating})</span>
            </div>
          </div>
        </div>

        <div class="item-price">
          <span class="current-price">${this.formatPrice(item.price)}</span>
          ${item.originalPrice > item.price ? 
            `<span class="original-price">${this.formatPrice(item.originalPrice)}</span>` : ''}
        </div>

        <div class="item-quantity">
          <button class="quantity-btn" data-action="decrease">
            <ion-icon name="remove-outline"></ion-icon>
          </button>
          <input type="number" class="quantity-input" value="${item.quantity}" min="1" max="10">
          <button class="quantity-btn" data-action="increase">
            <ion-icon name="add-outline"></ion-icon>
          </button>
        </div>

        <div class="item-total">
          <span class="total-price">${this.formatPrice(item.price * item.quantity)}</span>
        </div>

        <div class="item-actions">
          <button class="action-btn wishlist-btn" title="افزودن به علاقه‌مندی‌ها">
            <ion-icon name="heart-outline"></ion-icon>
          </button>
          <button class="action-btn remove-btn" title="حذف از سبد خرید">
            <ion-icon name="trash-outline"></ion-icon>
          </button>
        </div>
      </div>
    `;
  }

  generateStars(rating) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    
    let stars = '';
    
    for (let i = 0; i < fullStars; i++) {
      stars += '<ion-icon name="star"></ion-icon>';
    }
    
    if (hasHalfStar) {
      stars += '<ion-icon name="star-half"></ion-icon>';
    }
    
    for (let i = 0; i < emptyStars; i++) {
      stars += '<ion-icon name="star-outline"></ion-icon>';
    }
    
    return stars;
  }

  updateItemTotal(cartItem) {
    const quantity = parseInt(cartItem.querySelector('.quantity-input').value);
    const price = this.parsePrice(cartItem.querySelector('.current-price').textContent);
    const totalPrice = cartItem.querySelector('.total-price');
    
    totalPrice.textContent = this.formatPrice(price * quantity);
  }

  updateCartSummary() {
    const itemCount = document.getElementById('itemCount');
    const subtotal = document.getElementById('subtotal');
    const shipping = document.getElementById('shipping');
    const discount = document.getElementById('discount');
    const total = document.getElementById('total');
    
    const subtotalAmount = this.calculateSubtotal();
    const shippingAmount = this.calculateShipping();
    const discountAmount = this.coupon ? this.coupon.discount : 0;
    const totalAmount = subtotalAmount + shippingAmount - discountAmount;
    
    if (itemCount) itemCount.textContent = this.cart.length;
    if (subtotal) subtotal.textContent = this.formatPrice(subtotalAmount);
    if (shipping) shipping.textContent = this.formatPrice(shippingAmount);
    if (discount) {
      discount.textContent = discountAmount > 0 ? `-${this.formatPrice(discountAmount)}` : '0 تومان';
      discount.style.display = discountAmount > 0 ? 'block' : 'none';
    }
    if (total) total.textContent = this.formatPrice(totalAmount);
  }

  calculateSubtotal() {
    return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  calculateShipping() {
    const subtotal = this.calculateSubtotal();
    return subtotal > 500000 ? 0 : 25000; // Free shipping over 500,000
  }

  checkEmptyCart() {
    if (this.cart.length === 0) {
      this.renderCart();
    }
  }

  async loadRecommendedProducts() {
    try {
      const response = await fetch('/api/books/recommended?limit=4');
      const result = await response.json();
      
      if (result.success) {
        this.renderRecommendedProducts(result.data);
      }
    } catch (error) {
      console.error('Error loading recommended products:', error);
    }
  }

  renderRecommendedProducts(products) {
    const recommendedGrid = document.getElementById('recommendedGrid');
    if (!recommendedGrid) return;
    
    recommendedGrid.innerHTML = products.map(product => `
      <div class="product-card">
        <div class="product-image">
          <img src="${product.imageUrl}" alt="${product.title}" class="img-cover">
          <div class="product-actions">
            <button class="action-btn quick-view" title="مشاهده سریع">
              <ion-icon name="eye-outline"></ion-icon>
            </button>
            <button class="action-btn add-wishlist" title="افزودن به علاقه‌مندی‌ها">
              <ion-icon name="heart-outline"></ion-icon>
            </button>
            <button class="action-btn add-cart" title="افزودن به سبد خرید">
              <ion-icon name="bag-handle-outline"></ion-icon>
            </button>
          </div>
        </div>
        <div class="product-content">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-author">${product.author}</p>
          <div class="product-price">
            <span class="current-price">${this.formatPrice(product.price)}</span>
            ${product.originalPrice > product.price ? 
              `<span class="original-price">${this.formatPrice(product.originalPrice)}</span>` : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  showCouponMessage(message, type) {
    const couponMessage = document.getElementById('couponMessage');
    if (couponMessage) {
      couponMessage.textContent = message;
      couponMessage.className = `coupon-message ${type}`;
      
      setTimeout(() => {
        couponMessage.textContent = '';
        couponMessage.className = 'coupon-message';
      }, 5000);
    }
  }

  showLoading(show) {
    const applyBtn = document.getElementById('applyCoupon');
    if (applyBtn) {
      applyBtn.disabled = show;
      applyBtn.innerHTML = show ? 
        '<div class="spinner-small"></div> در حال بررسی...' : 
        'اعمال';
    }
  }

  showMessage(message, type = 'info') {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
      <div class="toast-content">
        <ion-icon name="${this.getToastIcon(type)}"></ion-icon>
        <span>${message}</span>
      </div>
    `;
    
    document.body.appendChild(toast);
    
    setTimeout(() => {
      toast.classList.add('show');
    }, 100);
    
    setTimeout(() => {
      toast.classList.remove('show');
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 5000);
  }

  getToastIcon(type) {
    switch (type) {
      case 'success': return 'checkmark-circle';
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      default: return 'information-circle';
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  parsePrice(priceString) {
    return parseInt(priceString.replace(/[^\d]/g, ''));
  }

  updateCartCount() {
    const cartCount = document.getElementById('cartCount');
    if (cartCount) {
      cartCount.textContent = this.cart.length;
    }
  }
}

// Initialize cart manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.cartManager = new CartManager();
});

// Add CSS for cart page
const cartStyles = `
  .cart {
    padding: 2rem 0;
  }

  .cart-content {
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 3rem;
    margin-bottom: 4rem;
  }

  .cart-items {
    display: flex;
    flex-direction: column;
    gap: 1.5rem;
  }

  .cart-item {
    display: grid;
    grid-template-columns: 120px 1fr auto auto auto auto;
    gap: 1.5rem;
    align-items: center;
    padding: 1.5rem;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    transition: transform 0.3s ease;
  }

  .cart-item:hover {
    transform: translateY(-2px);
  }

  .item-image {
    position: relative;
    width: 120px;
    height: 160px;
    border-radius: 10px;
    overflow: hidden;
  }

  .item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .discount-badge {
    position: absolute;
    top: 10px;
    right: 10px;
    background: #e74c3c;
    color: white;
    padding: 0.3rem 0.5rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 600;
  }

  .item-details {
    flex: 1;
  }

  .item-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .item-author {
    color: #666;
    margin-bottom: 0.5rem;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .item-category {
    background: #f8f9fa;
    color: #667eea;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  .item-rating {
    display: flex;
    align-items: center;
    gap: 0.5rem;
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

  .item-price {
    text-align: center;
  }

  .current-price {
    display: block;
    color: #667eea;
    font-weight: 600;
    font-size: 1.1rem;
  }

  .original-price {
    display: block;
    color: #999;
    text-decoration: line-through;
    font-size: 0.9rem;
  }

  .item-quantity {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .quantity-btn {
    width: 35px;
    height: 35px;
    border: 1px solid #e1e8ed;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .quantity-btn:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .quantity-input {
    width: 60px;
    text-align: center;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    padding: 0.5rem;
    font-family: var(--ff-vazir);
  }

  .item-total {
    text-align: center;
  }

  .total-price {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .item-actions {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
  }

  .action-btn {
    width: 40px;
    height: 40px;
    border: 1px solid #e1e8ed;
    background: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .action-btn:hover {
    background: #667eea;
    color: white;
    border-color: #667eea;
  }

  .wishlist-btn:hover {
    background: #e74c3c;
    border-color: #e74c3c;
  }

  .remove-btn:hover {
    background: #e74c3c;
    border-color: #e74c3c;
  }

  .empty-cart {
    grid-column: 1 / -1;
    text-align: center;
    padding: 4rem 2rem;
  }

  .empty-cart-content {
    max-width: 400px;
    margin: 0 auto;
  }

  .empty-cart-content ion-icon {
    font-size: 4rem;
    color: #ccc;
    margin-bottom: 1rem;
  }

  .empty-cart-content h3 {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .empty-cart-content p {
    color: #666;
    margin-bottom: 2rem;
  }

  .cart-summary {
    position: sticky;
    top: 2rem;
    height: fit-content;
  }

  .summary-card {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .summary-title {
    color: #2c3e50;
    margin-bottom: 1.5rem;
    text-align: center;
  }

  .summary-details {
    margin-bottom: 2rem;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    border-bottom: 1px solid #f8f9fa;
  }

  .summary-row:last-child {
    border-bottom: none;
  }

  .summary-row.total {
    border-top: 2px solid #667eea;
    margin-top: 1rem;
    padding-top: 1rem;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .summary-label {
    color: #666;
  }

  .summary-value {
    color: #2c3e50;
    font-weight: 500;
  }

  .summary-value.discount {
    color: #27ae60;
  }

  .coupon-section {
    margin-bottom: 2rem;
    padding: 1.5rem;
    background: #f8f9fa;
    border-radius: 10px;
  }

  .coupon-title {
    color: #2c3e50;
    margin-bottom: 1rem;
    font-size: 1rem;
  }

  .coupon-input-group {
    display: flex;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
  }

  .coupon-input {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    font-family: var(--ff-vazir);
  }

  .coupon-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .coupon-message {
    font-size: 0.9rem;
    padding: 0.5rem;
    border-radius: 5px;
    text-align: center;
  }

  .coupon-message.success {
    background: #d4edda;
    color: #155724;
  }

  .coupon-message.error {
    background: #f8d7da;
    color: #721c24;
  }

  .checkout-actions {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .checkout-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .continue-shopping {
    width: 100%;
    padding: 0.8rem;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .security-badges {
    display: flex;
    justify-content: space-around;
    padding-top: 1rem;
    border-top: 1px solid #f8f9fa;
  }

  .security-item {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.3rem;
    color: #666;
    font-size: 0.8rem;
  }

  .security-item ion-icon {
    font-size: 1.2rem;
    color: #27ae60;
  }

  .recommended-section {
    margin-top: 4rem;
  }

  .recommended-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 2rem;
    margin-top: 2rem;
  }

  .product-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    transition: transform 0.3s ease;
  }

  .product-card:hover {
    transform: translateY(-5px);
  }

  .product-image {
    position: relative;
    height: 200px;
    overflow: hidden;
  }

  .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .product-actions {
    position: absolute;
    top: 10px;
    right: 10px;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  .product-card:hover .product-actions {
    opacity: 1;
  }

  .product-content {
    padding: 1.5rem;
  }

  .product-title {
    color: #2c3e50;
    margin-bottom: 0.5rem;
    font-size: 1rem;
  }

  .product-author {
    color: #666;
    margin-bottom: 1rem;
    font-size: 0.9rem;
  }

  .product-price {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toast {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 1rem 1.5rem;
    border-radius: 10px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    max-width: 400px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.2);
  }

  .toast.show {
    transform: translateX(0);
  }

  .toast-content {
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }

  .toast-success {
    background: linear-gradient(135deg, #27ae60 0%, #2ecc71 100%);
  }

  .toast-error {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }

  .toast-info {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  }

  .spinner-small {
    width: 16px;
    height: 16px;
    border: 2px solid rgba(255,255,255,0.3);
    border-top: 2px solid white;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
    margin-left: 0.5rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @media (max-width: 768px) {
    .cart-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .cart-item {
      grid-template-columns: 80px 1fr;
      gap: 1rem;
    }

    .item-image {
      width: 80px;
      height: 100px;
    }

    .item-quantity,
    .item-total,
    .item-actions {
      grid-column: 1 / -1;
      justify-self: center;
    }

    .item-actions {
      flex-direction: row;
      justify-content: center;
    }

    .cart-summary {
      position: static;
    }

    .recommended-grid {
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = cartStyles;
document.head.appendChild(styleSheet);
