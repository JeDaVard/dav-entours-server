const {asyncPaginated} = require("../../utils/catchAsyncResolver");
const {deleteObjects} = require("../../loaders/s3");
const { pubsub } = require('../pubsub');

const { User, Tour, Message, Start} = require('../../models')
const { catchAsyncResolver } = require('../../utils/catchAsyncResolver');


module.exports = {
    Conversation: {
        messages: asyncPaginated( Message,
            (parent) => Message.find({conversation: parent._id}).sort('-createdAt')),
        start: async parent => await Start.findOne({_id: parent.start}),
        tour: async parent => await Tour.findOne({_id: parent.tour}),
        lastMessage: async parent => await Message.findOne({ conversation: parent._id }).sort('-createdAt').limit(1)
    },
    Message: {
        sender: async parent => await User.findOne({ _id: parent.sender })
    },
    Mutation: {
        removeMessage: catchAsyncResolver(
            async (_, { id, key }, c) => {
                if (key) deleteObjects(key);

                return await Message.findOneAndUpdate({_id: id, sender: c.user._id}, {text: '[Removed]'}, {new : true})
            },
            '200',
            'Successfully removed',
            '400',
            'Error, failed to remove message',
        ),
        sendMessage: catchAsyncResolver(
            async (_, { text, convId, isImage }, c) => {
                const wasImage = text.endsWith('.jpg')
                    || text.endsWith('.jpeg')
                    || text.endsWith('.gif')
                    || text.endsWith('.png') && !text.match(/\s+/g);

                const asImage = wasImage || isImage

                const message = await Message.create({
                    sender: c.user._id, text, conversation: convId, isImage: asImage || false});
                await pubsub.publish(`CONVERSATION_${convId}`, { messageAdded: message })
                return message
            },
            '200',
            'Successfully sent',
            '400',
            'Error, failed to send message',
        ),
    },
    Subscription: {
        // messageAdded: {
        //     subscribe: withFilter(
        //         () => pubsub.asyncIterator('MESSAGE_ADDED'),
        //         (payload, variables) => {
        //          return payload.messageAdded.conversation.toString() === variables.convId;
        //             }
        //         )
        // }
        // the example above shows how we can filter a message by comparing conversation ids
        // it is helpful as an instrument, the withFilter, but not a good idea for a conversation
        // separation (fake channeling), so we implement real channeling below
        messageAdded: {
            subscribe: (_, { convId }, c, info) => {
                return pubsub.asyncIterator(`CONVERSATION_${convId}`)
            }
        },
        // newConversation: {
        //     subscribe: (_, { convId }, c, info) => {
        //         return pubsub.asyncIterator(`CONVERSATION_${convId}`)
        //     }
        // }
    },
};