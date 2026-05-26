require('dotenv').config(); // Carga variables desde el archivo .env si existe
const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/routes/authRoutes');
const sessionsRoutes = require('./src/routes/sessionsRoutes');
const categoriesRoutes = require('./src/routes/categoriesRoutes');
const suppliersRoutes = require('./src/routes/suppliersRoutes');
const productsRoutes = require('./src/routes/productsRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares globales necesarios
app.use(cors()); // Permite que tu React (puerto 5173) haga peticiones a este Node (puerto 5000)
app.use(express.json()); // Permite a express procesar cuerpos de mensajes en formato JSON

// Configurar Rutas base de Autenticación
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionsRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/suppliers', suppliersRoutes);
app.use('/api/products', productsRoutes);

// Ruta de prueba inicial para verificar que el servidor responda
app.get('/', (req, res) => {
    res.send('⚡ Servidor del Proyecto de Inventario Funcionando correctamente.');
});

app.listen(PORT, () => {
    console.log(`🚀 Servidor corriendo en el puerto http://localhost:${PORT}`);
    console.log(`🔑 Endpoints listos:\n - POST http://localhost:${PORT}/api/auth/register\n - POST http://localhost:${PORT}/api/auth/login`);
});