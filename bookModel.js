const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    rating: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    comment: {
        type: String,
        required: true
    },
    author: {
        type: String,
        required: true
    }
});

const bookSchema = new mongoose.Schema({
    isbn: {
        type: String,
        required: true,
        unique: true
    },
    title: {
        type: String,
        required: true
    },
    subTitle: String,
    publish_date: {
        type: Date,
        required: true
    },
    publisher: String,
    pages: {
        type: Number,
        min: 0
    },
    price: {
        type: Number,
        min: 0
    },
    description: String,
    website: String,
    comments: [commentSchema],
    genre: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Genre'
    }
});

const genreSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    }
});

const Genre = mongoose.model('Genre', genreSchema);
const Book = mongoose.model('Book', bookSchema);

module.exports = { Book, Genre };
