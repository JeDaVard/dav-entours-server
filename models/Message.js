const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const messageSchema = new mongoose.Schema({
    conversation: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Conversation',
        required: [true, 'Message have to be related to a conversation']
    },
    text: {
        type: String,
        required: [true, 'You did\'n wrote the text, please write something before send']
    },
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: [true, 'Message must have a sender']
    }
}, {
    timestamps: true
})

messageSchema.plugin(mongoosePaginate)

const Message = mongoose.model('message', messageSchema)

module.exports = Message