import express from 'express';
import cors from 'cors';
import sql from 'mssql';
import path from 'path';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// SQL Server Config
const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER || '',
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT || '1433'),
    options: {
        encrypt: true,
        trustServerCertificate: true
    },
    connectionTimeout: 15000,
    requestTimeout: 15000
};

// Hàm kiểm tra cấu hình
function validateDbConfig() {
    const missing = [];
    if (!dbConfig.server || dbConfig.server === 'YOUR_PUBLIC_IP_OR_DOMAIN') missing.push('DB_SERVER');
    if (!dbConfig.database) missing.push('DB_DATABASE');
    if (!dbConfig.user) missing.push('DB_USER');
    if (!dbConfig.password) missing.push('DB_PASSWORD');
    
    if (missing.length > 0) {
        console.error(`MISSING CONFIG: SQL Server config is missing or using placeholder: ${missing.join(', ')}`);
        return false;
    }
    return true;
}

// API: Health Check
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'ok', 
        database: 'firebase + sql',
        sqlConfigured: validateDbConfig()
    });
});

// API: Sync Register to SQL
app.post('/api/sync-register', async (req, res) => {
    if (!validateDbConfig()) {
        return res.status(500).json({ 
            success: false, 
            message: 'Cấu hình SQL Server chưa hoàn thiện (DB_SERVER, DB_USER...). Vui lòng thiết lập trong Settings.' 
        });
    }

    try {
        const { fullName, email, password } = req.body;
        console.log(`Đang đồng bộ đăng ký tới SQL Server tại: ${dbConfig.server}`);
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('fullName', sql.NVarChar, fullName)
            .input('email', sql.NVarChar, email)
            .input('password', sql.NVarChar, password)
            .query('INSERT INTO Accounts (FullName, Email, Password) VALUES (@fullName, @email, @password)');
        res.json({ success: true, message: 'Đồng bộ SQL thành công' });
    } catch (err) {
        console.error('SQL Sync Error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi đồng bộ SQL: ' + (err instanceof Error ? err.message : 'Unknown error')
        });
    }
});

// API: Sync Order to SQL
app.post('/api/sync-order', async (req, res) => {
    if (!validateDbConfig()) {
        return res.status(500).json({ success: false, message: 'SQL Config missing' });
    }

    try {
        const { orderId, fullName, email, phone, address, cartDetails, totalAmount } = req.body;
        console.log(`Đang đồng bộ đơn hàng ${orderId} tới SQL Server...`);
        const pool = await sql.connect(dbConfig);
        await pool.request()
            .input('orderId', sql.NVarChar, orderId)
            .input('fullName', sql.NVarChar, fullName)
            .input('email', sql.NVarChar, email)
            .input('phone', sql.NVarChar, phone)
            .input('address', sql.NVarChar, address)
            .input('cartDetails', sql.NVarChar, cartDetails)
            .input('totalAmount', sql.Decimal(18, 2), totalAmount)
            .query(`INSERT INTO Orders (OrderId, FullName, Email, Phone, Address, CartDetails, TotalAmount) 
                   VALUES (@orderId, @fullName, @email, @phone, @address, @cartDetails, @totalAmount)`);
        res.json({ success: true, message: 'Đồng bộ đơn hàng SQL thành công' });
    } catch (err) {
        console.error('SQL Order Sync Error:', err);
        res.status(500).json({ 
            success: false, 
            message: 'Lỗi đồng bộ đơn hàng SQL: ' + (err instanceof Error ? err.message : 'Unknown error')
        });
    }
});

async function startServer() {
    if (process.env.NODE_ENV !== 'production') {
        const vite = await createViteServer({
            server: { middlewareMode: true },
            appType: 'spa',
        });
        app.use(vite.middlewares);
    } else {
        const distPath = path.join(process.cwd(), 'dist');
        app.use(express.static(distPath));
        app.get('*', (req, res) => {
            res.sendFile(path.join(distPath, 'index.html'));
        });
    }

    const PORT = 3000;
    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server is running at http://localhost:${PORT}`);
    });
}

startServer();
