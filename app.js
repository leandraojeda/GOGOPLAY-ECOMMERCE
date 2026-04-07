// app.js (reestructurado y corregido)
const express = require('express');
const bodyParser = require('body-parser');
const session = require('express-session');
const path = require('path');
const fs = require('fs');

const app = express();

// Controladores y servicios
const { UserController } = require('./controllers/UserController');
const { CategoryController } = require('./controllers/CategoryController');
const { ProductController } = require('./controllers/ProductController');
const { CartController } = require('./controllers/CartController');
const { CheckoutController } = require('./controllers/CheckoutController');
const InicioController = require('./controllers/InicioController');
const UserService = require('./services/UserService');
const CategoryService = require('./services/CategoryService');
const ProductService = require('./services/ProductService');
const CartService = require('./services/CartService');
const upload = require('./config/uploadConfig');
const db = require('./models/User');

// Configuración de la vista y archivos estáticos
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Middlewares globales
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Sesión
app.use(session({
    secret: 'tu_secreto_aqui',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
        maxAge: 24 * 60 * 60 * 1000
    }
}));

// Usuario y carrito disponible en todas las vistas
app.use((req, res, next) => {
    res.locals.user = req.session.user || null;
    res.locals.cartItemCount = 0;
    next();
});

app.use(CartController.getCartItemCount);

// Middleware para cargar las categorías
app.use((req, res, next) => {
    CategoryService.getAllCategories((err, categories) => {
        res.locals.categories = err ? [] : categories;
        next();
    });
});

// Verifica carpeta uploads
if (!fs.existsSync('uploads')) {
    fs.mkdirSync('uploads', { recursive: true });
    console.log('Carpeta uploads creada exitosamente');
}

// Ruta principal (inicio)
app.get('/', InicioController.index);

// Autenticación
app.get('/login', (req, res) => {
    res.render('login', { title: 'Iniciar Sesión' });
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;
    UserService.validateUser(username, password, (err, user) => {
        if (err) return res.status(500).render('login', { error: 'Error del servidor' });

        if (user) {
            req.session.user = {
                id: user.id,
                username: user.username,
                imagen: user.imagen,
                name: user.name
            };
            return res.redirect(req.session.returnTo || '/');
        }

        res.status(401).render('login', { error: 'Credenciales inválidas' });
    });
});

/**************************** */


app.get('/logout', (req, res) => {
    req.session.destroy(() => res.redirect('/'));
});

// Middleware para proteger rutas
const checkAuth = (req, res, next) => {
    if (!req.session.user) {
        req.session.returnTo = req.originalUrl;
        return res.redirect('/login');
    }
    next();
};

// Rutas de catálogo, productos y búsqueda
app.get('/catalogo', (req, res, next) => {
    CategoryService.getAllCategories((catErr, categories) => {
        if (catErr) return next(catErr);
        ProductService.getAllProducts((prodErr, products) => {
            if (prodErr) return next(prodErr);
            res.render('products/catalogo', {
                title: 'Catálogo de Productos',
                products,
                categories,
                category: null,
                searchTerm: null
            });
        });
    });
});

app.get('/search', (req, res, next) => {
    const searchTerm = req.query.q || '';
    CategoryService.getAllCategories((catErr, categories) => {
        if (catErr) return next(catErr);
        ProductService.searchProducts(searchTerm, (prodErr, products) => {
            if (prodErr) return next(prodErr);
            res.render('products/catalogo', {
                title: `Búsqueda: ${searchTerm}`,
                categories,
                products,
                searchTerm,
                category: null
            });
        });
    });
});

// Categorías y productos individuales
app.get('/category/:id/products', (req, res, next) => {
    const categoryId = req.params.id;
    CategoryService.getAllCategories((catErr, categories) => {
        if (catErr) return next(catErr);
        CategoryService.getCategoryById(categoryId, (err, category) => {
            if (!category) return res.status(404).render('error', { message: 'Categoría no encontrada' });
            ProductService.getProductsByCategory(categoryId, (prodErr, products) => {
                if (prodErr) return next(prodErr);
                res.render('products/catalogo', {
                    title: `Productos en ${category.name}`,
                    category,
                    categories,
                    products,
                    searchTerm: null
                });
            });
        });
    });
});

app.get('/product/:id', (req, res, next) => {
    ProductService.getProductById(req.params.id, (err, product) => {
        if (!product) return res.status(404).render('error', { message: 'Producto no encontrado' });
        ProductService.getProductsByCategory(product.categoryId, (relErr, related) => {
            const relatedProducts = (related || []).filter(p => p.id !== product.id).slice(0, 4);
            res.render('products/detalle', { product, relatedProducts });
        });
    });
});

// Rutas de carrito
app.get('/cart', CartController.viewCart);
app.post('/cart/add', CartController.addToCart);
app.post('/cart/update-quantity', CartController.updateQuantity);
app.post('/cart/remove/:itemId', CartController.removeItem);
app.post('/cart/clear', CartController.clearCart);

// Checkout y órdenes (protegido)
app.get('/checkout', checkAuth, CheckoutController.viewCheckout);
app.post('/process-payment', checkAuth, CheckoutController.processPayment);
app.get('/order-confirmation/:orderId', checkAuth, CheckoutController.viewOrderConfirmation);

// API JSON para productos y categorías
app.get('/api/products', async (req, res) => {
    try {
        const products = await ProductService.getAllProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.get('/api/categories', async (req, res) => {
    try {
        const categories = await CategoryService.getAllCategories();
        res.json(categories);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**********USUARIOS */
app.get('/users', UserController.index);
app.get('/users/create', UserController.create);
app.post('/users', upload.single('imagen'), UserController.store);
app.get('/users/:id', UserController.show);
app.get('/users/:id/edit', UserController.edit);
app.post('/users/:id', upload.single('imagen'), UserController.update);
app.post('/users/:id/delete', UserController.delete);
/*****************CATEGORIAS */
app.get('/categories', CategoryController.index);
app.get('/categories/create', CategoryController.create);
app.post('/categories', upload.single('image'), CategoryController.store);
app.get('/categories/:id', CategoryController.show);
app.get('/categories/:id/edit', CategoryController.edit);
app.post('/categories/:id', upload.single('image'), CategoryController.update);
app.post('/categories/:id/delete', CategoryController.delete);
/**********************PRODUCTS */
app.get('/products', ProductController.index);
app.get('/products/create', ProductController.create);
app.post('/products', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
]), ProductController.store);
app.get('/products/:id', ProductController.show);
app.get('/products/:id/edit', ProductController.edit);
app.post('/products/:id', upload.fields([
    { name: 'thumbnail', maxCount: 1 },
    { name: 'image1', maxCount: 1 },
    { name: 'image2', maxCount: 1 }
]), ProductController.update);
app.post('/products/:id/delete', ProductController.delete);


// Error handlers
app.use((req, res) => {
    res.status(404).render('error', { message: 'Página no encontrada' });
});

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('error', {
        message: 'Algo salió mal',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const PORT = process.env.PORT || 3100;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
