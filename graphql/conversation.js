const { PubSub, withFilter } = require('apollo-server-express');

const pubsub = new PubSub();

const { User, Tour, Message} = require('../models/')
const { catchAsyncResolver } = require('../utils/catchAsyncResolver');

module.exports = {
    Conversation: {
        messages: async (parent, { page, limit }) => {
            // console.log(parent)
            const messagesQuery = Message.find({conversation: parent._id}).sort('-createdAt')
            const options = {
                page: page || 1,
                limit: limit || 0
            };
            const messages = await Message.paginate(messagesQuery, options);
            return {
                hasMore: messages.hasNextPage,
                nextPage: messages.nextPage,
                total: messages.totalDocs,
                messages: messages.docs
            }
        },
        tour: async parent => await Tour.findOne({_id: parent.tour}),
        participants: async parent => await User.find({_id: { $in: parent.participants }}),
        guides: async parent => {
            const tour = await Tour.findOne({_id: parent.tour})
            const guides = [tour.author, ...tour.guides]
            return await User.find({ _id: { $in: guides }})
        },
        lastMessage: async parent => await Message.findOne({ conversation: parent._id }).sort('-createdAt').limit(1)
    },
    Message: {
        sender: async parent => await User.findOne({ _id: parent.sender })
    },
    Mutation: {
        removeMessage: catchAsyncResolver(
            async (_, { id }, c) => await Message.findOneAndUpdate({_id: id, sender: c.user._id}, {text: '[Removed]'}, {new : true}),
            '200',
            'Successfully removed',
            '400',
            'Error, failed to remove message',
        ),
        sendMessage: catchAsyncResolver(
            async (_, { text, convId }, c) => {
                const message = await Message.create({sender: c.user._id, text, conversation: convId});
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
        }
    },
};