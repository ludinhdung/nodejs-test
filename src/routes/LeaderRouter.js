const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Leader = require('../models/Leader');
dotenv.config();

function authorize(requiredRole) {
    return (req, res, next) => {
        if (!req.user || !req.user.role || !requiredRole.includes(req.user.role)) {
            return res.status(403).json({ error: 'Forbidden - Insufficient permissions' });
        }
        next();
    };
}

function authMiddleware(req, res, next) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key');
        req.user = decoded;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({ error: 'Unauthorized - Invalid token' });
        }
        res.status(500).json({ error: 'Internal server error' });
    }
}

router.use(authMiddleware);

router
    .get('/', authorize(['admin']), async (req, res) => {
        try {
            const users = await Leader.find();
            res.json(users);
        } catch (error) {
            console.error("Error getting users:", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    })
    .post('/', authorize(['admin']), async (req, res) => {
        try {
            const leader = await Leader.create(req.body);
            res.json(leader);
        } catch (error) {
            console.error("Error creating leader:", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    }).delete('/:leaderId', authorize(['admin']), async (req, res) => {
        try {
            const leader = await Leader.findByIdAndDelete(req.params.leaderId);
            if (!leader) {
                return res.status(404).json({ error: 'Leader not found' });
            }
            res.send('Leader deleted');
        } catch (error) {
            console.error("Error deleting leader:", error);
            res.status(500).json({ error: 'Internal server error' });
        }
    });

module.exports = router;