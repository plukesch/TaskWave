const express = require('express');
const app = express();
const path = require('path');

// Stellt sicher, dass der Pfad zum Ordner korrekt ist
app.use(express.static(path.join(__dirname, 'client', 'files')));

const PORT = 3000;
app.listen(PORT, () => {
    console.log(`Server läuft auf http://localhost:${PORT}/`);
});
