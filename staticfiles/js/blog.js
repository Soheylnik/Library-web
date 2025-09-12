// Blog functionality
class BlogManager {
  constructor() {
    this.currentPage = 1;
    this.itemsPerPage = 6;
    this.currentFilters = {
      category: '',
      search: '',
      featured: false
    };
    this.posts = [];
    this.totalPosts = 0;
    
    this.init();
  }

  init() {
    this.bindEvents();
    this.loadFeaturedPost();
    this.loadPosts();
    this.loadCategories();
    this.loadRecentPosts();
  }

  bindEvents() {
    // Search functionality
    const blogSearch = document.getElementById('blogSearch');
    const blogSearchBtn = document.getElementById('blogSearchBtn');
    
    if (blogSearch) {
      blogSearch.addEventListener('input', this.debounce(() => {
        this.currentFilters.search = blogSearch.value;
        this.currentPage = 1;
        this.loadPosts();
      }, 500));
    }

    if (blogSearchBtn) {
      blogSearchBtn.addEventListener('click', () => {
        this.currentFilters.search = blogSearch.value;
        this.currentPage = 1;
        this.loadPosts();
      });
    }
  }

  async loadFeaturedPost() {
    try {
      const response = await fetch('/api/blog/featured');
      const data = await response.json();

      if (data.success && data.data.length > 0) {
        const featuredPost = data.data[0];
        this.renderFeaturedPost(featuredPost);
      }
    } catch (error) {
      console.error('Error loading featured post:', error);
    }
  }

  async loadPosts() {
    try {
      this.showLoading(true);
      
      const params = new URLSearchParams({
        page: this.currentPage,
        limit: this.itemsPerPage
      });

      if (this.currentFilters.category) {
        params.append('category', this.currentFilters.category);
      }

      if (this.currentFilters.search) {
        params.append('search', this.currentFilters.search);
      }

      if (this.currentFilters.featured) {
        params.append('featured', 'true');
      }

      const response = await fetch(`/api/blog?${params}`);
      const data = await response.json();

      if (data.success) {
        this.posts = data.data.posts;
        this.totalPosts = data.data.pagination.totalItems;
        this.renderPosts();
        this.renderPagination(data.data.pagination);
      } else {
        this.showError('خطا در بارگذاری مقالات');
      }
    } catch (error) {
      console.error('Error loading posts:', error);
      this.showError('خطا در بارگذاری مقالات');
    } finally {
      this.showLoading(false);
    }
  }

  async loadCategories() {
    try {
      const response = await fetch('/api/blog/categories/list');
      const data = await response.json();

      if (data.success) {
        this.renderCategories(data.data);
      }
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  }

  async loadRecentPosts() {
    try {
      const response = await fetch('/api/blog?limit=5');
      const data = await response.json();

      if (data.success) {
        this.renderRecentPosts(data.data.posts);
      }
    } catch (error) {
      console.error('Error loading recent posts:', error);
    }
  }

  renderFeaturedPost(post) {
    const featuredPostEl = document.getElementById('featuredPost');
    if (!featuredPostEl) return;

    const publishedDate = new Date(post.publishedAt).toLocaleDateString('fa-IR');
    const readingTime = post.readingTime || Math.ceil(post.content.split(' ').length / 200);

    featuredPostEl.innerHTML = `
      <div class="featured-post-card">
        <div class="featured-post-image">
          <img src="${post.featuredImage?.url || './assets/images/blog-1.jpg'}" 
               alt="${post.title}" class="img-cover">
          <div class="featured-badge">مقاله ویژه</div>
        </div>
        
        <div class="featured-post-content">
          <div class="post-meta">
            <span class="post-category">${post.category}</span>
            <span class="post-date">${publishedDate}</span>
            <span class="post-reading-time">${readingTime} دقیقه مطالعه</span>
          </div>
          
          <h2 class="featured-post-title">
            <a href="blog-detail.html?slug=${post.slug}">${post.title}</a>
          </h2>
          
          <p class="featured-post-excerpt">${post.excerpt}</p>
          
          <div class="post-stats">
            <span class="post-views">
              <ion-icon name="eye-outline"></ion-icon>
              ${post.views || 0} بازدید
            </span>
            <span class="post-likes">
              <ion-icon name="heart-outline"></ion-icon>
              ${post.likes || 0} لایک
            </span>
            <span class="post-comments">
              <ion-icon name="chatbubble-outline"></ion-icon>
              ${post.commentCount || 0} نظر
            </span>
          </div>
          
          <a href="blog-detail.html?slug=${post.slug}" class="btn btn-primary">
            ادامه مطلب
            <ion-icon name="arrow-forward"></ion-icon>
          </a>
        </div>
      </div>
    `;
  }

  renderPosts() {
    const blogPostsEl = document.getElementById('blogPosts');
    if (!blogPostsEl) return;

    if (this.posts.length === 0) {
      blogPostsEl.innerHTML = `
        <div class="no-posts">
          <ion-icon name="document-text-outline" style="font-size: 4rem; color: #ccc; margin-bottom: 1rem;"></ion-icon>
          <h3>مقاله‌ای یافت نشد</h3>
          <p>لطفاً فیلترهای جستجو را تغییر دهید</p>
        </div>
      `;
      return;
    }

    blogPostsEl.innerHTML = this.posts.map(post => this.createPostCard(post)).join('');
  }

  createPostCard(post) {
    const publishedDate = new Date(post.publishedAt).toLocaleDateString('fa-IR');
    const readingTime = post.readingTime || Math.ceil((post.excerpt || '').split(' ').length / 200);

    return `
      <article class="blog-card">
        <figure class="card-banner img-holder" style="--width: 600; --height: 400;">
          <img src="${post.featuredImage?.url || './assets/images/blog-1.jpg'}" 
               alt="${post.title}" class="img-cover">
        </figure>

        <div class="card-content">
          <div class="post-meta">
            <span class="post-category">${post.category}</span>
            <span class="post-date">${publishedDate}</span>
            <span class="post-reading-time">${readingTime} دقیقه</span>
          </div>

          <h3 class="h3">
            <a href="blog-detail.html?slug=${post.slug}" class="card-title">${post.title}</a>
          </h3>

          <p class="card-text">${post.excerpt}</p>

          <div class="post-stats">
            <span class="post-views">
              <ion-icon name="eye-outline"></ion-icon>
              ${post.views || 0}
            </span>
            <span class="post-likes">
              <ion-icon name="heart-outline"></ion-icon>
              ${post.likes || 0}
            </span>
            <span class="post-comments">
              <ion-icon name="chatbubble-outline"></ion-icon>
              ${post.commentCount || 0}
            </span>
          </div>

          <a href="blog-detail.html?slug=${post.slug}" class="btn card-btn">
            ادامه مطلب...
            <ion-icon name="arrow-forward"></ion-icon>
          </a>
        </div>
      </article>
    `;
  }

  renderCategories(categories) {
    const categoryListEl = document.getElementById('categoryList');
    if (!categoryListEl) return;

    categoryListEl.innerHTML = categories.map(category => `
      <li>
        <a href="#" class="category-link" data-category="${category}">
          ${category}
          <span class="category-count">(${Math.floor(Math.random() * 20) + 1})</span>
        </a>
      </li>
    `).join('');

    // Add click event listeners
    const categoryLinks = categoryListEl.querySelectorAll('.category-link');
    categoryLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        
        // Remove active class from all links
        categoryLinks.forEach(l => l.classList.remove('active'));
        
        // Add active class to clicked link
        link.classList.add('active');
        
        this.currentFilters.category = link.dataset.category;
        this.currentPage = 1;
        this.loadPosts();
      });
    });
  }

  renderRecentPosts(posts) {
    const recentPostsEl = document.getElementById('recentPosts');
    if (!recentPostsEl) return;

    recentPostsEl.innerHTML = posts.map(post => {
      const publishedDate = new Date(post.publishedAt).toLocaleDateString('fa-IR');
      
      return `
        <div class="recent-post-item">
          <div class="recent-post-image">
            <img src="${post.featuredImage?.url || './assets/images/blog-1.jpg'}" 
                 alt="${post.title}" class="img-cover">
          </div>
          
          <div class="recent-post-content">
            <h4 class="recent-post-title">
              <a href="blog-detail.html?slug=${post.slug}">${post.title}</a>
            </h4>
            <span class="recent-post-date">${publishedDate}</span>
          </div>
        </div>
      `;
    }).join('');
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
        <button class="pagination-btn" onclick="blogManager.goToPage(${pagination.currentPage - 1})">
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
        <button class="pagination-btn ${isActive}" onclick="blogManager.goToPage(${i})">
          ${i}
        </button>
      `;
    }

    // Next button
    if (pagination.currentPage < pagination.totalPages) {
      paginationHTML += `
        <button class="pagination-btn" onclick="blogManager.goToPage(${pagination.currentPage + 1})">
          بعدی
          <ion-icon name="chevron-forward"></ion-icon>
        </button>
      `;
    }

    paginationEl.innerHTML = paginationHTML;
  }

  goToPage(page) {
    this.currentPage = page;
    this.loadPosts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  showLoading(show) {
    const loadingSpinner = document.getElementById('loadingSpinner');
    if (loadingSpinner) {
      loadingSpinner.style.display = show ? 'flex' : 'none';
    }
  }

  showError(message) {
    // Create toast notification
    const toast = document.createElement('div');
    toast.className = 'toast toast-error';
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

// Initialize blog manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.blogManager = new BlogManager();
});

// Add CSS for blog page styles
const blogStyles = `
  .blog-content {
    display: grid;
    grid-template-columns: 1fr 300px;
    gap: 4rem;
    margin-top: 2rem;
  }

  .featured-post {
    margin-bottom: 4rem;
  }

  .featured-post-card {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .featured-post-image {
    position: relative;
    overflow: hidden;
  }

  .featured-post-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .featured-post-card:hover .featured-post-image img {
    transform: scale(1.05);
  }

  .featured-badge {
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 20px;
    font-size: 0.8rem;
    font-weight: 500;
  }

  .featured-post-content {
    padding: 2rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .post-meta {
    display: flex;
    align-items: center;
    gap: 1rem;
    margin-bottom: 1rem;
    font-size: 0.9rem;
    color: #666;
  }

  .post-category {
    background: #f8f9fa;
    color: #667eea;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    font-weight: 500;
  }

  .featured-post-title {
    font-size: 1.8rem;
    margin-bottom: 1rem;
    line-height: 1.4;
  }

  .featured-post-title a {
    color: #2c3e50;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .featured-post-title a:hover {
    color: #667eea;
  }

  .featured-post-excerpt {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .post-stats {
    display: flex;
    align-items: center;
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    font-size: 0.9rem;
    color: #666;
  }

  .post-stats span {
    display: flex;
    align-items: center;
    gap: 0.3rem;
  }

  .blog-posts {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 2rem;
    margin-bottom: 3rem;
  }

  .blog-card {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
    transition: transform 0.3s ease, box-shadow 0.3s ease;
  }

  .blog-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 15px 40px rgba(0,0,0,0.15);
  }

  .blog-card .card-banner {
    position: relative;
    overflow: hidden;
  }

  .blog-card .card-banner img {
    transition: transform 0.3s ease;
  }

  .blog-card:hover .card-banner img {
    transform: scale(1.05);
  }

  .blog-card .card-content {
    padding: 1.5rem;
  }

  .blog-card .card-title {
    color: #2c3e50;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .blog-card .card-title:hover {
    color: #667eea;
  }

  .blog-card .card-text {
    color: #666;
    line-height: 1.6;
    margin: 1rem 0;
  }

  .blog-card .card-btn {
    display: inline-flex;
    align-items: center;
    gap: 0.5rem;
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
    transition: color 0.3s ease;
  }

  .blog-card .card-btn:hover {
    color: #764ba2;
  }

  .blog-sidebar {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .sidebar-widget {
    background: white;
    padding: 1.5rem;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  }

  .widget-title {
    font-size: 1.2rem;
    color: #2c3e50;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 2px solid #f8f9fa;
  }

  .search-widget {
    display: flex;
    gap: 0.5rem;
  }

  .search-input {
    flex: 1;
    padding: 0.8rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: var(--ff-vazir);
  }

  .search-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .search-btn {
    padding: 0.8rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .search-btn:hover {
    background: #764ba2;
  }

  .category-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .category-link {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0.8rem 0;
    color: #666;
    text-decoration: none;
    border-bottom: 1px solid #f8f9fa;
    transition: color 0.3s ease;
  }

  .category-link:hover,
  .category-link.active {
    color: #667eea;
  }

  .category-count {
    background: #f8f9fa;
    color: #999;
    padding: 0.2rem 0.5rem;
    border-radius: 10px;
    font-size: 0.8rem;
  }

  .recent-posts {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .recent-post-item {
    display: flex;
    gap: 1rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid #f8f9fa;
  }

  .recent-post-item:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  .recent-post-image {
    width: 60px;
    height: 60px;
    border-radius: 8px;
    overflow: hidden;
    flex-shrink: 0;
  }

  .recent-post-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .recent-post-content {
    flex: 1;
  }

  .recent-post-title {
    font-size: 0.9rem;
    margin-bottom: 0.3rem;
    line-height: 1.4;
  }

  .recent-post-title a {
    color: #2c3e50;
    text-decoration: none;
    transition: color 0.3s ease;
  }

  .recent-post-title a:hover {
    color: #667eea;
  }

  .recent-post-date {
    font-size: 0.8rem;
    color: #999;
  }

  .tags-cloud {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .tag {
    background: #f8f9fa;
    color: #666;
    padding: 0.3rem 0.8rem;
    border-radius: 15px;
    text-decoration: none;
    font-size: 0.8rem;
    transition: all 0.3s ease;
  }

  .tag:hover {
    background: #667eea;
    color: white;
  }

  .no-posts {
    text-align: center;
    padding: 4rem 2rem;
    color: #666;
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
    border-top: 4px solid #667eea;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin-bottom: 1rem;
  }

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
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

  .toast-error {
    background-color: #e74c3c;
  }

  @media (max-width: 768px) {
    .blog-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .featured-post-card {
      grid-template-columns: 1fr;
    }

    .blog-posts {
      grid-template-columns: 1fr;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = blogStyles;
document.head.appendChild(styleSheet);
