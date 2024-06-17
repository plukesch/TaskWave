const jwt = require('jsonwebtoken');

const secretKey = process.env.JWT_SECRET; // Load secret key from environment variables

function generateToken(user) {
    const payload = { id: user._id, username: user.username };
    return jwt.sign(payload, secretKey, { expiresIn: '1h' });
}

function verifyToken(token) {
    return jwt.verify(token, secretKey);
}

module.exports = { generateToken, verifyToken };
