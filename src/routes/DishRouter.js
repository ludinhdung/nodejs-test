const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const {
    getDishById,
    createDish,
    getAllDishes,
    patchDish,
    deleteDish,
    commentDish,
    getDishComments,
    deleteComment,
    updateComment
} = require('../controllers/DishController');

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

router.get('/', getAllDishes);
router.get('/:dishId', getDishById);
router.get('/:dishId/comments', getDishComments);

router.use(authMiddleware);

router.post('/', authorize(['admin']), createDish);
router.put('/:dishId', authorize(['admin']), patchDish);
router.delete('/:dishId', authorize(['admin']), deleteDish);
router.post('/:dishId/comments', authorize(['user']), commentDish);
router.put('/:dishId/comments/:commentId', authorize(['user']), updateComment);
router.delete('/:dishId/comments/:commentId', authorize(['user']), deleteComment);

module.exports = router;
