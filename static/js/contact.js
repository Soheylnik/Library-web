// Contact page functionality
class ContactManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
  }

  bindEvents() {
    // Contact form submission
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
      contactForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleContactForm(e);
      });
    }

    // Newsletter form submission
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
      newsletterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleNewsletterForm(e);
      });
    }
  }

  async handleContactForm(e) {
    const formData = new FormData(e.target);
    const data = {
      name: formData.get('name'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      subject: formData.get('subject'),
      message: formData.get('message')
    };

    try {
      this.showLoading(true);
      
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('پیام شما با موفقیت ارسال شد. در اسرع وقت پاسخ داده خواهد شد.', 'success');
        e.target.reset();
      } else {
        this.showMessage(result.message || 'خطا در ارسال پیام', 'error');
      }
    } catch (error) {
      console.error('Error sending contact message:', error);
      this.showMessage('خطا در ارسال پیام. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async handleNewsletterForm(e) {
    const formData = new FormData(e.target);
    const email = formData.get('email');

    try {
      this.showLoading(true);
      
      const response = await fetch('/api/contact/newsletter', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const result = await response.json();

      if (result.success) {
        this.showMessage('عضویت در خبرنامه با موفقیت انجام شد', 'success');
        e.target.reset();
      } else {
        this.showMessage(result.message || 'خطا در عضویت خبرنامه', 'error');
      }
    } catch (error) {
      console.error('Error subscribing to newsletter:', error);
      this.showMessage('خطا در عضویت خبرنامه. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  showLoading(show) {
    const submitBtn = document.querySelector('#contactForm button[type="submit"]');
    const newsletterBtn = document.querySelector('#newsletterForm button[type="submit"]');
    
    if (submitBtn) {
      submitBtn.disabled = show;
      submitBtn.innerHTML = show ? 
        '<div class="spinner-small"></div> در حال ارسال...' : 
        'ارسال پیام <ion-icon name="send-outline"></ion-icon>';
    }
    
    if (newsletterBtn) {
      newsletterBtn.disabled = show;
      newsletterBtn.innerHTML = show ? 
        '<div class="spinner-small"></div>' : 
        '<ion-icon name="send-outline"></ion-icon>';
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
}

// Initialize contact manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.contactManager = new ContactManager();
});

// Add CSS for contact page styles
const contactStyles = `
  .contact-content {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    margin-top: 2rem;
  }

  .contact-form-section {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .contact-form {
    margin-top: 2rem;
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

  .form-input,
  .form-textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: var(--ff-vazir);
    font-size: 1rem;
    transition: border-color 0.3s ease;
  }

  .form-input:focus,
  .form-textarea:focus {
    outline: none;
    border-color: #667eea;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .form-textarea {
    resize: vertical;
    min-height: 120px;
  }

  .contact-info-section {
    display: flex;
    flex-direction: column;
    gap: 2rem;
  }

  .contact-info-grid {
    display: grid;
    gap: 1.5rem;
  }

  .contact-info-item {
    display: flex;
    align-items: flex-start;
    gap: 1rem;
    padding: 1.5rem;
    background: white;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  }

  .info-icon {
    width: 50px;
    height: 50px;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.5rem;
    flex-shrink: 0;
  }

  .info-content {
    flex: 1;
  }

  .info-title {
    font-size: 1.1rem;
    font-weight: 600;
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .info-text {
    color: #666;
    line-height: 1.6;
    margin-bottom: 0.3rem;
  }

  .info-text:last-child {
    margin-bottom: 0;
  }

  .social-section {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  }

  .social-section .social-list {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-top: 1rem;
  }

  .social-section .social-link {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: #f8f9fa;
    border-radius: 10px;
    text-decoration: none;
    color: #666;
    transition: all 0.3s ease;
  }

  .social-section .social-link:hover {
    background: #667eea;
    color: white;
    transform: translateX(-5px);
  }

  .social-section .social-link ion-icon {
    font-size: 1.5rem;
  }

  .newsletter-section {
    background: white;
    padding: 2rem;
    border-radius: 15px;
    box-shadow: 0 5px 20px rgba(0,0,0,0.08);
  }

  .newsletter-text {
    color: #666;
    line-height: 1.6;
    margin: 1rem 0;
  }

  .newsletter-form {
    margin-top: 1.5rem;
  }

  .newsletter-input-group {
    display: flex;
    gap: 0.5rem;
  }

  .newsletter-input {
    flex: 1;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: 8px;
    font-family: var(--ff-vazir);
  }

  .newsletter-input:focus {
    outline: none;
    border-color: #667eea;
  }

  .newsletter-btn {
    padding: 0.8rem 1.5rem;
    background: #667eea;
    color: white;
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: background 0.3s ease;
  }

  .newsletter-btn:hover {
    background: #764ba2;
  }

  .map-section {
    margin-top: 4rem;
  }

  .map-container {
    margin-top: 2rem;
    border-radius: 15px;
    overflow: hidden;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
  }

  .map-placeholder {
    height: 400px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    color: #666;
    text-align: center;
  }

  .map-placeholder ion-icon {
    font-size: 4rem;
    margin-bottom: 1rem;
    color: #999;
  }

  .map-placeholder p {
    margin: 0.5rem 0;
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
    .contact-content {
      grid-template-columns: 1fr;
      gap: 2rem;
    }

    .contact-info-item {
      flex-direction: column;
      text-align: center;
    }

    .newsletter-input-group {
      flex-direction: column;
    }

    .social-section .social-list {
      flex-direction: row;
      flex-wrap: wrap;
    }

    .social-section .social-link {
      flex: 1;
      min-width: 120px;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = contactStyles;
document.head.appendChild(styleSheet);
