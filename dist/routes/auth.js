"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const router = express_1.default.Router();
router.post('/register', async (req, res) => {
    try {
        const { email, password, firstName, lastName } = req.body;
        console.log('Registration attempt for:', email);
        const existingUser = await User_1.default.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }
        const newUser = await User_1.default.create({ email, password, firstName, lastName });
        //Generate JWT token 
        const token = jsonwebtoken_1.default.sign({ userId: newUser.id }, process.env.JWT_SECRET || 'dlfndkjhe434343849ef9e84', { expiresIn: '10h' });
        return res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser.id,
                email: newUser.email,
                firstName: newUser.firstName,
                lastName: newUser.lastName,
            },
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Registration error', error: error });
    }
});
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User_1.default.findOne({ where: { email } });
        if (!user || !user.validPassword(password)) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }
        const token = jsonwebtoken_1.default.sign({ userId: user.id }, process.env.JWT_SECRET || 'dlfndkjhe434343849ef9e84', { expiresIn: '10h' });
        res.json({
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                firstName: user.firstName,
                lastName: user.lastName,
            }
        });
    }
    catch (error) {
        return res.status(500).json({ message: 'Error logging in', error });
    }
});
exports.default = router;
