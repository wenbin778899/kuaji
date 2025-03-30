const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const cors = require('cors');
const path = require('path');
const app = express();

// 中间件配置
app.use(express.json());
app.use(cors({
    origin: '*',  // 临时允许所有来源
    credentials: true
}));

// 静态文件服务
app.use(express.static(path.join(__dirname), {
    setHeaders: (res, path, stat) => {
        res.set('Access-Control-Allow-Origin', '*');
        res.set('Access-Control-Allow-Methods', 'GET');
        res.set('Access-Control-Allow-Headers', 'Content-Type');
    }
}));

// 身份验证中间件
const authMiddleware = (req, res, next) => {
    // 允许访问登录页面和API
    const publicPaths = [
        '/login.html', 
        '/api/login', 
        '/api/register', 
        '/styles.css', 
        '/login.js',
        '/script.js',
        '/index.html',
        '/photo',
        '/'
    ];
    const isPublicPath = publicPaths.some(path => req.path.includes(path));
    
    if (isPublicPath) {
        next();
        return;
    }

    // 检查是否有认证token
    const authToken = req.headers.authorization;
    if (!authToken) {
        res.redirect('/login.html');
        return;
    }
    next();
};

// 应用身份验证中间件
app.use(authMiddleware);

// 数据库配置
const db = mysql.createPool({
    host: process.env.MYSQL_HOST || 'nozomi.proxy.rlwy.net',
    port: process.env.MYSQL_PORT || 3306,
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || 'fxShwCsSyJfVrrsxeDtVlLllysZlERma',
    database: process.env.MYSQL_DATABASE || 'railway',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

// 测试连接池
db.getConnection((err, connection) => {
    if (err) {
        console.error('数据库连接失败:', err);
        return;
    }
    console.log('数据库连接成功');
    
    // 创建用户表
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            username VARCHAR(50) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    `;
    
    connection.query(createTableQuery, (err) => {
        if (err) {
            console.error('创建用户表失败:', err);
        } else {
            console.log('用户表已创建/已存在');
        }
        connection.release();
    });
});

// 处理错误事件
db.on('error', (err) => {
    console.error('数据库池错误:', err);
    if (err.code === 'PROTOCOL_CONNECTION_LOST') {
        console.log('尝试重新连接数据库...');
    }
});

// 注册接口
app.post('/api/register', async (req, res) => {
    const { username, password, email } = req.body;
    
    try {
        db.getConnection((err, connection) => {
            if (err) {
                return res.status(500).json({ error: '数据库连接失败' });
            }
            
            // 检查用户名是否已存在
            connection.query('SELECT * FROM users WHERE username = ? OR email = ?', 
                [username, email], 
                async (err, results) => {
                    if (err) {
                        connection.release();
                        return res.status(500).json({ error: '服务器错误' });
                    }
                    
                    if (results.length > 0) {
                        connection.release();
                        return res.status(400).json({ error: '用户名或邮箱已存在' });
                    }
                    
                    // 加密密码
                    const hashedPassword = await bcrypt.hash(password, 10);
                    
                    // 插入新用户
                    connection.query('INSERT INTO users (username, password, email) VALUES (?, ?, ?)',
                        [username, hashedPassword, email],
                        (err) => {
                            connection.release();
                            if (err) {
                                return res.status(500).json({ error: '注册失败' });
                            }
                            res.json({ message: '注册成功' });
                        });
                });
        });
    } catch (error) {
        res.status(500).json({ error: '服务器错误' });
    }
});

// 登录接口
app.post('/api/login', (req, res) => {
  const { username, password } = req.body;
  
  const query = 'SELECT * FROM users WHERE username = ?';
  db.query(query, [username], async (err, results) => {
    if (err) {
      return res.status(500).json({ error: '服务器错误' });
    }
    
    if (results.length === 0) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    const user = results[0];
    const validPassword = await bcrypt.compare(password, user.password);
    
    if (!validPassword) {
      return res.status(401).json({ error: '用户名或密码错误' });
    }
    
    // 生成简单的token（实际应用中应使用JWT）
    const token = Buffer.from(username).toString('base64');
    res.json({ 
      message: '登录成功', 
      username: user.username,
      token: token 
    });
  });
});

// 端口配置
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`服务器运行在端口 ${PORT}`);
}); 