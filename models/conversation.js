const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
    tour: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tour',
    },
    start: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Start'
    },
    read: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
}, {
    timestamps: true
})

// conversationSchema.pre('/find', function () {
//     this.populate('start tour')
// })

const Conversation = mongoose.model('Conversation', conversationSchema)

module.exports = Conversation