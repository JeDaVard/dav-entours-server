const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    text: {
        type: String,
        required: [true, 'You did\'n wrote the text, please write something before send']
    },
    sender: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Message = mongoose.model('message', messageSchema)

module.exports = Message