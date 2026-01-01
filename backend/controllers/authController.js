import bcryptjs from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { config } from '../config/config.js';

const prisma = new PrismaClient();

// Helper function to validate email
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};

// Helper function to validate phone
const isValidPhone = (phone) => {
    const phoneRegex = /^[0-9]{10}$/;
    return phoneRegex.test(phone.replace(/\D/g, ''));
};

// Generate JWT Token
const generateToken = (user) => {
    return jwt.sign(
        {
            id: user.id,
            email: user.email,
            role: user.role,
        },
        config.jwtSecret,
        { expiresIn: config.jwtExpire }
    );
};

// SIGNUP Controller
export const signup = async (req, res) => {
    try {
        // Accept multiple naming conventions from the frontend
        const {
            name,
            firstName,
            lastName,
            email,
            phone,
            password,
            passwordConfirm,
            confirmPassword,
            role,
            address,
            city,
            pincode,
            agreeTerms,
            termsAccept,
        } = req.body;

        const fullName = name || `${firstName || ''} ${lastName || ''}`.trim();
        const passwordCheck = passwordConfirm || confirmPassword;
        const termsAccepted = agreeTerms ?? termsAccept ?? false;
        const mergedAddress = [address, city, pincode].filter(Boolean).join(' ').trim() || null;

        console.log('Signup request data:', {
            fullName,
            email,
            phone,
            password: password ? '***' : 'missing',
            passwordCheck: passwordCheck ? '***' : 'missing',
            termsAccepted,
        });

        // Validation
        if (!fullName || !email || !phone || !password || !passwordCheck) {
            const missing = [];
            if (!fullName) missing.push('name');
            if (!email) missing.push('email');
            if (!phone) missing.push('phone');
            if (!password) missing.push('password');
            if (!passwordCheck) missing.push('confirmPassword');

            console.error('Missing fields:', missing);
            return res.status(400).json({
                success: false,
                message: `Missing required fields: ${missing.join(', ')}`,
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
        }

        if (!isValidPhone(phone)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid 10-digit phone number',
            });
        }

        if (password !== passwordCheck) {
            return res.status(400).json({
                success: false,
                message: 'Passwords do not match',
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long',
            });
        }

        if (!termsAccepted) {
            return res.status(400).json({
                success: false,
                message: 'You must agree to terms and conditions',
            });
        }

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered',
            });
        }

        // Hash password
        const hashedPassword = await bcryptjs.hash(password, 10);

        // Create user
        const newUser = await prisma.user.create({
            data: {
                name: fullName,
                email,
                phone,
                password: hashedPassword,
                role: role || 'USER',
                address: mergedAddress,
            },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
            },
        });

        // Generate token
        const token = generateToken(newUser);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            token,
            user: newUser,
        });
    } catch (error) {
        console.error('Signup error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during signup',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// LOGIN Controller
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Please provide email and password',
            });
        }

        if (!isValidEmail(email)) {
            return res.status(400).json({
                success: false,
                message: 'Please provide a valid email address',
            });
        }

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Compare passwords
        const isPasswordValid = await bcryptjs.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password',
            });
        }

        // Generate token
        const token = generateToken(user);

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
            },
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during login',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined,
        });
    }
};

// VERIFY TOKEN Controller
export const verify = async (req, res) => {
    try {
        const { id } = req.user; // From JWT middleware

        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                role: true,
                phone: true,
            },
        });

        if (!user) {
            return res.status(404).json({
                success: false,
                message: 'User not found',
            });
        }

        return res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        console.error('Verify error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error verifying token',
        });
    }
};

// LOGOUT Controller
export const logout = async (req, res) => {
    try {
        // Since JWT is stateless, logout just clears client-side token
        // In production, you might want to implement token blacklist
        return res.status(200).json({
            success: true,
            message: 'Logged out successfully',
        });
    } catch (error) {
        console.error('Logout error:', error);
        return res.status(500).json({
            success: false,
            message: 'Error during logout',
        });
    }
};
