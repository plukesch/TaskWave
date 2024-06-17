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

const PORT = process.env.PORT || 4000;

// Use routers
app.use('/api', authRouter);
app.use('/api/tasks', authenticateToken, taskRouter); // Protect task routes

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


