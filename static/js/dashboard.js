// Dashboard functionality
class DashboardManager {
  constructor() {
    this.currentUser = null;
    this.currentSection = 'overview';
    this.init();
  }

  init() {
    this.checkAuth();
    this.bindEvents();
    this.loadUserData();
    this.loadDashboardData();
  }

  checkAuth() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (!token || !user) {
      window.location.href = 'login.html';
      return;
    }
    
    this.currentUser = JSON.parse(user);
  }

  bindEvents() {
    // Navigation
    this.bindNavigation();
    
    // Logout
    this.bindLogout();
    
    // Forms
    this.bindForms();
  }

  bindNavigation() {
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const section = link.dataset.section;
        this.showSection(section);
        
        // Update active nav link
        navLinks.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      });
    });
  }

  bindLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm('آیا مطمئن هستید که می‌خواهید خارج شوید؟')) {
          AuthManager.logout();
        }
      });
    }
  }

  bindForms() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
      profileForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.updateProfile(e);
      });
    }

    // Password form
    const passwordForm = document.getElementById('passwordForm');
    if (passwordForm) {
      passwordForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.changePassword(e);
      });
    }
  }

  showSection(sectionName) {
    // Hide all sections
    const sections = document.querySelectorAll('.dashboard-section');
    sections.forEach(section => {
      section.classList.remove('active');
    });

    // Show selected section
    const targetSection = document.getElementById(sectionName);
    if (targetSection) {
      targetSection.classList.add('active');
      this.currentSection = sectionName;
      
      // Load section-specific data
      this.loadSectionData(sectionName);
    }
  }

  loadUserData() {
    if (!this.currentUser) return;

    // Update user info in sidebar
    const userName = document.getElementById('userName');
    const userEmail = document.getElementById('userEmail');
    const userAvatar = document.getElementById('userAvatar');

    if (userName) userName.textContent = this.currentUser.fullName || `${this.currentUser.firstName} ${this.currentUser.lastName}`;
    if (userEmail) userEmail.textContent = this.currentUser.email;
    if (userAvatar) userAvatar.src = this.currentUser.avatar || './assets/images/hero-banner.png';

    // Update profile form
    this.populateProfileForm();
  }

  populateProfileForm() {
    const form = document.getElementById('profileForm');
    if (!form || !this.currentUser) return;

    const fields = ['firstName', 'lastName', 'email', 'phone'];
    fields.forEach(field => {
      const input = form.querySelector(`[name="${field}"]`);
      if (input && this.currentUser[field]) {
        input.value = this.currentUser[field];
      }
    });
  }

  async loadDashboardData() {
    try {
      // Load user profile
      await this.loadUserProfile();
      
      // Load overview data
      await this.loadOverviewData();
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      this.showMessage('خطا در بارگذاری اطلاعات داشبورد', 'error');
    }
  }

  async loadUserProfile() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        this.currentUser = result.data;
        localStorage.setItem('user', JSON.stringify(result.data));
        this.loadUserData();
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
    }
  }

  async loadOverviewData() {
    try {
      const token = localStorage.getItem('token');
      
      // Load orders count
      const ordersResponse = await fetch('/api/orders?limit=1', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        if (ordersData.success) {
          document.getElementById('totalOrders').textContent = ordersData.data.pagination.totalItems;
        }
      }

      // Load wishlist count
      const wishlistResponse = await fetch('/api/users/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (wishlistResponse.ok) {
        const wishlistData = await wishlistResponse.json();
        if (wishlistData.success) {
          document.getElementById('wishlistCount').textContent = wishlistData.data.length;
        }
      }

      // Update last login
      if (this.currentUser && this.currentUser.lastLogin) {
        const lastLogin = new Date(this.currentUser.lastLogin).toLocaleDateString('fa-IR');
        document.getElementById('lastLogin').textContent = lastLogin;
      }

    } catch (error) {
      console.error('Error loading overview data:', error);
    }
  }

  loadSectionData(sectionName) {
    switch (sectionName) {
      case 'orders':
        this.loadOrders();
        break;
      case 'wishlist':
        this.loadWishlist();
        break;
      case 'addresses':
        this.loadAddresses();
        break;
    }
  }

  async loadOrders() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/orders', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        this.renderOrders(result.data.orders);
      }
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  }

  renderOrders(orders) {
    const ordersList = document.getElementById('ordersList');
    if (!ordersList) return;

    if (orders.length === 0) {
      ordersList.innerHTML = `
        <div class="empty-state">
          <ion-icon name="receipt-outline" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></ion-icon>
          <h3>سفارشی یافت نشد</h3>
          <p>هنوز سفارشی ثبت نکرده‌اید</p>
          <a href="shop.html" class="btn btn-primary">شروع خرید</a>
        </div>
      `;
      return;
    }

    ordersList.innerHTML = orders.map(order => `
      <div class="order-card">
        <div class="order-header">
          <div class="order-info">
            <h4 class="order-number">سفارش #${order.orderNumber}</h4>
            <span class="order-date">${new Date(order.createdAt).toLocaleDateString('fa-IR')}</span>
          </div>
          <div class="order-status">
            <span class="status-badge status-${order.orderStatus}">${this.getStatusText(order.orderStatus)}</span>
          </div>
        </div>
        
        <div class="order-items">
          ${order.items.slice(0, 3).map(item => `
            <div class="order-item">
              <img src="${item.book.images?.[0]?.url || './assets/images/book-1.png'}" alt="${item.book.title}" class="item-image">
              <div class="item-info">
                <h5 class="item-title">${item.book.title}</h5>
                <p class="item-author">${item.book.author}</p>
                <span class="item-quantity">تعداد: ${item.quantity}</span>
              </div>
              <div class="item-price">${this.formatPrice(item.price * item.quantity)}</div>
            </div>
          `).join('')}
          ${order.items.length > 3 ? `<p class="more-items">و ${order.items.length - 3} آیتم دیگر...</p>` : ''}
        </div>
        
        <div class="order-footer">
          <div class="order-total">
            <span class="total-label">مجموع:</span>
            <span class="total-amount">${this.formatPrice(order.total)}</span>
          </div>
          <div class="order-actions">
            <a href="#" class="btn btn-outline">مشاهده جزئیات</a>
            ${order.orderStatus === 'pending' ? '<button class="btn btn-danger">لغو سفارش</button>' : ''}
          </div>
        </div>
      </div>
    `).join('');
  }

  async loadWishlist() {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/wishlist', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        this.renderWishlist(result.data);
      }
    } catch (error) {
      console.error('Error loading wishlist:', error);
    }
  }

  renderWishlist(items) {
    const wishlistGrid = document.getElementById('wishlistGrid');
    if (!wishlistGrid) return;

    if (items.length === 0) {
      wishlistGrid.innerHTML = `
        <div class="empty-state">
          <ion-icon name="heart-outline" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></ion-icon>
          <h3>لیست علاقه‌مندی‌ها خالی است</h3>
          <p>کتاب‌هایی که دوست دارید را به لیست علاقه‌مندی‌ها اضافه کنید</p>
          <a href="shop.html" class="btn btn-primary">مشاهده محصولات</a>
        </div>
      `;
      return;
    }

    wishlistGrid.innerHTML = items.map(item => `
      <div class="wishlist-item">
        <div class="item-image">
          <img src="${item.images?.[0]?.url || './assets/images/book-1.png'}" alt="${item.title}" class="img-cover">
        </div>
        <div class="item-content">
          <h4 class="item-title">${item.title}</h4>
          <p class="item-author">${item.author}</p>
          <div class="item-price">${this.formatPrice(item.price)}</div>
          <div class="item-actions">
            <button class="btn btn-primary btn-sm">افزودن به سبد</button>
            <button class="btn btn-outline btn-sm remove-wishlist" data-id="${item._id}">حذف</button>
          </div>
        </div>
      </div>
    `).join('');

    // Bind remove wishlist events
    const removeBtns = wishlistGrid.querySelectorAll('.remove-wishlist');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const itemId = e.target.dataset.id;
        this.removeFromWishlist(itemId);
      });
    });
  }

  loadAddresses() {
    const addressesList = document.getElementById('addressesList');
    if (!addressesList) return;

    // Mock addresses data
    const addresses = [
      {
        id: 1,
        title: 'خانه',
        address: 'خیابان ولیعصر، پلاک ۱۲۳، تهران',
        isDefault: true
      },
      {
        id: 2,
        title: 'محل کار',
        address: 'خیابان آزادی، برج میلاد، طبقه ۱۵',
        isDefault: false
      }
    ];

    addressesList.innerHTML = `
      <div class="addresses-grid">
        ${addresses.map(addr => `
          <div class="address-card">
            <div class="address-header">
              <h4 class="address-title">${addr.title}</h4>
              ${addr.isDefault ? '<span class="default-badge">پیش‌فرض</span>' : ''}
            </div>
            <p class="address-text">${addr.address}</p>
            <div class="address-actions">
              <button class="btn btn-outline btn-sm">ویرایش</button>
              ${!addr.isDefault ? '<button class="btn btn-danger btn-sm">حذف</button>' : ''}
            </div>
          </div>
        `).join('')}
        <div class="add-address-card">
          <button class="add-address-btn">
            <ion-icon name="add-outline"></ion-icon>
            <span>افزودن آدرس جدید</span>
          </button>
        </div>
      </div>
    `;
  }

  async updateProfile(e) {
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      phone: formData.get('phone')
    };

    try {
      this.showLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        this.showMessage('پروفایل با موفقیت به‌روزرسانی شد', 'success');
        this.currentUser = result.data;
        localStorage.setItem('user', JSON.stringify(result.data));
        this.loadUserData();
      } else {
        this.showMessage(result.message || 'خطا در به‌روزرسانی پروفایل', 'error');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      this.showMessage('خطا در به‌روزرسانی پروفایل', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async changePassword(e) {
    const formData = new FormData(e.target);
    const data = {
      currentPassword: formData.get('currentPassword'),
      newPassword: formData.get('newPassword')
    };

    if (data.newPassword !== formData.get('confirmNewPassword')) {
      this.showMessage('رمز عبور جدید و تأیید آن مطابقت ندارند', 'error');
      return;
    }

    try {
      this.showLoading(true);
      
      const token = localStorage.getItem('token');
      const response = await fetch('/api/users/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();
      if (result.success) {
        this.showMessage('رمز عبور با موفقیت تغییر کرد', 'success');
        e.target.reset();
      } else {
        this.showMessage(result.message || 'خطا در تغییر رمز عبور', 'error');
      }
    } catch (error) {
      console.error('Error changing password:', error);
      this.showMessage('خطا در تغییر رمز عبور', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async removeFromWishlist(itemId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/users/wishlist/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const result = await response.json();
      if (result.success) {
        this.showMessage('کتاب از لیست علاقه‌مندی‌ها حذف شد', 'success');
        this.loadWishlist(); // Reload wishlist
        this.loadOverviewData(); // Update overview stats
      } else {
        this.showMessage('خطا در حذف از علاقه‌مندی‌ها', 'error');
      }
    } catch (error) {
      console.error('Error removing from wishlist:', error);
      this.showMessage('خطا در حذف از علاقه‌مندی‌ها', 'error');
    }
  }

  getStatusText(status) {
    const statusMap = {
      'pending': 'در انتظار',
      'confirmed': 'تأیید شده',
      'processing': 'در حال پردازش',
      'shipped': 'ارسال شده',
      'delivered': 'تحویل داده شده',
      'cancelled': 'لغو شده'
    };
    return statusMap[status] || status;
  }

  formatPrice(price) {
    return new Intl.NumberFormat('fa-IR').format(price) + ' تومان';
  }

  showLoading(show) {
    const submitBtns = document.querySelectorAll('.btn[type="submit"]');
    submitBtns.forEach(btn => {
      btn.disabled = show;
      if (show) {
        btn.innerHTML = '<div class="spinner-small"></div> در حال پردازش...';
      }
    });
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
}

// Initialize dashboard manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.dashboardManager = new DashboardManager();
});

// Add CSS for dashboard
const dashboardStyles = `
  .dashboard {
    min-height: 100vh;
    background: #f8f9fa;
    padding: 2rem 0;
  }

  .dashboard-content {
    display: grid;
    grid-template-columns: 300px 1fr;
    gap: 2rem;
    max-width: 1200px;
    margin: 0 auto;
  }

  .dashboard-sidebar {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    height: fit-content;
    position: sticky;
    top: 2rem;
  }

  .user-profile {
    text-align: center;
    margin-bottom: 2rem;
    padding-bottom: 2rem;
    border-bottom: 1px solid #e1e8ed;
  }

  .profile-avatar {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    overflow: hidden;
    margin: 0 auto 1rem;
    border: 3px solid #667eea;
  }

  .profile-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .profile-name {
    font-size: 1.2rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.3rem;
  }

  .profile-email {
    color: #666;
    font-size: 0.9rem;
  }

  .dashboard-nav {
    margin-bottom: 2rem;
  }

  .nav-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .nav-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    color: #666;
    text-decoration: none;
    border-radius: 10px;
    transition: all 0.3s ease;
    margin-bottom: 0.5rem;
  }

  .nav-link:hover,
  .nav-link.active {
    background: #667eea;
    color: white;
  }

  .nav-link ion-icon {
    font-size: 1.2rem;
  }

  .logout-section {
    border-top: 1px solid #e1e8ed;
    padding-top: 1rem;
  }

  .logout-btn {
    display: flex;
    align-items: center;
    gap: 1rem;
    width: 100%;
    padding: 1rem;
    background: #e74c3c;
    color: white;
    border: none;
    border-radius: 10px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .logout-btn:hover {
    background: #c0392b;
  }

  .dashboard-main {
    background: white;
    border-radius: 15px;
    padding: 2rem;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  }

  .dashboard-section {
    display: none;
  }

  .dashboard-section.active {
    display: block;
  }

  .section-header {
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #e1e8ed;
  }

  .section-title {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .section-subtitle {
    color: #666;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 1.5rem;
    margin-bottom: 3rem;
  }

  .stat-card {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1.5rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    border-radius: 15px;
  }

  .stat-icon {
    width: 50px;
    height: 50px;
    background: rgba(255,255,255,0.2);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 1.5rem;
  }

  .stat-number {
    font-size: 2rem;
    font-weight: 700;
    margin-bottom: 0.3rem;
  }

  .stat-label {
    font-size: 0.9rem;
    opacity: 0.9;
  }

  .recent-activity {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 15px;
  }

  .activity-title {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .activity-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .activity-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: white;
    border-radius: 10px;
  }

  .activity-icon {
    width: 40px;
    height: 40px;
    background: #667eea;
    color: white;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .activity-content {
    flex: 1;
  }

  .activity-text {
    color: #2c3e50;
    margin-bottom: 0.3rem;
  }

  .activity-time {
    color: #666;
    font-size: 0.8rem;
  }

  .order-card {
    border: 1px solid #e1e8ed;
    border-radius: 15px;
    padding: 1.5rem;
    margin-bottom: 1.5rem;
  }

  .order-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .order-number {
    color: #2c3e50;
    margin-bottom: 0.3rem;
  }

  .order-date {
    color: #666;
    font-size: 0.9rem;
  }

  .status-badge {
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .status-pending { background: #f39c12; color: white; }
  .status-confirmed { background: #3498db; color: white; }
  .status-processing { background: #9b59b6; color: white; }
  .status-shipped { background: #e67e22; color: white; }
  .status-delivered { background: #27ae60; color: white; }
  .status-cancelled { background: #e74c3c; color: white; }

  .order-items {
    margin-bottom: 1rem;
  }

  .order-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem 0;
    border-bottom: 1px solid #f8f9fa;
  }

  .order-item:last-child {
    border-bottom: none;
  }

  .item-image {
    width: 60px;
    height: 80px;
    object-fit: cover;
    border-radius: 8px;
  }

  .item-info {
    flex: 1;
  }

  .item-title {
    color: #2c3e50;
    margin-bottom: 0.3rem;
  }

  .item-author {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
  }

  .item-quantity {
    color: #999;
    font-size: 0.8rem;
  }

  .item-price {
    color: #667eea;
    font-weight: 600;
  }

  .order-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .total-amount {
    color: #2c3e50;
    font-weight: 700;
    font-size: 1.1rem;
  }

  .order-actions {
    display: flex;
    gap: 0.5rem;
  }

  .wishlist-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }

  .wishlist-item {
    border: 1px solid #e1e8ed;
    border-radius: 15px;
    overflow: hidden;
    transition: transform 0.3s ease;
  }

  .wishlist-item:hover {
    transform: translateY(-5px);
  }

  .wishlist-item .item-image {
    height: 200px;
  }

  .wishlist-item .item-content {
    padding: 1rem;
  }

  .wishlist-item .item-title {
    font-size: 1rem;
    margin-bottom: 0.5rem;
  }

  .wishlist-item .item-author {
    color: #666;
    font-size: 0.9rem;
    margin-bottom: 0.5rem;
  }

  .wishlist-item .item-price {
    color: #667eea;
    font-weight: 600;
    margin-bottom: 1rem;
  }

  .item-actions {
    display: flex;
    gap: 0.5rem;
  }

  .btn-sm {
    padding: 0.5rem 1rem;
    font-size: 0.8rem;
  }

  .addresses-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
    gap: 1.5rem;
  }

  .address-card {
    border: 1px solid #e1e8ed;
    border-radius: 15px;
    padding: 1.5rem;
  }

  .address-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
  }

  .address-title {
    color: #2c3e50;
  }

  .default-badge {
    background: #27ae60;
    color: white;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.7rem;
  }

  .address-text {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1rem;
  }

  .address-actions {
    display: flex;
    gap: 0.5rem;
  }

  .add-address-card {
    border: 2px dashed #e1e8ed;
    border-radius: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    min-height: 200px;
  }

  .add-address-btn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    background: none;
    border: none;
    color: #667eea;
    cursor: pointer;
    font-size: 1rem;
  }

  .add-address-btn ion-icon {
    font-size: 2rem;
  }

  .settings-content {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .setting-group {
    background: #f8f9fa;
    padding: 1.5rem;
    border-radius: 15px;
  }

  .setting-title {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .setting-item {
    margin-bottom: 1rem;
  }

  .setting-item:last-child {
    margin-bottom: 0;
  }

  .empty-state {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
  }

  .empty-state h3 {
    margin-bottom: 0.5rem;
  }

  .empty-state p {
    margin-bottom: 1.5rem;
  }

  .form-row {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 1rem;
  }

  .form-group {
    margin-bottom: 1.5rem;
  }

  .form-label {
    display: block;
    margin-bottom: 0.5rem;
    font-weight: 500;
    color: #2c3e50;
  }

  .form-input {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #e1e8ed;
    border-radius: 8px;
    font-family: var(--ff-vazir);
    transition: border-color 0.3s ease;
  }

  .form-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .checkbox-wrapper {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    cursor: pointer;
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
    color: #666;
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
    .dashboard-content {
      grid-template-columns: 1fr;
    }

    .dashboard-sidebar {
      position: static;
      margin-bottom: 2rem;
    }

    .stats-grid {
      grid-template-columns: 1fr;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .order-footer {
      flex-direction: column;
      gap: 1rem;
      align-items: stretch;
    }

    .order-actions {
      justify-content: center;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = dashboardStyles;
document.head.appendChild(styleSheet);
