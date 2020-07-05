const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
        required: [true, 'Order must be related to a tour']
    },
    start: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Start',
        required: [true, 'Order must be based on a starting date']
    },
    price: {
        type: Number,
        required: [true, 'Order must have a price']
    },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a buyer']
    }
}, {
    timestamps: true
})

const Order = mongoose.model('order', orderSchema)

module.exports = Order