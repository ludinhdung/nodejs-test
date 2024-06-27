const express = require('express')
const router = express.Router()
const promotion = require('../models/Promotion')
const jwt = require('jsonwebtoken')
const dotenv = require('dotenv');
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

router.use(authMiddleware)

router
    .get('/', authorize(['admin']), (req, res) => {
        promotion.find()
            .then(promotions => {
                res.json(promotions)
            })
            .catch(err => {
                res.status(500).send('Server error')
                console.error(err)
            })
    })
    .post('/', authorize(['admin']), (req, res) => {
        promotion.create(req.body)
            .then(promotion => {
                res.json(promotion)
            })
            .catch(err => {
                res.status(500).send('Server error')
                console.error(err)
            })
    })
    .delete('/:promotionId', authorize(['admin']), (req, res) => {
        promotion.findByIdAndDelete(req.params.promotionId)
            .then(promotion => {
                if (!promotion) {
                    return res.status(404).send('Promotion not found')
                }
                res.send('Promotion deleted successfully')
            })
            .catch(err => {
                res.status(500).send('Server error')
                console.error(err)
            })
    })

module.exports = router;