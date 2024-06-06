// server.js
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const authRouter = require('./authRoutes');
const taskRouter = require('./taskRoutes'); // Import the task routes

const app = express();
app.use(express.json()); // Allow parsing JSON in request bodies
app.use('/api', authRouter); // Use authRouter for all paths under '/api'
app.use('/api', taskRouter); // Use taskRouter for all paths under '/api/tasks'
app.use(express.static(path.join(__dirname, 'client/files'))); // Serve static files from the 'client/files' directory

// Connect to MongoDB
mongoose.connect('mongodb+srv://plukesch:mongokuhl3@taskwave.hbjnlqc.mongodb.net/?retryWrites=true&w=majority&appName=TaskWave')
  .then(() => {
    console.log('MongoDB connected');
  })
  .catch(err => {
    console.error('Database connection error:', err);
  });

// Route for the homepage
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/index.html'));
});

// Routes for login and registration
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/registration.html'));
});

// Server configuration
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
