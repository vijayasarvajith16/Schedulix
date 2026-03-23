const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Faculty = require('../models/Faculty');


const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};


router.post('/register', async (req, res, next) => {
    try {
        const { name, email, password, role } = req.body;

        
        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400);
            throw new Error('User already exists with this email');
        }

      
        const user = await User.create({ name, email, password, role: role || 'student' });

        res.status(201).json({
            success: true,
            message: 'User registered successfully',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        next(error);
    }
});


router.post('/login', async (req, res, next) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            res.status(400);
            throw new Error('Please provide email and password');
        }

   
        const user = await User.findOne({ email });
        if (!user || !(await user.matchPassword(password))) {
            res.status(401);
            throw new Error('Invalid email or password');
        }

       
        const faculty = await Faculty.findOne({ userId: user._id });

        res.status(200).json({
            success: true,
            message: 'Login successful',
            data: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                facultyId: faculty ? faculty._id : null,  
                token: generateToken(user._id),
            },
        });
    } catch (error) {
        next(error);
    }
});


const { protect } = require('../middleware/auth');
router.get('/me', protect, async (req, res) => {
    res.status(200).json({ success: true, data: req.user });
});

module.exports = router;
