// Authentication functionality
class AuthManager {
  constructor() {
    this.init();
  }

  init() {
    this.bindEvents();
    this.checkAuthStatus();
  }

  bindEvents() {
    // Password toggle functionality
    this.bindPasswordToggle();
    
    // Form submissions
    this.bindFormSubmissions();
    
    // Password strength checker
    this.bindPasswordStrength();
    
    // Social login buttons
    this.bindSocialLogin();
  }

  bindPasswordToggle() {
    const passwordToggles = document.querySelectorAll('.password-toggle');
    passwordToggles.forEach(toggle => {
      toggle.addEventListener('click', (e) => {
        const input = e.target.closest('.input-wrapper').querySelector('input');
        const icon = e.target;
        
        if (input.type === 'password') {
          input.type = 'text';
          icon.name = 'eye-off-outline';
        } else {
          input.type = 'password';
          icon.name = 'eye-outline';
        }
      });
    });
  }

  bindFormSubmissions() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleLogin(e);
      });
    }

    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleRegister(e);
      });
    }
  }

  bindPasswordStrength() {
    const passwordInput = document.getElementById('password');
    if (passwordInput) {
      passwordInput.addEventListener('input', () => {
        this.checkPasswordStrength(passwordInput.value);
      });
    }
  }

  bindSocialLogin() {
    const socialBtns = document.querySelectorAll('.social-btn');
    socialBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        const provider = btn.classList.contains('google-btn') ? 'google' : 'facebook';
        this.handleSocialLogin(provider);
      });
    });
  }

  async handleLogin(e) {
    const formData = new FormData(e.target);
    const data = {
      email: formData.get('email'),
      password: formData.get('password')
    };

    try {
      this.showLoading(true);
      
      const response = await fetch('/api/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        this.showMessage('ورود موفقیت‌آمیز! خوش آمدید', 'success');
        
        // Redirect to dashboard or previous page
        setTimeout(() => {
          const returnUrl = new URLSearchParams(window.location.search).get('return') || 'dashboard.html';
          window.location.href = returnUrl;
        }, 1500);
      } else {
        this.showMessage(result.message || 'خطا در ورود', 'error');
      }
    } catch (error) {
      console.error('Login error:', error);
      this.showMessage('خطا در ورود. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  async handleRegister(e) {
    const formData = new FormData(e.target);
    const data = {
      firstName: formData.get('firstName'),
      lastName: formData.get('lastName'),
      email: formData.get('email'),
      phone: formData.get('phone'),
      password: formData.get('password')
    };

    // Validate password confirmation
    const password = formData.get('password');
    const confirmPassword = formData.get('confirmPassword');
    
    if (password !== confirmPassword) {
      this.showMessage('رمز عبور و تأیید آن مطابقت ندارند', 'error');
      return;
    }

    try {
      this.showLoading(true);
      
      const response = await fetch('/api/users/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data)
      });

      const result = await response.json();

      if (result.success) {
        // Store token and user data
        localStorage.setItem('token', result.data.token);
        localStorage.setItem('user', JSON.stringify(result.data.user));
        
        this.showMessage('ثبت‌نام موفقیت‌آمیز! خوش آمدید', 'success');
        
        // Redirect to dashboard
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        this.showMessage(result.message || 'خطا در ثبت‌نام', 'error');
      }
    } catch (error) {
      console.error('Registration error:', error);
      this.showMessage('خطا در ثبت‌نام. لطفاً دوباره تلاش کنید.', 'error');
    } finally {
      this.showLoading(false);
    }
  }

  handleSocialLogin(provider) {
    // This would integrate with OAuth providers
    this.showMessage(`ورود با ${provider} در حال توسعه است`, 'info');
  }

  checkPasswordStrength(password) {
    const strengthBar = document.querySelector('.strength-fill');
    const strengthText = document.querySelector('.strength-text');
    
    if (!strengthBar || !strengthText) return;

    let strength = 0;
    let strengthLabel = '';

    // Check password criteria
    if (password.length >= 8) strength += 25;
    if (/[a-z]/.test(password)) strength += 25;
    if (/[A-Z]/.test(password)) strength += 25;
    if (/[0-9]/.test(password)) strength += 25;
    if (/[^A-Za-z0-9]/.test(password)) strength += 25;

    // Set strength level
    if (strength < 25) {
      strengthLabel = 'خیلی ضعیف';
      strengthBar.style.backgroundColor = '#e74c3c';
    } else if (strength < 50) {
      strengthLabel = 'ضعیف';
      strengthBar.style.backgroundColor = '#f39c12';
    } else if (strength < 75) {
      strengthLabel = 'متوسط';
      strengthBar.style.backgroundColor = '#f1c40f';
    } else if (strength < 100) {
      strengthLabel = 'قوی';
      strengthBar.style.backgroundColor = '#2ecc71';
    } else {
      strengthLabel = 'خیلی قوی';
      strengthBar.style.backgroundColor = '#27ae60';
    }

    strengthBar.style.width = `${Math.min(strength, 100)}%`;
    strengthText.textContent = strengthLabel;
  }

  checkAuthStatus() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    
    if (token && user) {
      // User is logged in, redirect to dashboard if on auth pages
      if (window.location.pathname.includes('login.html') || 
          window.location.pathname.includes('register.html')) {
        window.location.href = 'dashboard.html';
      }
    } else {
      // User is not logged in, redirect to login if on protected pages
      if (window.location.pathname.includes('dashboard.html') || 
          window.location.pathname.includes('profile.html')) {
        window.location.href = 'login.html';
      }
    }
  }

  showLoading(show) {
    const submitBtn = document.querySelector('.auth-btn');
    if (submitBtn) {
      submitBtn.disabled = show;
      if (show) {
        submitBtn.innerHTML = '<div class="spinner-small"></div> در حال پردازش...';
      } else {
        // Restore original button text based on form type
        if (document.getElementById('loginForm')) {
          submitBtn.innerHTML = 'ورود <ion-icon name="log-in-outline"></ion-icon>';
        } else if (document.getElementById('registerForm')) {
          submitBtn.innerHTML = 'ایجاد حساب کاربری <ion-icon name="person-add-outline"></ion-icon>';
        }
      }
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

  // Static method to logout
  static logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = 'index.html';
  }

  // Static method to check if user is authenticated
  static isAuthenticated() {
    return !!localStorage.getItem('token');
  }

  // Static method to get current user
  static getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}

// Initialize auth manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.authManager = new AuthManager();
});

// Add CSS for auth pages
const authStyles = `
  .auth-section {
    min-height: 100vh;
    display: flex;
    align-items: center;
    padding: 4rem 0;
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  }

  .auth-container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 4rem;
    max-width: 1200px;
    margin: 0 auto;
    background: white;
    border-radius: 20px;
    overflow: hidden;
    box-shadow: 0 20px 60px rgba(0,0,0,0.1);
  }

  .auth-form-container {
    padding: 3rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }

  .auth-header {
    text-align: center;
    margin-bottom: 2rem;
  }

  .auth-title {
    color: #2c3e50;
    margin-bottom: 0.5rem;
  }

  .auth-subtitle {
    color: #666;
    font-size: 1.1rem;
  }

  .auth-form {
    margin-bottom: 2rem;
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

  .input-wrapper {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-icon {
    position: absolute;
    right: 1rem;
    color: #999;
    font-size: 1.2rem;
    z-index: 1;
  }

  .form-input {
    width: 100%;
    padding: 1rem 1rem 1rem 3rem;
    border: 2px solid #e1e8ed;
    border-radius: 10px;
    font-family: var(--ff-vazir);
    font-size: 1rem;
    transition: all 0.3s ease;
    background: #f8f9fa;
  }

  .form-input:focus {
    outline: none;
    border-color: #667eea;
    background: white;
    box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
  }

  .password-toggle {
    position: absolute;
    left: 1rem;
    background: none;
    border: none;
    color: #999;
    cursor: pointer;
    font-size: 1.2rem;
    z-index: 1;
  }

  .password-toggle:hover {
    color: #667eea;
  }

  .password-strength {
    margin-top: 0.5rem;
  }

  .strength-bar {
    height: 4px;
    background: #e1e8ed;
    border-radius: 2px;
    overflow: hidden;
    margin-bottom: 0.3rem;
  }

  .strength-fill {
    height: 100%;
    width: 0%;
    transition: all 0.3s ease;
    border-radius: 2px;
  }

  .strength-text {
    font-size: 0.8rem;
    color: #666;
  }

  .form-options {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    flex-wrap: wrap;
    gap: 1rem;
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
    font-size: 0.9rem;
    color: #666;
  }

  .terms-link {
    color: #667eea;
    text-decoration: none;
  }

  .terms-link:hover {
    text-decoration: underline;
  }

  .forgot-password {
    color: #667eea;
    text-decoration: none;
    font-size: 0.9rem;
  }

  .forgot-password:hover {
    text-decoration: underline;
  }

  .auth-btn {
    width: 100%;
    padding: 1rem;
    font-size: 1.1rem;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
  }

  .auth-divider {
    text-align: center;
    margin: 2rem 0;
    position: relative;
  }

  .auth-divider::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e1e8ed;
  }

  .auth-divider span {
    background: white;
    padding: 0 1rem;
    color: #666;
    font-size: 0.9rem;
  }

  .social-login {
    display: flex;
    flex-direction: column;
    gap: 1rem;
    margin-bottom: 2rem;
  }

  .social-btn {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding: 1rem;
    border: 2px solid #e1e8ed;
    border-radius: 10px;
    background: white;
    color: #666;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .social-btn:hover {
    border-color: #667eea;
    color: #667eea;
    transform: translateY(-2px);
  }

  .google-btn:hover {
    border-color: #db4437;
    color: #db4437;
  }

  .facebook-btn:hover {
    border-color: #4267B2;
    color: #4267B2;
  }

  .auth-footer {
    text-align: center;
  }

  .auth-footer p {
    color: #666;
    margin: 0;
  }

  .auth-link {
    color: #667eea;
    text-decoration: none;
    font-weight: 500;
  }

  .auth-link:hover {
    text-decoration: underline;
  }

  .auth-image {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    overflow: hidden;
  }

  .auth-image-content {
    text-align: center;
    color: white;
    padding: 2rem;
  }

  .auth-image img {
    max-width: 300px;
    margin-bottom: 2rem;
    border-radius: 15px;
  }

  .auth-features {
    display: flex;
    flex-direction: column;
    gap: 1rem;
  }

  .feature-item {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(255,255,255,0.1);
    border-radius: 10px;
    backdrop-filter: blur(10px);
  }

  .feature-item ion-icon {
    font-size: 1.5rem;
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
    .auth-container {
      grid-template-columns: 1fr;
      margin: 1rem;
    }

    .auth-form-container {
      padding: 2rem;
    }

    .form-row {
      grid-template-columns: 1fr;
    }

    .form-options {
      flex-direction: column;
      align-items: flex-start;
    }

    .auth-image {
      display: none;
    }
  }
`;

// Add styles to document
const styleSheet = document.createElement('style');
styleSheet.textContent = authStyles;
document.head.appendChild(styleSheet);
