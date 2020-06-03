const mongoose = require('mongoose');

const conversationsSchema = new mongoose.Schema({
    messages: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'Message'
        }
    ],
    author: {
        type: mongoose.Schema.ObjectId,
        ref: 'User'
    },
    participants: [
        {
            type: mongoose.Schema.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
})

const Conversations = mongoose.model('conversations', conversationsSchema)

module.exports = Conversations