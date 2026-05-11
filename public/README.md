# SoundSpin Records - Tienda de Música

## Descripción
Tienda de música online con panel de administración, carrito de compras y gestión de productos.

---

## Dependencias

### Para ejecutar solo el frontend (sin base de datos):
- Navegador web moderno (Chrome, Firefox, Edge, Safari)
- Servidor web local (opcional)

### Para ejecutar con base de datos PostgreSQL:
- Node.js v18 o superior
- PostgreSQL v14 o superior
- npm o yarn

---

## Instalación y Ejecución

### Opción 1: Solo Frontend (localStorage)

1. Abrir el archivo `index.html` directamente en el navegador
   ```bash
   # O usar un servidor local simple con Python
   cd public
   python -m http.server 8080
   ```
2. Acceder a `http://localhost:8080`

### Opción 2: Con PostgreSQL

1. Instalar PostgreSQL en tu sistema
   - Windows: https://www.postgresql.org/download/windows/
   - Mac: `brew install postgresql`
   - Linux: `sudo apt install postgresql`

2. Crear la base de datos:
   ```bash
   psql -U postgres
   CREATE DATABASE soundspin_db;
   \q
   ```

3. Ejecutar el script de inicialización:
   ```bash
   psql -U postgres -d soundspin_db -f database/init.sql
   ```

4. Configurar las variables de entorno:
   ```bash
   cp .env.example .env
   # Editar .env con tus credenciales de PostgreSQL
   ```

5. Instalar dependencias del servidor:
   ```bash
   npm install
   ```

6. Iniciar el servidor:
   ```bash
   npm start
   ```

7. Acceder a `http://localhost:3000`

---

## Credenciales de Administrador

| Correo                      | Contraseña    |
|-----------------------------|---------------|
| admin@soundspin.com         | Admin123!     |
| gerente@soundspin.com       | Gerente456!   |
| supervisor@soundspin.com    | Super789!     |

---

## Estructura del Proyecto

```
public/
├── index.html          # Página principal HTML
├── styles.css          # Estilos CSS
├── app.js              # Lógica JavaScript
└── README.md           # Este archivo

database/
├── init.sql            # Script de inicialización de PostgreSQL
└── config.js           # Configuración de conexión a la base de datos

server/
└── index.js            # Servidor Node.js con API REST
```

---

## Funcionalidades

### Usuario Normal
- Ver catálogo de productos (Vinilos, CDs, Merch)
- Filtrar y buscar productos
- Agregar productos al carrito
- Realizar compras
- Registro e inicio de sesión

### Administrador
- Dashboard con estadísticas de ventas en tiempo real
- Gráfico de ventas mensuales
- Agregar nuevos productos
- Editar productos (nombre, precio, imagen)
- Eliminar productos
- Ver historial de ventas
- Gestión de usuarios

---

## API Endpoints (con servidor Node.js)

### Autenticación
- `POST /api/auth/login` - Iniciar sesión
- `POST /api/auth/register` - Registrar usuario
- `POST /api/auth/logout` - Cerrar sesión

### Productos
- `GET /api/products` - Obtener todos los productos
- `GET /api/products/:id` - Obtener producto por ID
- `POST /api/products` - Crear producto (admin)
- `PUT /api/products/:id` - Actualizar producto (admin)
- `DELETE /api/products/:id` - Eliminar producto (admin)

### Ventas
- `GET /api/sales` - Obtener ventas (admin)
- `POST /api/sales` - Registrar venta
- `GET /api/sales/stats` - Estadísticas de ventas (admin)

### Usuarios
- `GET /api/users` - Obtener usuarios (admin)
- `DELETE /api/users/:id` - Eliminar usuario (admin)

---

## Notas

- Sin servidor, los datos se almacenan en localStorage del navegador
- Con PostgreSQL, los datos persisten en la base de datos
- Las contraseñas se almacenan hasheadas con bcrypt en la versión con servidor
