/**
 * =====================================================
 * SOUNDSPIN RECORDS - SERVIDOR NODE.JS CON EXPRESS
 * =====================================================
 * Servidor backend con API REST para conectar a PostgreSQL
 * =====================================================
 */

const express = require('express');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { Pool } = require('pg');
const path = require('path');
require('dotenv').config();

// Importar configuración de base de datos
const { dbConfig } = require('../database/config');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Crear pool de conexiones a PostgreSQL
const pool = new Pool(dbConfig);

// =====================================================
// MIDDLEWARES
// =====================================================

// Habilitar CORS para todas las solicitudes
app.use(cors());

// Parsear JSON en el body de las solicitudes
app.use(express.json());

// Servir archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../public')));

// Middleware para verificar token JWT
const verifyToken = (req, res, next) => {
    const token = req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
        return res.status(401).json({ error: 'Token no proporcionado' });
    }
    
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'soundspin_secret');
        req.user = decoded;
        next();
    } catch (error) {
        return res.status(401).json({ error: 'Token inválido' });
    }
};

// Middleware para verificar si es administrador
const verifyAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Acceso denegado. Se requiere rol de administrador.' });
    }
    next();
};

// =====================================================
// RUTAS DE AUTENTICACIÓN
// =====================================================

// POST /api/auth/login - Iniciar sesión
app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Buscar usuario por email
        const result = await pool.query(
            'SELECT * FROM users WHERE email = $1',
            [email]
        );
        
        if (result.rows.length === 0) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        const user = result.rows[0];
        
        // Verificar contraseña
        const validPassword = await bcrypt.compare(password, user.password);
        
        if (!validPassword) {
            return res.status(401).json({ error: 'Credenciales inválidas' });
        }
        
        // Generar token JWT
        const token = jwt.sign(
            { id: user.id, email: user.email, role: user.role, name: user.name },
            process.env.JWT_SECRET || 'soundspin_secret',
            { expiresIn: '24h' }
        );
        
        // Responder con token y datos del usuario
        res.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Error en login:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /api/auth/register - Registrar nuevo usuario
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
        // Verificar si el email ya existe
        const existingUser = await pool.query(
            'SELECT id FROM users WHERE email = $1',
            [email]
        );
        
        if (existingUser.rows.length > 0) {
            return res.status(400).json({ error: 'El email ya está registrado' });
        }
        
        // Hashear la contraseña
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Insertar nuevo usuario
        const result = await pool.query(
            'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
            [name, email, hashedPassword, 'user']
        );
        
        const newUser = result.rows[0];
        
        // Generar token JWT
        const token = jwt.sign(
            { id: newUser.id, email: newUser.email, role: newUser.role, name: newUser.name },
            process.env.JWT_SECRET || 'soundspin_secret',
            { expiresIn: '24h' }
        );
        
        res.status(201).json({
            token,
            user: newUser
        });
    } catch (error) {
        console.error('Error en registro:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =====================================================
// RUTAS DE PRODUCTOS
// =====================================================

// GET /api/products - Obtener todos los productos
app.get('/api/products', async (req, res) => {
    try {
        const { category, search } = req.query;
        
        let query = 'SELECT * FROM products WHERE 1=1';
        const params = [];
        
        // Filtrar por categoría si se especifica
        if (category && category !== 'all') {
            params.push(category);
            query += ` AND category = $${params.length}`;
        }
        
        // Filtrar por búsqueda si se especifica
        if (search) {
            params.push(`%${search}%`);
            query += ` AND (LOWER(name) LIKE LOWER($${params.length}) OR LOWER(artist) LIKE LOWER($${params.length}))`;
        }
        
        query += ' ORDER BY created_at DESC';
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo productos:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// GET /api/products/:id - Obtener producto por ID
app.get('/api/products/:id', async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'SELECT * FROM products WHERE id = $1',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error obteniendo producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /api/products - Crear nuevo producto (solo admin)
app.post('/api/products', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { name, artist, price, original_price, category, description, image_url, stock, is_new, is_offer, genre, year, format } = req.body;
        
        const result = await pool.query(
            `INSERT INTO products (name, artist, price, original_price, category, description, image_url, stock, is_new, is_offer, genre, year, format)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
             RETURNING *`,
            [name, artist, price, original_price, category, description, image_url, stock || 0, is_new || false, is_offer || false, genre, year, format]
        );
        
        res.status(201).json(result.rows[0]);
    } catch (error) {
        console.error('Error creando producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// PUT /api/products/:id - Actualizar producto (solo admin)
app.put('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, artist, price, original_price, category, description, image_url, stock, is_new, is_offer, genre, year, format } = req.body;
        
        const result = await pool.query(
            `UPDATE products SET
                name = COALESCE($1, name),
                artist = COALESCE($2, artist),
                price = COALESCE($3, price),
                original_price = $4,
                category = COALESCE($5, category),
                description = COALESCE($6, description),
                image_url = COALESCE($7, image_url),
                stock = COALESCE($8, stock),
                is_new = COALESCE($9, is_new),
                is_offer = COALESCE($10, is_offer),
                genre = COALESCE($11, genre),
                year = COALESCE($12, year),
                format = COALESCE($13, format),
                updated_at = CURRENT_TIMESTAMP
             WHERE id = $14
             RETURNING *`,
            [name, artist, price, original_price, category, description, image_url, stock, is_new, is_offer, genre, year, format, id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json(result.rows[0]);
    } catch (error) {
        console.error('Error actualizando producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/products/:id - Eliminar producto (solo admin)
app.delete('/api/products/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        const result = await pool.query(
            'DELETE FROM products WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Producto no encontrado' });
        }
        
        res.json({ message: 'Producto eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando producto:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =====================================================
// RUTAS DE VENTAS
// =====================================================

// GET /api/sales - Obtener todas las ventas (solo admin)
app.get('/api/sales', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            `SELECT s.*, 
                    json_agg(json_build_object(
                        'product_name', si.product_name,
                        'product_price', si.product_price,
                        'quantity', si.quantity,
                        'subtotal', si.subtotal
                    )) as items
             FROM sales s
             LEFT JOIN sale_items si ON s.id = si.sale_id
             GROUP BY s.id
             ORDER BY s.created_at DESC`
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo ventas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// POST /api/sales - Registrar nueva venta
app.post('/api/sales', async (req, res) => {
    const client = await pool.connect();
    
    try {
        await client.query('BEGIN');
        
        const { user_name, user_email, items, total } = req.body;
        
        // Insertar la venta
        const saleResult = await client.query(
            'INSERT INTO sales (user_name, user_email, total) VALUES ($1, $2, $3) RETURNING *',
            [user_name, user_email, total]
        );
        
        const saleId = saleResult.rows[0].id;
        
        // Insertar los items de la venta
        for (const item of items) {
            await client.query(
                `INSERT INTO sale_items (sale_id, product_id, product_name, product_price, quantity, subtotal)
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [saleId, item.product_id, item.product_name, item.product_price, item.quantity, item.subtotal]
            );
            
            // Actualizar el stock del producto
            await client.query(
                'UPDATE products SET stock = stock - $1 WHERE id = $2',
                [item.quantity, item.product_id]
            );
        }
        
        await client.query('COMMIT');
        
        res.status(201).json(saleResult.rows[0]);
    } catch (error) {
        await client.query('ROLLBACK');
        console.error('Error registrando venta:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    } finally {
        client.release();
    }
});

// GET /api/sales/stats - Estadísticas de ventas (solo admin)
app.get('/api/sales/stats', verifyToken, verifyAdmin, async (req, res) => {
    try {
        // Total de ventas
        const totalSales = await pool.query(
            "SELECT COUNT(*) as count, COALESCE(SUM(total), 0) as total FROM sales WHERE status = 'completed'"
        );
        
        // Ventas por mes
        const monthlySales = await pool.query(
            `SELECT TO_CHAR(created_at, 'YYYY-MM') as month,
                    COUNT(*) as count,
                    SUM(total) as total
             FROM sales
             WHERE status = 'completed'
             GROUP BY TO_CHAR(created_at, 'YYYY-MM')
             ORDER BY month DESC
             LIMIT 12`
        );
        
        // Productos más vendidos
        const topProducts = await pool.query(
            `SELECT p.name, p.artist, SUM(si.quantity) as total_sold
             FROM products p
             JOIN sale_items si ON p.id = si.product_id
             GROUP BY p.id, p.name, p.artist
             ORDER BY total_sold DESC
             LIMIT 5`
        );
        
        // Total de usuarios
        const totalUsers = await pool.query(
            "SELECT COUNT(*) as count FROM users WHERE role = 'user'"
        );
        
        // Total de productos
        const totalProducts = await pool.query(
            'SELECT COUNT(*) as count FROM products'
        );
        
        res.json({
            totalSales: totalSales.rows[0],
            monthlySales: monthlySales.rows,
            topProducts: topProducts.rows,
            totalUsers: totalUsers.rows[0].count,
            totalProducts: totalProducts.rows[0].count
        });
    } catch (error) {
        console.error('Error obteniendo estadísticas:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =====================================================
// RUTAS DE USUARIOS (solo admin)
// =====================================================

// GET /api/users - Obtener todos los usuarios
app.get('/api/users', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const result = await pool.query(
            'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
        );
        
        res.json(result.rows);
    } catch (error) {
        console.error('Error obteniendo usuarios:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// DELETE /api/users/:id - Eliminar usuario
app.delete('/api/users/:id', verifyToken, verifyAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        
        // No permitir eliminar al propio usuario
        if (parseInt(id) === req.user.id) {
            return res.status(400).json({ error: 'No puedes eliminarte a ti mismo' });
        }
        
        const result = await pool.query(
            'DELETE FROM users WHERE id = $1 RETURNING *',
            [id]
        );
        
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Usuario no encontrado' });
        }
        
        res.json({ message: 'Usuario eliminado correctamente' });
    } catch (error) {
        console.error('Error eliminando usuario:', error);
        res.status(500).json({ error: 'Error interno del servidor' });
    }
});

// =====================================================
// RUTA PRINCIPAL - Servir index.html
// =====================================================
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../public/index.html'));
});

// =====================================================
// INICIAR SERVIDOR
// =====================================================
app.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════════════╗
║                                                      ║
║   🎵 SOUNDSPIN RECORDS - Servidor iniciado           ║
║                                                      ║
║   URL: http://localhost:${PORT}                        ║
║                                                      ║
║   Credenciales de administrador:                     ║
║   - admin@soundspin.com / Admin123!                  ║
║   - gerente@soundspin.com / Gerente456!              ║
║   - supervisor@soundspin.com / Super789!             ║
║                                                      ║
╚══════════════════════════════════════════════════════╝
    `);
});

// Manejar cierre graceful del servidor
process.on('SIGINT', async () => {
    console.log('\nCerrando conexiones a la base de datos...');
    await pool.end();
    process.exit(0);
});
