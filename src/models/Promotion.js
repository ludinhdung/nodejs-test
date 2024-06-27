const mongoose = require('mongoose');

const promotionSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    image: {
        type: String,
        required: true
    },
    label: {
        type: String,
        enum: ['New', 'Popular', null]
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    featured: {
        type: Boolean,
        default: false
    },
    description: {
        type: String,
        required: true
    }
});

module.exports = mongoose.model('promotion', promotionSchema);


