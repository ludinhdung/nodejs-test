const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const dotenv = require('dotenv');
const Favorite = require('../models/Favorite');
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
    .get("/", authorize(['user']), async (req, res) => {
        const favorites = await Favorite.findOne({ user: req.user.userId })
            .populate('user')
            .populate('dishes');

        if (favorites) {
            res.statusCode = 200;
            res.json(favorites);
        } else {
            res.statusCode = 404;
            res.json({ message: "Favorites not found" });
        }
    })
    .post("/", authorize(['user']), async (req, res, next) => {
        try {
            const dishIds = req.body.map(dish => dish._id);
            let favorites = await Favorite.findOne({ user: req.user.userId });
            let newDishIds = [];

            if (!favorites) {
                newDishIds = dishIds;
            } else {
                newDishIds = dishIds.filter(dishId => !favorites.dishes.includes(dishId));

                if (newDishIds.length > 0) {
                    await Favorite.findByIdAndUpdate(favorites._id, { $addToSet: { dishes: { $each: newDishIds } } });
                }
            }

            favorites = newDishIds.length > 0 ? await Favorite.create({ user: req.user._id, dishes: newDishIds }) : await Favorite.findOne({ user: req.user.userId });

            res.statusCode = 200;
            res.setHeader('Content-Type', 'application/json');
            res.json(favorites);
        } catch (err) {
            next(err);
        }
    })
    .delete("/", authorize(['user']), async (req, res) => {
        await Favorite.deleteOne({ user: req.user.userId });
        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'All favorites deleted' });
    })
    .post("/:dishId", authorize(['user']), async (req, res) => {
        const dishId = req.params.dishId;
        let favorites = await Favorite.findOne({ user: req.user.userId });

        if (!favorites) {
            favorites = await Favorite.create({ user: req.user.userId, dishes: [dishId] });
        } else {
            if (favorites.dishes.includes(dishId)) {
                return res.status(400).json({ message: "Dish already exists in favorites." });
            } else {
                favorites.dishes.push(dishId);
                await favorites.save();
            }
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json(favorites);
    })
    .delete("/:dishId", authorize(['user']), async (req, res) => {
        const dishId = req.params.dishId;
        const favorites = await Favorite.findOneAndUpdate(
            { user: req.user.userId, dishes: dishId },
            { $pull: { dishes: dishId } },
            { new: true }
        );

        if (!favorites) {
            return res.status(404).json({ message: "Dish not found in favorites." });
        }

        res.statusCode = 200;
        res.setHeader('Content-Type', 'application/json');
        res.json({ success: true, status: 'Dish removed from favorites' });
    });

module.exports = router;