const Dish = require('../models/Dish');
const User = require('../models/User');

async function getDishById(req, res) {
    const { dishId } = req.params;

    const dish = await Dish.findById(dishId);
    if (!dish) {
        return res.status(404).send('Dish not found');
    }

    res.json(dish);
}


async function getDishComments(req, res) {
    const { dishId } = req.params;
    const dish = await Dish.findById(dishId);

    if (!dish) {
        return res.status(404).send('Dish not found');
    }

    res.json(dish.comments);
}

async function createDish(req, res) {

    const { name, image, category, label, price, featured, description, comments } = req.body;
    const dish = new Dish({
        name,
        image,
        category,
        label,
        price,
        featured,
        description,
        comments
    });

    await dish.save();
    res.json(dish);
}

async function getAllDishes(req, res) {
    const dishes = await Dish.find();
    res.json(dishes);
}

async function patchDish(req, res) {
    const { dishId } = req.params;
    const dish = await Dish.findById(dishId);

    if (!dish) {
        return res.status(404).send('Dish not found');
    }

    const { name, image, category, label, price, featured, description, comments } = req.body;

    dish.name = name;
    dish.image = image;
    dish.category = category;
    dish.label = label;
    dish.price = price;
    dish.featured = featured;
    dish.description = description;
    dish.comments = comments;

    await dish.save();
    res.json(dish);
}

async function deleteDish(req, res) {
    const { dishId } = req.params;

    await Dish.findByIdAndDelete(dishId);

    res.send('Dish deleted');
}

async function commentDish(req, res) {
    try {
        const dishId = req.params.dishId;
        const { rating, comment } = req.body;

        const dish = await Dish.findById(dishId);

        if (!dish) {
            return res.status(404).json({ error: 'Dish not found' });
        }

        const user = await User.findById(req.user.userId);

        const newComment = {
            rating: rating,
            comment: comment,
            author: user.username,
            date: new Date()
        };

        dish.comments.push(newComment);
        const updatedDish = await dish.save();

        res.status(201).json({ message: 'Comment added successfully', dish: updatedDish });
    } catch (error) {
        console.error("Error adding comment:", error);
        res.status(500).json({ error: 'Internal server error' });
    }
}

async function updateComment(req, res) {
    const { dishId, commentId } = req.params;
    const { rating, comment } = req.body;

    const dish = await Dish.findById(dishId);


    if (!dish) {
        return res.status(404).send('Dish not found');
    }

    const commentToUpdate = dish.comments.id(commentId);
    const user = await User.findById(req.user.userId);

    if (user.username !== commentToUpdate.author) {
        return res.status(403).send('Forbidden - Insufficient permissions');
    }

    if (!commentToUpdate) {
        return res.status(404).send('Comment not found');
    }

    commentToUpdate.rating = rating;
    commentToUpdate.comment = comment;

    await dish.save();
    res.send('Comment updated');
}


async function deleteComment(req, res) {
    const { dishId, commentId } = req.params;
    try {
        const dish = await Dish.findById(dishId);
        if (!dish) {
            return res.status(404).json({ error: 'Dish not found' });
        }


        const user = await User.findById(req.user.userId);
        const commentToUpdate = dish.comments.id(commentId);

        if (user.username !== commentToUpdate.author) {
            return res.status(403).send('Forbidden - Insufficient permissions');
        }

        const updatedDish = await Dish.findByIdAndUpdate(
            dishId,
            { $pull: { comments: { _id: commentId } } },
            { new: true }
        );

        if (!updatedDish) {
            return res.status(404).json({ error: "Dish not found" });
        }

        res.json({ message: 'Comment deleted successfully', dish: updatedDish });
    } catch (error) {
        res.status(500).json({ error: 'Internal server error' });
    }
}


module.exports = { getDishById, createDish, getAllDishes, deleteDish, commentDish, getDishComments, deleteComment, patchDish, updateComment };