// server.js
require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const authRouter = require('./authRoutes');
const taskRouter = require('./taskRoutes');
const authenticateToken = require('./authMiddleware');

const app = express();
app.use(express.json()); // Allow parsing JSON in request bodies

const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const PORT = process.env.PORT || 4000;

// Swagger-Konfiguration
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'TaskWave API',
      version: '1.0.0',
      description: 'API for managing tasks within the TaskWave application',
      contact: {
        name: "Developer Support",
        url: "http://example.com",
        email: "support@example.com"
      }
    },
    servers: [{
      url: 'http://localhost:4000/api',
      description: 'Development server',
    }],
  },
  apis: ['./taskRoutes.js'], // Pfad zu den Route-Dateien
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// Use routers
app.use('/api/auth', authRouter); // Assuming you have auth routes
app.use('/api/tasks', taskRouter); // Use taskRouter for /api/tasks routes


// Serve static files from the 'client/files' directory
app.use(express.static(path.join(__dirname, 'client/files'))); 

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Protect the main page with JWT authentication
app.get('/', authenticateToken, (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/registration.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});


