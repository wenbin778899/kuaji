// 平滑滚动
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// 表单提交处理
const contactForm = document.getElementById('contact-form');
if (contactForm) {
    contactForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        // 获取表单数据
        const formData = new FormData(this);
        const formObject = {};
        formData.forEach((value, key) => {
            formObject[key] = value;
        });

        // 这里可以添加发送表单数据到服务器的代码
        console.log('表单数据：', formObject);
        
        // 显示提交成功消息
        alert('感谢您的留言！我们会尽快回复。');
        this.reset();
    });
}

// 页面加载动画
document.addEventListener('DOMContentLoaded', () => {
    checkLoginStatus();
    initializeLogout();
    initSections();
    initNavScroll();
    initCardHover();
});

// 检查登录状态
function checkLoginStatus() {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('user');
    
    if (!token || !username) {
        // 如果没有token或用户名，重定向到登录页面
        window.location.href = 'login.html';
        return;
    }

    // 更新欢迎信息
    const welcomeText = document.getElementById('welcome-text');
    if (welcomeText) {
        welcomeText.textContent = `欢迎，${username}`;
    }
}

// 初始化退出功能
function initializeLogout() {
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            // 清除本地存储的登录信息
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            // 显示退出提示
            alert('已成功退出登录');
            
            // 重定向到登录页面
            window.location.href = 'login.html';
        });
    }
}

// 导航栏滚动效果
function initNavScroll() {
    const header = document.querySelector('.nav-container');
    let lastScroll = 0;

    window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        
        if (currentScroll <= 0) {
            header.classList.remove('scroll-up');
            return;
        }
        
        if (currentScroll > lastScroll && !header.classList.contains('scroll-down')) {
            // 向下滚动
            header.classList.remove('scroll-up');
            header.classList.add('scroll-down');
        } else if (currentScroll < lastScroll && header.classList.contains('scroll-down')) {
            // 向上滚动
            header.classList.remove('scroll-down');
            header.classList.add('scroll-up');
        }
        lastScroll = currentScroll;
    });
}

// 卡片悬停效果
function initCardHover() {
    const cards = document.querySelectorAll('.info-card, .activity-card, .goal-card');
    
    cards.forEach(card => {
        card.addEventListener('mouseenter', () => {
            card.style.transform = 'translateY(-10px)';
            card.style.boxShadow = '0 5px 15px rgba(0,0,0,0.2)';
        });
        
        card.addEventListener('mouseleave', () => {
            card.style.transform = 'translateY(0)';
            card.style.boxShadow = '0 3px 10px rgba(0,0,0,0.1)';
        });
    });
}

// 课程卡片动画
const courseCards = document.querySelectorAll('.course-card');
courseCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// 就业方向卡片动画
const careerCards = document.querySelectorAll('.career-card');
careerCards.forEach(card => {
    card.addEventListener('mouseenter', () => {
        card.style.transform = 'translateY(-10px)';
    });
    
    card.addEventListener('mouseleave', () => {
        card.style.transform = 'translateY(0)';
    });
});

// 滚动显示动画
const observerOptions = {
    threshold: 0.1
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

document.querySelectorAll('.section').forEach(section => {
    observer.observe(section);
});

// 登录/注册功能
document.addEventListener('DOMContentLoaded', () => {
    const authModal = document.getElementById('auth-modal');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const loginBtn = document.getElementById('login-btn');
    const authTabs = document.querySelectorAll('.auth-tab');
    const authStatus = document.getElementById('auth-status');

    if (!localStorage.getItem('user')) {
        // 如果用户未登录，显示登录模态框
        authModal.style.display = 'flex';
    }

    // 显示登录模态框
    if (loginBtn) {
        loginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            authModal.style.display = 'flex';
        });
    }

    // 切换登录/注册表单
    authTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            authTabs.forEach(t => t.classList.remove('active'));
            tab.classList.add('active');
            
            const form = tab.dataset.tab === 'login' ? loginForm : registerForm;
            const otherForm = tab.dataset.tab === 'login' ? registerForm : loginForm;
            
            form.style.display = 'flex';
            otherForm.style.display = 'none';
        });
    });

    // 点击模态框外部关闭
    authModal.addEventListener('click', (e) => {
        if (e.target === authModal) {
            authModal.style.display = 'none';
        }
    });

    // 处理登录表单提交
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch('http://localhost:3000/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                localStorage.setItem('user', result.username);
                updateAuthStatus();
                authModal.style.display = 'none';
                alert('登录成功！');
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('登录失败，请稍后重试');
        }
    });

    // 处理注册表单提交
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(registerForm);
        if (formData.get('password') !== formData.get('confirmPassword')) {
            alert('两次输入的密码不一致');
            return;
        }
        
        const data = {
            username: formData.get('username'),
            email: formData.get('email'),
            password: formData.get('password')
        };
        
        const API_BASE_URL = 'https://kuaji-production.up.railway.app';
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
            
            const result = await response.json();
            
            if (response.ok) {
                alert('注册成功！请登录');
                // 切换到登录表单
                authTabs[0].click();
            } else {
                alert(result.error);
            }
        } catch (error) {
            alert('注册失败，请稍后重试');
        }
    });

    // 更新登录状态
    function updateAuthStatus() {
        const username = localStorage.getItem('user');
        const welcomeText = document.getElementById('welcome-text');
        const logoutBtn = document.getElementById('logout-btn');
        const loginBtn = document.getElementById('login-btn');

        if (username) {
            welcomeText.textContent = `欢迎，${username}`;
            logoutBtn.style.display = 'inline';
            loginBtn.style.display = 'none';
            
            // 添加退出功能
            logoutBtn.addEventListener('click', (e) => {
                e.preventDefault();
                localStorage.removeItem('user');
                localStorage.removeItem('token');
                window.location.href = 'login.html';
            });
        } else {
            welcomeText.textContent = '';
            logoutBtn.style.display = 'none';
            loginBtn.style.display = 'inline';
        }
    }

    // 初始化登录状态
    updateAuthStatus();
});

// 初始化页面sections
function initSections() {
    const sections = document.querySelectorAll('.section');
    sections.forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(20px)';
        section.style.transition = 'all 0.6s ease-out';
        
        setTimeout(() => {
            section.style.opacity = '1';
            section.style.transform = 'translateY(0)';
        }, index * 200);
    });
} 