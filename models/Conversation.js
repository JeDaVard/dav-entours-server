const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    participants: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
})

const Conversation = mongoose.model('conversation', conversationSchema)

module.exports = Conversation