const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
    // status: {
    //     type: String,
    //     enum: ['Confirmed', 'Failed', 'In progress'],
    //     default: 'In progress'
    // },
    buyer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Order must belong to a buyer']
    },
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
    amount: {
        type: Number,
        required: [true, 'Order must have a price']
    },
    end: {
        type: Date,
        required: [true, 'Order must have an end time']
    },
    ended: {
        type: Boolean,
        required: [true, 'Order must specify if its ended or not'],
        default: false
    },
    invited: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
})

// orderSchema.pre('save', async function() {
//     const start = await Start.findOne({_id: this.start})
// })

const Order = mongoose.model('Order', orderSchema);

module.exports = Order