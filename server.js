/*const express = require('express');
const app = express();
const path = require('path');

// Stellt sicher, dass der Pfad zum Ordner korrekt ist
app.use(express.static(path.join(__dirname, 'client', 'files')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}/`);
});*/

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const authRouter = require('./authRoutes'); // Importiert die Authentifizierungs-Routen

const app = express();
app.use(express.json()); // Erlaubt das Parsen von JSON im Body von Requests
app.use('/api', authRouter); // Nutzt authRouter für alle Pfade unter '/api'
app.use(express.static(path.join(__dirname, 'client/files'))); // Statische Dateien aus dem 'public'-Ordner bedienen

// Verbindung zu MongoDB
mongoose.connect('mongodb+srv://plukesch:mongokuhl3@taskwave.hbjnlqc.mongodb.net/?retryWrites=true&w=majority&appName=TaskWave').then(() => {
    console.log('MongoDB connected');
}).catch(err => {
    console.error('Database connection error:', err);
});

// Basisroute für die Startseite
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/index.html'));
});

// Spezifische Routen für Login und Registrierung
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/login.html'));
});

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'client/files/registration.html'));
});

// Server-Konfiguration
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
