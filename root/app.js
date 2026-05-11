/**
 * ==================== SOUNDSPIN RECORDS - APLICACION PRINCIPAL ====================
 * Tienda de musica con sistema de administracion
 * Desarrollado con HTML, CSS y JavaScript puro (sin frameworks)
 * 
 * CREDENCIALES DE ADMINISTRADOR:
 * 1. admin@soundspin.com / Admin123!
 * 2. gerente@soundspin.com / Gerente456!
 * 3. supervisor@soundspin.com / Super789!
 */

// ==================== INICIALIZACION DE DATOS ====================
// Funcion para inicializar los datos en localStorage si no existen

function inicializarDatos() {
    // Verificar si ya existen los datos
    if (!localStorage.getItem('soundspin_inicializado')) {
        
        // Crear usuarios administradores con credenciales personalizadas
        const usuariosIniciales = [
            {
                id: 'admin-001',
                nombre: 'Administrador Principal',
                email: 'admin@soundspin.com',
                password: 'Admin123!',
                rol: 'admin'
            },
            {
                id: 'admin-002',
                nombre: 'Gerente de Tienda',
                email: 'gerente@soundspin.com',
                password: 'Gerente456!',
                rol: 'admin'
            },
            {
                id: 'admin-003',
                nombre: 'Supervisor de Ventas',
                email: 'supervisor@soundspin.com',
                password: 'Super789!',
                rol: 'admin'
            }
        ];
        
        // Crear productos iniciales con imagenes de Unsplash
        const productosIniciales = [
            {
                id: 'prod-001',
                nombre: 'Abbey Road',
                artista: 'The Beatles',
                precio: 34.99,
                precioOriginal: 44.99,
                categoria: 'Vinilo',
                imagen: 'https://images.unsplash.com/photo-1629276301820-0f3eedc29571?w=400&h=400&fit=crop',
                descripcion: 'El icónico álbum de The Beatles en vinilo de alta calidad. Remasterizado para una experiencia auditiva superior.',
                esNuevo: false,
                esPreventa: false,
                condicion: 'Nuevo',
                origen: 'Importado UK'
            }
        
        ];
        
        // Crear ventas iniciales para las estadisticas
        const ventasIniciales = [
            { id: 'venta-001', productoId: 'prod-001', producto: 'Abbey Road', cantidad: 2, total: 69.98, fecha: '2024-01-15' }
        ];
        
        // Guardar datos en localStorage
        localStorage.setItem('soundspin_usuarios', JSON.stringify(usuariosIniciales));
        localStorage.setItem('soundspin_productos', JSON.stringify(productosIniciales));
        localStorage.setItem('soundspin_ventas', JSON.stringify(ventasIniciales));
        localStorage.setItem('soundspin_carrito', JSON.stringify([]));
        localStorage.setItem('soundspin_inicializado', 'true');
    }
}

// ==================== VARIABLES GLOBALES ====================
// Variables para manejar el estado de la aplicacion

let usuarioActual = null; // Usuario actualmente logueado
let paginaActual = 'inicio'; // Pagina actualmente mostrada
let productoEditando = null; // Producto en edicion (para el modal)

// ==================== FUNCIONES DE UTILIDAD ====================
// Funciones auxiliares para operaciones comunes

/**
 * Obtiene los datos de localStorage
 * @param {string} clave - Clave del item en localStorage
 * @returns {Array|Object} - Datos parseados o array vacio
 */
function obtenerDatos(clave) {
    const datos = localStorage.getItem(clave);
    return datos ? JSON.parse(datos) : [];
}

/**
 * Guarda datos en localStorage
 * @param {string} clave - Clave del item en localStorage
 * @param {Array|Object} datos - Datos a guardar
 */
function guardarDatos(clave, datos) {
    localStorage.setItem(clave, JSON.stringify(datos));
}

/**
 * Genera un ID unico
 * @returns {string} - ID unico generado
 */
function generarId() {
    return 'id-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
}

/**
 * Muestra una notificacion toast
 * @param {string} mensaje - Mensaje a mostrar
 * @param {string} tipo - Tipo de notificacion (exito, error)
 */
function mostrarToast(mensaje, tipo = 'exito') {
    // Eliminar toast existente si hay uno
    const toastExistente = document.querySelector('.toast');
    if (toastExistente) {
        toastExistente.remove();
    }
    
    // Crear nuevo toast
    const toast = document.createElement('div');
    toast.className = `toast ${tipo}`;
    toast.innerHTML = `
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${tipo === 'exito' 
                ? '<polyline points="20 6 9 17 4 12"></polyline>' 
                : '<circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line>'}
        </svg>
        <span>${mensaje}</span>
    `;
    
    document.body.appendChild(toast);
    
    // Mostrar con animacion
    setTimeout(() => toast.classList.add('activo'), 10);
    
    // Ocultar despues de 3 segundos
    setTimeout(() => {
        toast.classList.remove('activo');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ==================== FUNCIONES DE NAVEGACION ====================
// Funciones para manejar la navegacion entre paginas

/**
 * Navega a una pagina especifica
 * @param {string} pagina - Nombre de la pagina destino
 * @param {string} productoId - ID del producto (opcional, para detalle)
 */
function navegarA(pagina, productoId = null) {
    // Prevenir comportamiento por defecto del enlace
    event?.preventDefault();
    
    // Verificar permisos para pagina de admin
    if (pagina === 'admin' && (!usuarioActual || usuarioActual.rol !== 'admin')) {
        mostrarToast('Acceso denegado. Solo administradores.', 'error');
        return;
    }
    
    paginaActual = pagina;
    
    // Actualizar clases activas en navegacion
    document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
        if (link.dataset.pagina === pagina) {
            link.classList.add('active');
        }
    });
    
    // Renderizar la pagina correspondiente
    const contenido = document.getElementById('contenidoPrincipal');
    
    // Ocultar/mostrar footer segun la pagina
    const footer = document.getElementById('footer');
    
    switch (pagina) {
        case 'inicio':
            renderizarInicio();
            footer.style.display = 'block';
            break;
        case 'catalogo':
            renderizarCatalogo();
            footer.style.display = 'block';
            break;
        case 'nosotros':
            renderizarNosotros();
            footer.style.display = 'block';
            break;
        case 'contacto':
            renderizarContacto();
            footer.style.display = 'block';
            break;
        case 'login':
            renderizarLogin();
            footer.style.display = 'block';
            break;
        case 'carrito':
            renderizarCarrito();
            footer.style.display = 'block';
            break;
        case 'detalle':
            renderizarDetalle(productoId);
            footer.style.display = 'block';
            break;
        case 'admin':
            renderizarAdmin();
            footer.style.display = 'none';
            break;
        default:
            renderizarInicio();
            footer.style.display = 'block';
    }
    
    // Scroll al inicio de la pagina
    window.scrollTo(0, 0);
}

// ==================== FUNCIONES DE AUTENTICACION ====================
// Funciones para manejar el login y logout de usuarios

/**
 * Inicia sesion con las credenciales proporcionadas
 * @param {Event} e - Evento del formulario
 */
function iniciarSesion(e) {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    // Validar campos
    if (!email || !password) {
        mostrarToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Buscar usuario en la base de datos
    const usuarios = obtenerDatos('soundspin_usuarios');
    const usuario = usuarios.find(u => u.email === email && u.password === password);
    
    if (usuario) {
        // Login exitoso
        usuarioActual = usuario;
        localStorage.setItem('soundspin_sesion', JSON.stringify(usuario));
        actualizarUI();
        
        // Redirigir segun el rol del usuario
        if (usuario.rol === 'admin') {
            navegarA('admin');
            mostrarToast(`Bienvenido, ${usuario.nombre}`);
        } else {
            navegarA('inicio');
            mostrarToast(`Bienvenido, ${usuario.nombre}`);
        }
    } else {
        mostrarToast('Credenciales incorrectas', 'error');
    }
}

/**
 * Registra un nuevo usuario
 * @param {Event} e - Evento del formulario
 */
function registrarUsuario(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('registerNombre').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    
    // Validar campos
    if (!nombre || !email || !password) {
        mostrarToast('Por favor completa todos los campos', 'error');
        return;
    }
    
    // Verificar si el email ya existe
    const usuarios = obtenerDatos('soundspin_usuarios');
    if (usuarios.find(u => u.email === email)) {
        mostrarToast('Este correo ya esta registrado', 'error');
        return;
    }
    
    // Crear nuevo usuario (siempre como usuario normal, no admin)
    const nuevoUsuario = {
        id: generarId(),
        nombre: nombre,
        email: email,
        password: password,
        rol: 'usuario'
    };
    
    usuarios.push(nuevoUsuario);
    guardarDatos('soundspin_usuarios', usuarios);
    
    // Iniciar sesion automaticamente
    usuarioActual = nuevoUsuario;
    localStorage.setItem('soundspin_sesion', JSON.stringify(nuevoUsuario));
    actualizarUI();
    navegarA('inicio');
    mostrarToast('Cuenta creada exitosamente');
}

/**
 * Cierra la sesion del usuario actual
 */
function cerrarSesion() {
    usuarioActual = null;
    localStorage.removeItem('soundspin_sesion');
    actualizarUI();
    navegarA('inicio');
    mostrarToast('Sesion cerrada');
}

/**
 * Actualiza la interfaz de usuario segun el estado de autenticacion
 */
function actualizarUI() {
    const usuarioNoAuth = document.getElementById('usuarioNoAuth');
    const usuarioAuth = document.getElementById('usuarioAuth');
    const nombreUsuario = document.getElementById('nombreUsuario');
    const linkAdmin = document.getElementById('linkAdmin');
    
    if (usuarioActual) {
        // Usuario autenticado
        usuarioNoAuth.style.display = 'none';
        usuarioAuth.style.display = 'flex';
        nombreUsuario.textContent = `Hola, ${usuarioActual.nombre.split(' ')[0]}`;
        
        // Mostrar link de admin si es administrador
        if (usuarioActual.rol === 'admin') {
            linkAdmin.style.display = 'inline-block';
        } else {
            linkAdmin.style.display = 'none';
        }
    } else {
        // Usuario no autenticado
        usuarioNoAuth.style.display = 'block';
        usuarioAuth.style.display = 'none';
        linkAdmin.style.display = 'none';
    }
    
    // Actualizar contador del carrito
    actualizarContadorCarrito();
}

// ==================== FUNCIONES DEL CARRITO ====================
// Funciones para manejar el carrito de compras

/**
 * Agrega un producto al carrito
 * @param {string} productoId - ID del producto a agregar
 */
function agregarAlCarrito(productoId) {
    event?.stopPropagation();
    
    const productos = obtenerDatos('soundspin_productos');
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        mostrarToast('Producto no encontrado', 'error');
        return;
    }
    
    let carrito = obtenerDatos('soundspin_carrito');
    
    // Verificar si el producto ya esta en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);
    
    if (itemExistente) {
        // Incrementar cantidad
        itemExistente.cantidad += 1;
    } else {
        // Agregar nuevo item
        carrito.push({
            id: producto.id,
            nombre: producto.nombre,
            artista: producto.artista,
            precio: producto.precio,
            imagen: producto.imagen,
            cantidad: 1,
            esPreventa: producto.esPreventa
        });
    }
    
    guardarDatos('soundspin_carrito', carrito);
    actualizarContadorCarrito();
    mostrarToast('Producto agregado al carrito');
}

/**
 * Elimina un producto del carrito
 * @param {string} productoId - ID del producto a eliminar
 */
function eliminarDelCarrito(productoId) {
    let carrito = obtenerDatos('soundspin_carrito');
    carrito = carrito.filter(item => item.id !== productoId);
    guardarDatos('soundspin_carrito', carrito);
    actualizarContadorCarrito();
    renderizarCarrito();
    mostrarToast('Producto eliminado del carrito');
}

/**
 * Actualiza el contador visual del carrito
 */
function actualizarContadorCarrito() {
    const carrito = obtenerDatos('soundspin_carrito');
    const contador = carrito.reduce((acc, item) => acc + item.cantidad, 0);
    document.getElementById('carritoContador').textContent = contador;
}

/**
 * Procesa la compra del carrito
 */
function procesarCompra() {
    const carrito = obtenerDatos('soundspin_carrito');
    
    if (carrito.length === 0) {
        mostrarToast('El carrito esta vacio', 'error');
        return;
    }
    
    // Calcular total
    const total = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    // Registrar ventas
    let ventas = obtenerDatos('soundspin_ventas');
    const fecha = new Date().toISOString().split('T')[0];
    
    carrito.forEach(item => {
        ventas.push({
            id: generarId(),
            productoId: item.id,
            producto: item.nombre,
            cantidad: item.cantidad,
            total: item.precio * item.cantidad,
            fecha: fecha
        });
    });
    
    guardarDatos('soundspin_ventas', ventas);
    
    // Vaciar carrito
    guardarDatos('soundspin_carrito', []);
    actualizarContadorCarrito();
    
    // Mostrar mensaje de exito
    mostrarToast('Compra realizada exitosamente');
    navegarA('inicio');
}

// ==================== FUNCIONES DE PRODUCTOS (ADMIN) ====================
// Funciones para administrar productos

/**
 * Agrega un nuevo producto
 * @param {Event} e - Evento del formulario
 */
function agregarProducto(e) {
    e.preventDefault();
    
    const nombre = document.getElementById('productoNombre').value.trim();
    const artista = document.getElementById('productoArtista').value.trim();
    const precio = parseFloat(document.getElementById('productoPrecio').value) || 0;
    const categoria = document.getElementById('productoCategoria').value;
    const imagen = document.getElementById('productoImagen').value.trim();
    const esPreventa = document.getElementById('productoPreventa').checked;
    
    // Validar campos requeridos
    if (!nombre || !artista || precio <= 0) {
        mostrarToast('Completa los campos requeridos', 'error');
        return;
    }
    
    // Crear nuevo producto
    const nuevoProducto = {
        id: generarId(),
        nombre: nombre,
        artista: artista,
        precio: precio,
        precioOriginal: null,
        categoria: categoria,
        imagen: imagen || 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&h=400&fit=crop',
        descripcion: 'Producto de alta calidad disponible en SoundSpin Records.',
        esNuevo: true,
        esPreventa: esPreventa,
        condicion: 'Nuevo',
        origen: 'Mexico'
    };
    
    let productos = obtenerDatos('soundspin_productos');
    productos.push(nuevoProducto);
    guardarDatos('soundspin_productos', productos);
    
    // Limpiar formulario
    e.target.reset();
    
    // Actualizar tabla
    renderizarTablaProductos();
    mostrarToast('Producto agregado exitosamente');
}

/**
 * Elimina un producto
 * @param {string} productoId - ID del producto a eliminar
 */
function eliminarProducto(productoId) {
    if (!confirm('¿Estas seguro de eliminar este producto?')) {
        return;
    }
    
    let productos = obtenerDatos('soundspin_productos');
    productos = productos.filter(p => p.id !== productoId);
    guardarDatos('soundspin_productos', productos);
    
    renderizarTablaProductos();
    mostrarToast('Producto eliminado');
}

/**
 * Abre el modal de edicion de producto
 * @param {string} productoId - ID del producto a editar
 */
function abrirModalEdicion(productoId) {
    const productos = obtenerDatos('soundspin_productos');
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        mostrarToast('Producto no encontrado', 'error');
        return;
    }
    
    productoEditando = producto;
    
    // Llenar formulario con datos del producto
    document.getElementById('editNombre').value = producto.nombre;
    document.getElementById('editArtista').value = producto.artista;
    document.getElementById('editPrecio').value = producto.precio;
    document.getElementById('editImagen').value = producto.imagen;
    
    // Mostrar modal
    document.getElementById('modalEdicion').classList.add('activo');
}

/**
 * Cierra el modal de edicion
 */
function cerrarModal() {
    document.getElementById('modalEdicion').classList.remove('activo');
    productoEditando = null;
}

/**
 * Guarda los cambios del producto editado
 * @param {Event} e - Evento del formulario
 */
function guardarEdicion(e) {
    e.preventDefault();
    
    if (!productoEditando) return;
    
    let productos = obtenerDatos('soundspin_productos');
    const index = productos.findIndex(p => p.id === productoEditando.id);
    
    if (index === -1) {
        mostrarToast('Producto no encontrado', 'error');
        return;
    }
    
    // Actualizar datos del producto
    productos[index].nombre = document.getElementById('editNombre').value.trim();
    productos[index].artista = document.getElementById('editArtista').value.trim();
    productos[index].precio = parseFloat(document.getElementById('editPrecio').value) || productos[index].precio;
    productos[index].imagen = document.getElementById('editImagen').value.trim() || productos[index].imagen;
    
    guardarDatos('soundspin_productos', productos);
    
    cerrarModal();
    renderizarTablaProductos();
    mostrarToast('Producto actualizado');
}

/**
 * Elimina un usuario (solo para admins)
 * @param {string} usuarioId - ID del usuario a eliminar
 */
function eliminarUsuario(usuarioId) {
    if (!confirm('¿Estas seguro de eliminar este usuario?')) {
        return;
    }
    
    let usuarios = obtenerDatos('soundspin_usuarios');
    const usuario = usuarios.find(u => u.id === usuarioId);
    
    // No permitir eliminar admins
    if (usuario && usuario.rol === 'admin') {
        mostrarToast('No se puede eliminar un administrador', 'error');
        return;
    }
    
    usuarios = usuarios.filter(u => u.id !== usuarioId);
    guardarDatos('soundspin_usuarios', usuarios);
    
    renderizarTablaUsuarios();
    mostrarToast('Usuario eliminado');
}

// ==================== FUNCIONES DE RENDERIZADO ====================
// Funciones para renderizar las diferentes paginas

/**
 * Renderiza la pagina de inicio
 */
function renderizarInicio() {
    const productos = obtenerDatos('soundspin_productos');
    
    // Filtrar productos por categoria
    const nuevos = productos.filter(p => p.esNuevo).slice(0, 4);
    const ofertas = productos.filter(p => p.precioOriginal && p.precioOriginal > p.precio).slice(0, 4);
    const musica = productos.filter(p => p.categoria === 'CD' || p.categoria === 'Vinilo').slice(0, 8);
    const merch = productos.filter(p => p.categoria === 'Merch').slice(0, 4);
    
    const contenido = document.getElementById('contenidoPrincipal');
    contenido.innerHTML = `
        <!-- Seccion Hero -->
        <section class="hero">
            <div class="hero-imagen">
                <img src="https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=1920&h=1080&fit=crop" alt="Tienda de musica">
            </div>
            <div class="hero-overlay"></div>
            <div class="hero-contenido">
                <h1 class="hero-titulo">Autentica Experiencia Sonora</h1>
                <p class="hero-subtitulo">El arte de escuchar musica en su forma mas pura.</p>
                <a href="#" class="btn btn-primario" onclick="navegarA('catalogo')">Explorar Catalogo</a>
            </div>
        </section>
        
        <!-- Nuevos Lanzamientos -->
        ${nuevos.length > 0 ? `
        <section class="seccion">
            <div class="seccion-container">
                <div class="seccion-header">
                    <h2 class="seccion-titulo">Nuevos Lanzamientos</h2>
                </div>
                <div class="productos-grid">
                    ${nuevos.map(p => renderizarTarjetaProducto(p)).join('')}
                </div>
            </div>
        </section>
        ` : ''}
        
        <!-- Ofertas Especiales -->
        ${ofertas.length > 0 ? `
        <section class="seccion" style="background-color: var(--color-gris-claro);">
            <div class="seccion-container">
                <div class="seccion-header">
                    <h2 class="seccion-titulo">Ofertas Especiales</h2>
                </div>
                <div class="productos-grid">
                    ${ofertas.map(p => renderizarTarjetaProducto(p)).join('')}
                </div>
            </div>
        </section>
        ` : ''}
        
        <!-- Vinilos y CDs -->
        <section class="seccion">
            <div class="seccion-container">
                <div class="seccion-header">
                    <h2 class="seccion-titulo">Seleccion de Vinilos y CDs</h2>
                    <a href="#" class="seccion-link" onclick="navegarA('catalogo')">Ver todos</a>
                </div>
                <div class="productos-grid">
                    ${musica.map(p => renderizarTarjetaProducto(p)).join('')}
                </div>
            </div>
        </section>
        
        <!-- Merchandising -->
        ${merch.length > 0 ? `
        <section class="seccion" style="background-color: var(--color-gris-claro);">
            <div class="seccion-container">
                <div class="seccion-header">
                    <h2 class="seccion-titulo">Merchandising</h2>
                    <a href="#" class="seccion-link" onclick="navegarA('catalogo')">Ver todos</a>
                </div>
                <div class="productos-grid">
                    ${merch.map(p => renderizarTarjetaProducto(p)).join('')}
                </div>
            </div>
        </section>
        ` : ''}
    `;
}

/**
 * Renderiza una tarjeta de producto
 * @param {Object} producto - Datos del producto
 * @returns {string} - HTML de la tarjeta
 */
function renderizarTarjetaProducto(producto) {
    const tieneDescuento = producto.precioOriginal && producto.precioOriginal > producto.precio;
    
    return `
        <article class="producto-card" onclick="navegarA('detalle', '${producto.id}')">
            <div class="producto-imagen">
                <img src="${producto.imagen}" alt="${producto.nombre}" loading="lazy">
                <div class="producto-etiquetas">
                    ${producto.esNuevo ? '<span class="etiqueta etiqueta-nuevo">Nuevo</span>' : ''}
                    ${tieneDescuento ? '<span class="etiqueta etiqueta-oferta">Oferta</span>' : ''}
                    ${producto.esPreventa ? '<span class="etiqueta etiqueta-preventa">Preventa</span>' : ''}
                </div>
                <div class="producto-acciones">
                    <button class="btn-agregar-carrito" onclick="agregarAlCarrito('${producto.id}')" title="Agregar al carrito">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="8" cy="21" r="1"></circle>
                            <circle cx="19" cy="21" r="1"></circle>
                            <path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"></path>
                        </svg>
                    </button>
                </div>
            </div>
            <div class="producto-info">
                <p class="producto-artista">${producto.artista}</p>
                <h3 class="producto-nombre">${producto.nombre}</h3>
                <div class="producto-precios">
                    ${tieneDescuento ? `<span class="precio-original">$${producto.precioOriginal.toFixed(2)}</span>` : ''}
                    <span class="precio-actual">$${producto.precio.toFixed(2)}</span>
                </div>
            </div>
        </article>
    `;
}

/**
 * Renderiza la pagina del catalogo
 */
function renderizarCatalogo() {
    const contenido = document.getElementById('contenidoPrincipal');
    contenido.innerHTML = `
        <section class="seccion">
            <div class="seccion-container">
                <div class="catalogo-header">
                    <h1 class="catalogo-titulo">Catalogo Completo</h1>
                    <p class="catalogo-descripcion">Explora nuestra seleccion curada de musica en formato fisico y la mejor mercancia de tus artistas favoritos.</p>
                </div>
                
                <div class="catalogo-filtros">
                    <div class="filtros-categorias">
                        <span class="filtros-label">Filtros:</span>
                        <button class="filtro-btn activo" onclick="filtrarProductos('Todos')">Todos</button>
                        <button class="filtro-btn" onclick="filtrarProductos('Vinilo')">Vinilo</button>
                        <button class="filtro-btn" onclick="filtrarProductos('CD')">CD</button>
                        <button class="filtro-btn" onclick="filtrarProductos('Merch')">Merch</button>
                    </div>
                    <div class="busqueda-container">
                        <svg class="busqueda-icono" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <circle cx="11" cy="11" r="8"></circle>
                            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
                        </svg>
                        <input type="text" class="busqueda-input" id="busquedaInput" placeholder="Buscar por nombre o artista..." oninput="buscarProductos()">
                    </div>
                </div>
                
                <div id="productosContainer" class="productos-grid">
                    <!-- Productos se cargan dinamicamente -->
                </div>
            </div>
        </section>
    `;
    
    // Renderizar productos iniciales
    filtrarProductos('Todos');
}

/**
 * Filtra productos por categoria
 * @param {string} categoria - Categoria a filtrar
 */
function filtrarProductos(categoria) {
    // Actualizar boton activo
    document.querySelectorAll('.filtro-btn').forEach(btn => {
        btn.classList.remove('activo');
        if (btn.textContent === categoria) {
            btn.classList.add('activo');
        }
    });
    
    const productos = obtenerDatos('soundspin_productos');
    const busqueda = document.getElementById('busquedaInput')?.value.toLowerCase() || '';
    
    // Filtrar por categoria y busqueda
    let productosFiltrados = productos.filter(p => {
        const coincideCategoria = categoria === 'Todos' || p.categoria === categoria;
        const coincideBusqueda = p.nombre.toLowerCase().includes(busqueda) || 
                                  p.artista.toLowerCase().includes(busqueda);
        return coincideCategoria && coincideBusqueda;
    });
    
    renderizarProductosFiltrados(productosFiltrados);
}

/**
 * Busca productos por termino de busqueda
 */
function buscarProductos() {
    // Obtener categoria activa
    const categoriaActiva = document.querySelector('.filtro-btn.activo')?.textContent || 'Todos';
    filtrarProductos(categoriaActiva);
}

/**
 * Renderiza los productos filtrados
 * @param {Array} productos - Lista de productos a renderizar
 */
function renderizarProductosFiltrados(productos) {
    const container = document.getElementById('productosContainer');
    
    if (productos.length === 0) {
        container.innerHTML = `
            <div class="sin-resultados" style="grid-column: 1 / -1;">
                <h3>No se encontraron resultados</h3>
                <p>Intenta buscar con otros terminos o ajusta los filtros.</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = productos.map(p => renderizarTarjetaProducto(p)).join('');
}

/**
 * Renderiza la pagina de login
 */
function renderizarLogin() {
    const contenido = document.getElementById('contenidoPrincipal');
    contenido.innerHTML = `
        <div class="login-container">
            <div class="login-card">
                <h1 class="login-titulo" id="loginTitulo">Iniciar Sesion</h1>
                <p class="login-subtitulo" id="loginSubtitulo">
                    ¿No tienes cuenta? <a href="#" onclick="toggleRegistro()">Registrate aqui</a>
                </p>
                
                <!-- Formulario de Login -->
                <form id="formLogin" onsubmit="iniciarSesion(event)">
                    <div class="form-grupo">
                        <label class="form-label" for="loginEmail">Correo Electronico</label>
                        <div class="form-input-container">
                            <svg class="form-input-icono" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <input type="email" id="loginEmail" class="form-input" placeholder="tu@email.com" required>
                        </div>
                    </div>
                    
                    <div class="form-grupo">
                        <label class="form-label" for="loginPassword">Contrasena</label>
                        <div class="form-input-container">
                            <svg class="form-input-icono" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <input type="password" id="loginPassword" class="form-input" placeholder="Tu contrasena" required>
                        </div>
                    </div>
                    
                    <button type="submit" class="login-btn">Entrar a la tienda</button>
                </form>
                
                <!-- Formulario de Registro (oculto por defecto) -->
                <form id="formRegistro" style="display: none;" onsubmit="registrarUsuario(event)">
                    <div class="form-grupo">
                        <label class="form-label" for="registerNombre">Nombre Completo</label>
                        <div class="form-input-container">
                            <svg class="form-input-icono" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                                <circle cx="12" cy="7" r="4"></circle>
                            </svg>
                            <input type="text" id="registerNombre" class="form-input" placeholder="Tu nombre" required>
                        </div>
                    </div>
                    
                    <div class="form-grupo">
                        <label class="form-label" for="registerEmail">Correo Electronico</label>
                        <div class="form-input-container">
                            <svg class="form-input-icono" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                <polyline points="22,6 12,13 2,6"></polyline>
                            </svg>
                            <input type="email" id="registerEmail" class="form-input" placeholder="tu@email.com" required>
                        </div>
                    </div>
                    
                    <div class="form-grupo">
                        <label class="form-label" for="registerPassword">Contrasena</label>
                        <div class="form-input-container">
                            <svg class="form-input-icono" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            <input type="password" id="registerPassword" class="form-input" placeholder="Crea tu contrasena" required>
                        </div>
                    </div>
                    
                    <button type="submit" class="login-btn">Registrarse</button>
                </form>
            </div>
        </div>
    `;
}

/**
 * Alterna entre formulario de login y registro
 */
function toggleRegistro() {
    event.preventDefault();
    
    const formLogin = document.getElementById('formLogin');
    const formRegistro = document.getElementById('formRegistro');
    const titulo = document.getElementById('loginTitulo');
    const subtitulo = document.getElementById('loginSubtitulo');
    
    if (formLogin.style.display !== 'none') {
        // Mostrar registro
        formLogin.style.display = 'none';
        formRegistro.style.display = 'block';
        titulo.textContent = 'Crear Cuenta';
        subtitulo.innerHTML = '¿Ya tienes cuenta? <a href="#" onclick="toggleRegistro()">Inicia sesion aqui</a>';
    } else {
        // Mostrar login
        formLogin.style.display = 'block';
        formRegistro.style.display = 'none';
        titulo.textContent = 'Iniciar Sesion';
        subtitulo.innerHTML = '¿No tienes cuenta? <a href="#" onclick="toggleRegistro()">Registrate aqui</a>';
    }
}

/**
 * Renderiza la pagina del carrito
 */
function renderizarCarrito() {
    const carrito = obtenerDatos('soundspin_carrito');
    const contenido = document.getElementById('contenidoPrincipal');
    
    if (carrito.length === 0) {
        contenido.innerHTML = `
            <section class="seccion">
                <div class="seccion-container">
                    <div class="carrito-vacio">
                        <div class="carrito-vacio-icono">
                            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <circle cx="12" cy="12" r="10"></circle>
                                <circle cx="12" cy="12" r="3"></circle>
                            </svg>
                        </div>
                        <h2>Tu carrito esta vacio</h2>
                        <p>Aun no has seleccionado ningun articulo para tu coleccion. Descubre nuestras ultimas novedades.</p>
                        <a href="#" class="btn btn-secundario" onclick="navegarA('catalogo')">Explorar Catalogo</a>
                    </div>
                </div>
            </section>
        `;
        return;
    }
    
    // Calcular totales
    const subtotal = carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const envio = subtotal > 50 ? 0 : 5;
    const total = subtotal + envio;
    
    contenido.innerHTML = `
        <section class="seccion">
            <div class="seccion-container">
                <h1 class="seccion-titulo" style="margin-bottom: var(--espaciado-xl);">Tu Seleccion</h1>
                
                <div class="carrito-layout">
                    <div class="carrito-items">
                        ${carrito.map(item => `
                            <div class="carrito-item">
                                <div class="carrito-item-imagen">
                                    <img src="${item.imagen}" alt="${item.nombre}">
                                </div>
                                <div class="carrito-item-info">
                                    <span class="carrito-item-artista">${item.artista}</span>
                                    <h3 class="carrito-item-nombre">${item.nombre}</h3>
                                    <span class="carrito-item-cantidad">Cant: ${item.cantidad}</span>
                                    ${item.esPreventa ? '<span class="etiqueta etiqueta-preventa" style="width: fit-content; margin-top: var(--espaciado-xs);">Preventa</span>' : ''}
                                    <div class="carrito-item-acciones">
                                        <span class="carrito-item-precio">$${(item.precio * item.cantidad).toFixed(2)}</span>
                                        <button class="btn-remover" onclick="eliminarDelCarrito('${item.id}')">Remover</button>
                                    </div>
                                </div>
                            </div>
                        `).join('')}
                    </div>
                    
                    <div class="carrito-resumen">
                        <h3>Resumen del Pedido</h3>
                        <div class="resumen-linea">
                            <span>Subtotal</span>
                            <span>$${subtotal.toFixed(2)}</span>
                        </div>
                        <div class="resumen-linea">
                            <span>Envio ${envio === 0 ? '(Gratis)' : ''}</span>
                            <span>$${envio.toFixed(2)}</span>
                        </div>
                        ${envio > 0 ? `<p class="resumen-nota">Agrega $${(50 - subtotal).toFixed(2)} mas para envio gratis.</p>` : ''}
                        <div class="resumen-total">
                            <span>Total</span>
                            <span>$${total.toFixed(2)}</span>
                        </div>
                        <button class="btn btn-secundario btn-full" onclick="procesarCompra()">
                            Proceder al Pago
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </button>
                        <p class="resumen-seguridad">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                            Pago cifrado y 100% seguro.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    `;
}

/**
 * Renderiza la pagina de detalle de producto
 * @param {string} productoId - ID del producto
 */
function renderizarDetalle(productoId) {
    const productos = obtenerDatos('soundspin_productos');
    const producto = productos.find(p => p.id === productoId);
    
    if (!producto) {
        const contenido = document.getElementById('contenidoPrincipal');
        contenido.innerHTML = `
            <section class="seccion">
                <div class="seccion-container" style="text-align: center;">
                    <h2>Producto no encontrado</h2>
                    <a href="#" class="btn btn-secundario" onclick="navegarA('catalogo')" style="margin-top: var(--espaciado-lg);">Volver al catalogo</a>
                </div>
            </section>
        `;
        return;
    }
    
    const tieneDescuento = producto.precioOriginal && producto.precioOriginal > producto.precio;
    
    const contenido = document.getElementById('contenidoPrincipal');
    contenido.innerHTML = `
        <section class="seccion">
            <div class="seccion-container">
                <a href="#" class="detalle-volver" onclick="navegarA('catalogo')">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                    Volver al catalogo
                </a>
                
                <div class="detalle-grid">
                    <div class="detalle-imagen">
                        <img src="${producto.imagen}" alt="${producto.nombre}">
                        ${producto.esNuevo ? '<span class="etiqueta etiqueta-nuevo" style="position: absolute; top: 16px; left: 16px;">Nuevo Lanzamiento</span>' : ''}
                        ${producto.esPreventa ? '<span class="etiqueta etiqueta-preventa" style="position: absolute; top: 16px; left: 16px;">Preventa Especial</span>' : ''}
                    </div>
                    
                    <div class="detalle-info">
                        <p class="detalle-artista">${producto.artista}</p>
                        <h1 class="detalle-nombre">${producto.nombre}</h1>
                        
                        <div class="detalle-precios">
                            ${tieneDescuento ? `<span class="detalle-precio-original">$${producto.precioOriginal.toFixed(2)}</span>` : ''}
                            <span class="detalle-precio">$${producto.precio.toFixed(2)}</span>
                        </div>
                        
                        <p class="detalle-descripcion">${producto.descripcion}</p>
                        
                        <div class="detalle-especificaciones">
                            <div class="especificacion">
                                <p class="especificacion-label">Formato</p>
                                <p class="especificacion-valor">${producto.categoria}</p>
                            </div>
                            ${producto.condicion ? `
                            <div class="especificacion">
                                <p class="especificacion-label">Condicion</p>
                                <p class="especificacion-valor">${producto.condicion}</p>
                            </div>
                            ` : ''}
                            ${producto.origen ? `
                            <div class="especificacion">
                                <p class="especificacion-label">Origen</p>
                                <p class="especificacion-valor">${producto.origen}</p>
                            </div>
                            ` : ''}
                        </div>
                        
                        <div class="detalle-acciones">
                            <button class="btn btn-outline" onclick="agregarAlCarrito('${producto.id}')">
                                ${producto.esPreventa ? 'Anadir Preventa' : 'Anadir al Carrito'}
                            </button>
                            <button class="btn btn-secundario" onclick="agregarAlCarrito('${producto.id}'); navegarA('carrito');">
                                ${producto.esPreventa ? 'Pre-ordenar' : 'Comprar Ahora'}
                            </button>
                        </div>
                        
                        <div class="detalle-garantias">
                            <div class="garantia">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <rect x="1" y="3" width="15" height="13"></rect>
                                    <polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon>
                                    <circle cx="5.5" cy="18.5" r="2.5"></circle>
                                    <circle cx="18.5" cy="18.5" r="2.5"></circle>
                                </svg>
                                <span>Envios seguros y empaque reforzado para vinilos.</span>
                            </div>
                            <div class="garantia">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <line x1="12" y1="16" x2="12" y2="12"></line>
                                    <line x1="12" y1="8" x2="12.01" y2="8"></line>
                                </svg>
                                <span>Atencion al cliente personalizada.</span>
                            </div>
                            <div class="garantia">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                                    <polyline points="22 4 12 14.01 9 11.01"></polyline>
                                </svg>
                                <span>Garantia de calidad en todos nuestros formatos.</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    `;
}

/**
 * Renderiza la pagina Nosotros
 */
function renderizarNosotros() {
    const contenido = document.getElementById('contenidoPrincipal');
    contenido.innerHTML = `
        <!-- Hero de Nosotros -->
        <section class="nosotros-hero">
            <div class="hero-imagen">
                <img src="https://images.unsplash.com/photo-1511379938547-c1f69419868d?w=1920&h=800&fit=crop" alt="Tienda de discos">
            </div>
            <div class="hero-overlay"></div>
            <div class="hero-contenido">
                <h1 class="hero-titulo">Nuestra Historia</h1>
                <p class="hero-subtitulo">Pasion por el sonido analogico</p>
            </div>
        </section>
        
        <!-- Contenido -->
        <section class="seccion">
            <div class="seccion-container">
                <div class="nosotros-contenido">
                    <div class="nosotros-texto">
                        <h2>El Ritual de Escuchar</h2>
                        <p>SoundSpin Records nacio en 2010 en el corazon de la Roma Norte con una mision clara: preservar y celebrar la magia de la musica en formato fisico en una era dominada por lo digital.</p>
                        <p>No somos solo una tienda, somos un punto de encuentro para melomanos. Creemos que la musica no solo se escucha, sino que se siente, se toca y se colecciona. Bajar la aguja sobre un vinilo es un ritual que merece ser respetado.</p>
                        <p>Seleccionamos cuidadosamente cada titulo de nuestro catalogo, desde primeras ediciones y rarezas hasta los lanzamientos mas frescos de la escena independiente global.</p>
                    </div>
                    <div class="nosotros-imagen">
                        <img src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&h=450&fit=crop" alt="Coleccion de vinilos">
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Estadisticas -->
        <section class="estadisticas">
            <div class="estadisticas-grid">
                <div class="estadistica-item">
                    <h3>10k+</h3>
                    <p>Discos Vendidos</p>
                </div>
                <div class="estadistica-item">
                    <h3>5k+</h3>
                    <p>Coleccionistas</p>
                </div>
                <div class="estadistica-item">
                    <h3>1,500+</h3>
                    <p>Titulos Unicos</p>
                </div>
            </div>
        </section>
    `;
}

/**
 * Renderiza la pagina de Contacto
 */
function renderizarContacto() {
    const contenido = document.getElementById('contenidoPrincipal');
    contenido.innerHTML = `
        <section class="seccion">
            <div class="seccion-container">
                <div class="contacto-header">
                    <h1 class="contacto-titulo">Encuentranos</h1>
                    <p class="contacto-descripcion">Visita nuestra tienda fisica en el corazon de la Ciudad de Mexico y descubre nuestra extensa coleccion en persona.</p>
                </div>
                
                <div class="contacto-grid">
                    <div class="contacto-info">
                        <h3>Informacion de la Tienda</h3>
                        
                        <div class="contacto-item">
                            <div class="contacto-item-icono">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                                    <circle cx="12" cy="10" r="3"></circle>
                                </svg>
                            </div>
                            <div>
                                <h4>Direccion</h4>
                                <p>Colima 123, Roma Norte<br>Cuauhtemoc, 06700<br>Ciudad de Mexico, CDMX</p>
                                <p style="font-size: 0.75rem; color: var(--color-texto-terciario); margin-top: var(--espaciado-xs);">Referencias: A media cuadra del Parque Rio de Janeiro, fachada color negro.</p>
                            </div>
                        </div>
                        
                        <div class="contacto-item">
                            <div class="contacto-item-icono">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <circle cx="12" cy="12" r="10"></circle>
                                    <polyline points="12 6 12 12 16 14"></polyline>
                                </svg>
                            </div>
                            <div>
                                <h4>Horarios</h4>
                                <p>Lunes - Viernes: 11am - 8pm<br>Sabados: 10am - 9pm<br>Domingos: 12pm - 6pm</p>
                            </div>
                        </div>
                        
                        <div class="contacto-item">
                            <div class="contacto-item-icono">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                                </svg>
                            </div>
                            <div>
                                <h4>Telefono</h4>
                                <p>+52 (55) 1234-5678</p>
                            </div>
                        </div>
                        
                        <div class="contacto-item">
                            <div class="contacto-item-icono">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                    <polyline points="22,6 12,13 2,6"></polyline>
                                </svg>
                            </div>
                            <div>
                                <h4>Correo Electronico</h4>
                                <p>contacto@soundspinrecords.mx</p>
                            </div>
                        </div>
                    </div>
                    
                    <div class="contacto-mapa">
                        <iframe src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3762.8039374654644!2d-99.16869468509396!3d19.41682618691119!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x85d1ff35f5bd1563%3A0x6c366f0e2de02ff7!2sColima%20123%2C%20Roma%20Nte.%2C%20Cuauht%C3%A9moc%2C%2006700%20Ciudad%20de%20M%C3%A9xico%2C%20CDMX!5e0!3m2!1ses!2smx!4v1620000000000!5m2!1ses!2smx" allowfullscreen="" loading="lazy"></iframe>
                    </div>
                </div>
            </div>
        </section>
    `;
}

/**
 * Renderiza el panel de administracion
 */
function renderizarAdmin() {
    const contenido = document.getElementById('contenidoPrincipal');
    const ventas = obtenerDatos('soundspin_ventas');
    const productos = obtenerDatos('soundspin_productos');
    const usuarios = obtenerDatos('soundspin_usuarios');
    
    // Calcular estadisticas
    const totalVentas = ventas.reduce((acc, v) => acc + v.total, 0);
    const productosVendidos = ventas.reduce((acc, v) => acc + v.cantidad, 0);
    
    // Ventas por mes (simulado)
    const ventasPorMes = [
        { mes: 'Ene', total: ventas.filter(v => v.fecha.includes('-01-')).reduce((a, v) => a + v.total, 0) || 150 },
        { mes: 'Feb', total: ventas.filter(v => v.fecha.includes('-02-')).reduce((a, v) => a + v.total, 0) || 230 },
        { mes: 'Mar', total: ventas.filter(v => v.fecha.includes('-03-')).reduce((a, v) => a + v.total, 0) || 180 },
        { mes: 'Abr', total: ventas.filter(v => v.fecha.includes('-04-')).reduce((a, v) => a + v.total, 0) || 310 },
        { mes: 'May', total: ventas.filter(v => v.fecha.includes('-05-')).reduce((a, v) => a + v.total, 0) || 280 },
        { mes: 'Jun', total: ventas.filter(v => v.fecha.includes('-06-')).reduce((a, v) => a + v.total, 0) || 195 }
    ];
    
    const maxVenta = Math.max(...ventasPorMes.map(v => v.total));
    
    contenido.innerHTML = `
        <section class="seccion" style="min-height: 100vh; background-color: var(--color-gris-claro);">
            <div class="seccion-container">
                <div class="admin-header">
                    <h1 class="admin-titulo">Panel de Administrador</h1>
                    <p class="admin-subtitulo">Gestiona tus productos, usuarios y ventas desde aqui.</p>
                </div>
                
                <div class="admin-tabs">
                    <button class="admin-tab activo" onclick="cambiarTabAdmin('dashboard')">Dashboard</button>
                    <button class="admin-tab" onclick="cambiarTabAdmin('productos')">Productos</button>
                    <button class="admin-tab" onclick="cambiarTabAdmin('usuarios')">Usuarios</button>
                </div>
                
                <!-- Panel Dashboard -->
                <div id="panelDashboard" class="admin-panel activo">
                    <div class="admin-estadisticas">
                        <div class="estadistica-card">
                            <h4>Ventas Totales</h4>
                            <p class="valor">$${totalVentas.toFixed(2)}</p>
                            <p class="cambio">+12.5% vs mes anterior</p>
                        </div>
                        <div class="estadistica-card">
                            <h4>Productos Vendidos</h4>
                            <p class="valor">${productosVendidos}</p>
                            <p class="cambio">+8.2% vs mes anterior</p>
                        </div>
                        <div class="estadistica-card">
                            <h4>Total Productos</h4>
                            <p class="valor">${productos.length}</p>
                        </div>
                        <div class="estadistica-card">
                            <h4>Usuarios Registrados</h4>
                            <p class="valor">${usuarios.length}</p>
                        </div>
                    </div>
                    
                    <!-- Grafico de ventas -->
                    <div class="grafico-container">
                        <h3 class="grafico-titulo">Ventas por Mes</h3>
                        <div class="grafico-barras">
                            ${ventasPorMes.map(v => `
                                <div class="grafico-barra" style="height: ${(v.total / maxVenta) * 100}%;">
                                    <span class="grafico-barra-valor">$${v.total}</span>
                                    <span class="grafico-barra-label">${v.mes}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                    
                    <!-- Ventas recientes -->
                    <div class="ventas-recientes">
                        <h3>Ventas Recientes</h3>
                        ${ventas.slice(-5).reverse().map(v => `
                            <div class="venta-item">
                                <div class="venta-info">
                                    <span class="venta-producto">${v.producto} (x${v.cantidad})</span>
                                    <span class="venta-fecha">${v.fecha}</span>
                                </div>
                                <span class="venta-monto">+$${v.total.toFixed(2)}</span>
                            </div>
                        `).join('')}
                    </div>
                </div>
                
                <!-- Panel Productos -->
                <div id="panelProductos" class="admin-panel">
                    <form class="admin-form" onsubmit="agregarProducto(event)">
                        <h3>Anadir Nuevo Producto</h3>
                        <div class="admin-form-grid">
                            <input type="text" id="productoNombre" class="admin-form-input" placeholder="Nombre del producto" required>
                            <input type="text" id="productoArtista" class="admin-form-input" placeholder="Artista" required>
                            <input type="number" id="productoPrecio" class="admin-form-input" placeholder="Precio" step="0.01" min="0" required>
                            <select id="productoCategoria" class="admin-form-input">
                                <option value="CD">CD</option>
                                <option value="Vinilo">Vinilo</option>
                                <option value="Merch">Merch</option>
                            </select>
                            <input type="text" id="productoImagen" class="admin-form-input full" placeholder="URL de la imagen">
                            <label class="admin-form-checkbox">
                                <input type="checkbox" id="productoPreventa">
                                Es Preventa
                            </label>
                            <button type="submit" class="btn btn-acento">Anadir</button>
                        </div>
                    </form>
                    
                    <h3 style="margin-bottom: var(--espaciado-md);">Listado de Productos (${productos.length})</h3>
                    <div class="admin-tabla-container" id="tablaProductosContainer">
                        <!-- Tabla se renderiza dinamicamente -->
                    </div>
                </div>
                
                <!-- Panel Usuarios -->
                <div id="panelUsuarios" class="admin-panel">
                    <h3 style="margin-bottom: var(--espaciado-md);">Listado de Usuarios (${usuarios.length})</h3>
                    <div class="admin-tabla-container" id="tablaUsuariosContainer">
                        <!-- Tabla se renderiza dinamicamente -->
                    </div>
                </div>
            </div>
        </section>
        
        <!-- Modal de edicion -->
        <div class="modal-overlay" id="modalEdicion">
            <div class="modal">
                <div class="modal-header">
                    <h3 class="modal-titulo">Editar Producto</h3>
                    <button class="modal-cerrar" onclick="cerrarModal()">
                        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                            <line x1="18" y1="6" x2="6" y2="18"></line>
                            <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                    </button>
                </div>
                <form class="modal-form" onsubmit="guardarEdicion(event)">
                    <div class="form-grupo">
                        <label class="form-label">Nombre</label>
                        <input type="text" id="editNombre" class="form-input" style="padding-left: var(--espaciado-md);" required>
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Artista</label>
                        <input type="text" id="editArtista" class="form-input" style="padding-left: var(--espaciado-md);" required>
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">Precio</label>
                        <input type="number" id="editPrecio" class="form-input" style="padding-left: var(--espaciado-md);" step="0.01" min="0" required>
                    </div>
                    <div class="form-grupo">
                        <label class="form-label">URL de Imagen</label>
                        <input type="text" id="editImagen" class="form-input" style="padding-left: var(--espaciado-md);">
                    </div>
                    <div class="modal-acciones">
                        <button type="button" class="btn btn-outline" onclick="cerrarModal()">Cancelar</button>
                        <button type="submit" class="btn btn-secundario">Guardar Cambios</button>
                    </div>
                </form>
            </div>
        </div>
    `;
    
    // Renderizar tablas
    renderizarTablaProductos();
    renderizarTablaUsuarios();
}

/**
 * Cambia la tab activa en el panel de admin
 * @param {string} tab - Nombre de la tab (dashboard, productos, usuarios)
 */
function cambiarTabAdmin(tab) {
    // Actualizar tabs
    document.querySelectorAll('.admin-tab').forEach(t => t.classList.remove('activo'));
    event.target.classList.add('activo');
    
    // Mostrar panel correspondiente
    document.querySelectorAll('.admin-panel').forEach(p => p.classList.remove('activo'));
    
    switch (tab) {
        case 'dashboard':
            document.getElementById('panelDashboard').classList.add('activo');
            break;
        case 'productos':
            document.getElementById('panelProductos').classList.add('activo');
            break;
        case 'usuarios':
            document.getElementById('panelUsuarios').classList.add('activo');
            break;
    }
}

/**
 * Renderiza la tabla de productos
 */
function renderizarTablaProductos() {
    const productos = obtenerDatos('soundspin_productos');
    const container = document.getElementById('tablaProductosContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <table class="admin-tabla">
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Artista</th>
                    <th>Categoria</th>
                    <th>Precio</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${productos.map(p => `
                    <tr>
                        <td>
                            ${p.nombre}
                            ${p.esPreventa ? '<span class="etiqueta etiqueta-preventa" style="margin-left: var(--espaciado-sm);">Preventa</span>' : ''}
                        </td>
                        <td>${p.artista}</td>
                        <td>${p.categoria}</td>
                        <td>$${p.precio.toFixed(2)}</td>
                        <td style="display: flex; gap: var(--espaciado-xs);">
                            <button class="btn-editar" onclick="abrirModalEdicion('${p.id}')" title="Editar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                                </svg>
                            </button>
                            <button class="btn-eliminar" onclick="eliminarProducto('${p.id}')" title="Eliminar">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

/**
 * Renderiza la tabla de usuarios
 */
function renderizarTablaUsuarios() {
    const usuarios = obtenerDatos('soundspin_usuarios');
    const container = document.getElementById('tablaUsuariosContainer');
    
    if (!container) return;
    
    container.innerHTML = `
        <table class="admin-tabla">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Nombre</th>
                    <th>Email</th>
                    <th>Rol</th>
                    <th>Acciones</th>
                </tr>
            </thead>
            <tbody>
                ${usuarios.map(u => `
                    <tr>
                        <td style="font-family: monospace; font-size: 0.75rem;">${u.id.substring(0, 12)}...</td>
                        <td>${u.nombre}</td>
                        <td>${u.email}</td>
                        <td>
                            <span style="color: ${u.rol === 'admin' ? 'var(--color-acento)' : 'var(--color-texto-secundario)'}; font-weight: ${u.rol === 'admin' ? '600' : '400'};">
                                ${u.rol}
                            </span>
                        </td>
                        <td>
                            ${u.rol !== 'admin' ? `
                                <button class="btn-eliminar" onclick="eliminarUsuario('${u.id}')" title="Eliminar Usuario">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            ` : '-'}
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

// ==================== INICIALIZACION ====================
// Codigo que se ejecuta cuando la pagina carga

document.addEventListener('DOMContentLoaded', function() {
    // Inicializar datos en localStorage
    inicializarDatos();
    
    // Restaurar sesion si existe
    const sesionGuardada = localStorage.getItem('soundspin_sesion');
    if (sesionGuardada) {
        usuarioActual = JSON.parse(sesionGuardada);
    }
    
    // Actualizar UI
    actualizarUI();
    
    // Actualizar ano en el footer
    document.getElementById('anioActual').textContent = new Date().getFullYear();
    
    // Renderizar pagina inicial
    navegarA('inicio');
});

// Cerrar modal al hacer clic fuera
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('modal-overlay')) {
        cerrarModal();
    }
});
