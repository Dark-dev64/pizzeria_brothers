// server.js
const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
require('dotenv').config();

// Importar configuración de base de datos
const { testConnection } = require('./config/database');

// Importar rutas
const authRoutes = require('./src/routes/authRoutes');
const apiRoutes = require('./src/routes/apiRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(helmet());
app.use(compression());
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Archivos estáticos
app.use(express.static(path.join(__dirname, 'public')));

// Rutas de la API
app.use('/api/auth', authRoutes);
app.use('/api', apiRoutes);

// Rutas de vistas (mantener tus vistas existentes)
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'src/views/register.html'));
});

// Ruta por defecto
app.get('/', (req, res) => {
  res.redirect('/login');
});

// Ruta de salud de la API
app.get('/api/health', async (req, res) => {
  const dbStatus = await testConnection();
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    database: dbStatus ? 'Connected' : 'Disconnected',
    environment: process.env.NODE_ENV || 'development'
  });
});

// Manejo de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({
    success: false,
    message: 'Error interno del servidor'
  });
});

// Ruta 404 para API
app.use('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint de API no encontrado'
  });
});

// Ruta 404 para vistas
app.use('*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'src/views/404.html'));
});

// Inicializar servidor
async function startServer() {
  try {
    // Probar conexión a la base de datos
    await testConnection();

    app.listen(PORT, () => {
      console.log(`🍕 Servidor Pizza Brothers ejecutándose en http://localhost:${PORT}`);
      console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
      console.log(`🔐 Login: http://localhost:${PORT}/login`);
      console.log(`📝 Registro: http://localhost:${PORT}/register`);
      console.log(`🔗 API Auth: http://localhost:${PORT}/api/auth`);
    });
  } catch (error) {
    console.error('❌ Error iniciando servidor:', error);
    process.exit(1);
  }
}

startServer();