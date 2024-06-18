const jwt = require('jsonwebtoken');
const secretKey = process.env.JWT_SECRET; // Load secret key from environment variables

function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) {

        return res.status(401).json({ message: 'No token provided' }); // Unauthorized
    }

    try {
        const decoded = jwt.verify(token, secretKey);
        req.user = decoded;
        next();
    } catch (ex) {
        return res.status(401).json({ message: 'No token provided' }); // Unauthorized
    }
}

module.exports = authenticateToken;
