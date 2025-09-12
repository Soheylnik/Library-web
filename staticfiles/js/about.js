// About page functionality
class AboutManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.animateStats();
  }

  bindEvents() {
    // Team member social links
    this.bindSocialLinks();
    
    // Contact CTA buttons
    this.bindCTAButtons();
  }

  bindSocialLinks() {
    const socialLinks = document.querySelectorAll('.member-social .social-link');
    socialLinks.forEach(link => {
      link.addEventListener('click', (e) => {
        e.preventDefault();
        const platform = link.querySelector('ion-icon').name;
        this.handleSocialClick(platform);
      });
    });
  }

  bindCTAButtons() {
    const ctaButtons = document.querySelectorAll('.cta-buttons .btn');
    ctaButtons.forEach(btn => {
      btn.addEventListener('click', (e) => {
        if (btn.textContent.includes('تماس با ما')) {
          e.preventDefault();
          window.location.href = 'contact.html';
        } else if (btn.textContent.includes('مشاهده محصولات')) {
          e.preventDefault();
          window.location.href = 'shop.html';
        }
      });
    });
  }

  animateStats() {
    const stats = document.querySelectorAll('.stat-number[data-count]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          this.animateNumber(entry.target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    stats.forEach(stat => {
      observer.observe(stat);
    });
  }

  animateNumber(element) {
    const target = parseInt(element.dataset.count);
    const duration = 2000; // 2 seconds
    const increment = target / (duration / 16); // 60fps
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        current = target;
        clearInterval(timer);
      }
      
      // Format number based on target
      if (target >= 1000) {
        element.textContent = this.formatLargeNumber(Math.floor(current));
      } else {
        element.textContent = Math.floor(current);
      }
    }, 16);
  }

  formatLargeNumber(num) {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
  }

  handleSocialClick(platform) {
    const platformNames = {
      'logo-linkedin': 'LinkedIn',
      'logo-twitter': 'Twitter',
      'logo-instagram': 'Instagram',
      'logo-github': 'GitHub',
      'mail-outline': 'Email'
    };

    const platformName = platformNames[platform] || platform;
    this.showMessage(`لینک ${platformName} در حال توسعه است`, 'info');
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
    }, 3000);
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

// Initialize about manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.aboutManager = new AboutManager();
});

// Add CSS for about page styles
const aboutStyles = `
  .about-hero {
    padding: 4rem 0;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  }

  .about-hero-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    align-items: center;
  }

  .about-text {
    padding: 2rem;
  }

  .about-image {
    text-align: center;
  }

  .about-image img {
    max-width: 100%;
    height: auto;
    border-radius: 15px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.1);
  }

  .mission-vision {
    padding: 4rem 0;
  }

  .mission-vision-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
  }

  .mission-card,
  .vision-card,
  .values-card {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    text-align: center;
    transition: transform 0.3s ease;
  }

  .mission-card:hover,
  .vision-card:hover,
  .values-card:hover {
    transform: translateY(-10px);
  }

  .mission-card .card-icon,
  .vision-card .card-icon,
  .values-card .card-icon {
    width: 80px;
    height: 80px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    margin: 0 auto 1.5rem;
    color: white;
    font-size: 2rem;
  }

  .mission-card .card-title,
  .vision-card .card-title,
  .values-card .card-title {
    color: #2c3e50;
    margin-bottom: 1rem;
  }

  .mission-card .card-text,
  .vision-card .card-text,
  .values-card .card-text {
    color: #666;
    line-height: 1.6;
  }

  .stats {
    padding: 4rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 2rem;
  }

  .stat-item {
    text-align: center;
    padding: 2rem;
    background: rgba(255,255,255,0.1);
    border-radius: 15px;
    backdrop-filter: blur(10px);
  }

  .stat-number {
    font-size: 3rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    color: white;
  }

  .stat-label {
    font-size: 1.1rem;
    opacity: 0.9;
  }

  .team {
    padding: 4rem 0;
  }

  .team-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
    gap: 2rem;
    margin-top: 3rem;
  }

  .team-member {
    background: white;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    transition: transform 0.3s ease;
  }

  .team-member:hover {
    transform: translateY(-10px);
  }

  .member-image {
    height: 250px;
    overflow: hidden;
  }

  .member-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }

  .team-member:hover .member-image img {
    transform: scale(1.05);
  }

  .member-info {
    padding: 2rem;
    text-align: center;
  }

  .member-name {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .member-position {
    color: #667eea;
    font-weight: 500;
    margin-bottom: 1rem;
  }

  .member-bio {
    color: #666;
    line-height: 1.6;
    margin-bottom: 1.5rem;
  }

  .member-social {
    display: flex;
    justify-content: center;
    gap: 1rem;
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .member-social .social-link {
    width: 40px;
    height: 40px;
    background: #f8f9fa;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #666;
    text-decoration: none;
    transition: all 0.3s ease;
  }

  .member-social .social-link:hover {
    background: #667eea;
    color: white;
    transform: translateY(-3px);
  }

  .contact-cta {
    padding: 4rem 0;
    text-align: center;
    color: white;
  }

  .cta-content {
    max-width: 600px;
    margin: 0 auto;
  }

  .cta-content .section-title {
    color: white;
    margin-bottom: 1rem;
  }

  .cta-content .section-text {
    color: rgba(255,255,255,0.9);
    margin-bottom: 2rem;
  }

  .cta-buttons {
    display: flex;
    gap: 1rem;
    justify-content: center;
    flex-wrap: wrap;
  }

  .btn-outline {
    background: transparent;
    border: 2px solid white;
    color: white;
    padding: 1rem 2rem;
    border-radius: 10px;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.3s ease;
  }

  .btn-outline:hover {
    background: white;
    color: #667eea;
  }

  .text-center {
    text-align: center;
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

  .toast-info {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
  }

  @media (max-width: 768px) {
    .about-hero-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .mission-vision-grid {
      grid-template-columns: 1fr;
    }

    .stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .team-grid {
      grid-template-columns: 1fr;
    }

    .cta-buttons {
      flex-direction: column;
      align-items: center;
    }

    .btn-outline {
      width: 100%;
      max-width: 300px;
    }
  }

  @media (max-width: 480px) {
    .stats-grid {
      grid-template-columns: 1fr;
    }

    .stat-number {
      font-size: 2.5rem;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = aboutStyles;
document.head.appendChild(styleSheet);
