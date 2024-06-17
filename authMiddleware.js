const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Load secret key from environment variables

function authenticateToken(req, res, next) {
    const token = req.headers['authorization'];
    if (!token) {
        return res.redirect('/register'); // Redirect to registration page if no token is provided
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (ex) {
        res.redirect('/register'); // Redirect to registration page if token is invalid
    }
}

module.exports = authenticateToken;
