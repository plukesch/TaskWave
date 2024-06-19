const express = require('express');
const bcrypt = require('bcryptjs');
const User = require('./models/user');
const { generateToken } = require('./auth');
const router = express.Router();

// Register User
router.post('/register', async (req, res) => {
    const { email, username, password } = req.body;
    if (!validateEmail(email) || !validateUsername(username) || !validatePassword(password)) {
        return res.status(400).json({ message: "Invalid input for registration" });
    }

    try {
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(409).json({ message: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new User({ email, username, password: hashedPassword });
        await newUser.save();

        const token = generateToken(newUser);
        res.status(201).json({ message: "User created successfully", token });
    } catch (error) {
        res.status(500).json({ message: "Error registering new user" });
    }
});

// Login User
router.post('/login', async (req, res) => {
    const { username, password } = req.body;
    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const token = generateToken(user);
        console.log(token)
        res.json({ message: "Login successful", token });
    } catch (error) {
        res.status(500).json({ message: "Error logging in" });
    }
});

function validateEmail(email) {
    return /^[a-zA-Z0-9]{1,20}@[a-z]{1,8}\.(net|at|org|com)$/.test(email);
}

function validateUsername(username) {
    return /^[a-zA-Z]{1,10}$/.test(username);
}

function validatePassword(password) {
    return /^(?=.*[a-z])(?=.*\d)(?=.*\W).{8,}$/.test(password);
}

module.exports = router;

