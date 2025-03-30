// API基础URL配置
const API_BASE_URL = 'http://nozomi.proxy.rlwy.net:21839';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const authTabs = document.querySelectorAll('.auth-tab');

    // 如果已经登录，直接跳转到主页
    if (localStorage.getItem('token')) {
        window.location.href = 'index.html';
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

    // 处理登录表单提交
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const formData = new FormData(loginForm);
        const data = {
            username: formData.get('username'),
            password: formData.get('password')
        };
        
        try {
            const response = await fetch(`${API_BASE_URL}/api/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data),
                mode: 'cors',
                credentials: 'include'
            });
            
            const result = await response.json();
            
            if (response.ok) {
                localStorage.setItem('user', result.username);
                localStorage.setItem('token', result.token);
                window.location.href = 'index.html';
            } else {
                alert(result.error);
            }
        } catch (error) {
            console.error('Error:', error);
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
}); 