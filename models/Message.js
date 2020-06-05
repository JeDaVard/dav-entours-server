const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation'
    },
    text: {
        type: String,
        required: [true, 'You did\'n wrote the text, please write something before send']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }
}, {
    timestamps: true
})

const Message = mongoose.model('message', messageSchema)

module.exports = Message