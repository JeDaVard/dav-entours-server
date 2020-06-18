const { PubSub, withFilter } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language');
const redis = require('../redis');

const pubsub = new PubSub();

const User = require('../models/user')
const Tour = require('../models/tour')
const Review = require('../models/review')
const Conversation = require('../models/Conversation')
const Message = require('../models/Message')
const { catchAsyncResolver } = require('../utils/catchAsyncResolver');
const { authLogin, authSignUp } = require('../controllers/auth');

module.exports = {
    Query: {
        tours: async () => await Tour.find(),
        tour: async (_, { id }) => await Tour.findOne({ slug: id }),
        users: async () => {
            const cachedUsers = await redis.get('TOP_USERS');
            console.log(JSON.parse(cachedUsers))
            if (cachedUsers) return JSON.parse(cachedUsers);
            const users = await User.find().sort('-createdAt').limit(4)
            redis.set('TOP_USERS', JSON.stringify(users))
            return users
        },
        user: async (_, { id }) => await User.findOne({_id: id }),
        me: async (_, __, c ) => await User.findOne({_id: c.user._id})
    },
    MutationResponse: {
        __resolveType() {
            return null;
        }
    },
    Me: {
        tours: async parent => await Tour.find({author: parent._id }),
        reviews: async parent => {
            const tourIds = await Tour.find({author: parent._id})
            return await Review.find({tour: {$in: tourIds}})
        },
        saved: async (_, __, c ) => await Tour.find({_id: { $in: c.user.saved } }),
        conversations: async (_, __, c ) => {
            const tours = await Tour.find({$or: [{author: c.user._id}, { guides: {$in: c.user._id}}]})
            return await Conversation.find({$or: [{participants: {$in: c.user._id}}, {tour: {$in: tours.map(tour => tour._id)}}]})
        },
        conversation: async (_, { id }) => await Conversation.findOne({ _id: id }),
    },
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
    Review: {
        tour: async parent => await Tour.findById(parent.tour),
        author: async parent => await User.findById(parent.author)
    },
    User: {
        tours: async parent => await Tour.find({author: parent._id }),
        // reviews: async parent => await Review.find({tourAuthor: parent._id}),
        reviews: async parent => {
            const tourIds = await Tour.find({author: parent._id})
            return await Review.find({tour: {$in: tourIds}})
        },
    },
    Tour: {
        author: async parent => await User.findOne({_id: parent.author }),
        guides: async parent => await User.find({_id: { $in: parent.guides }}),
        participants: async parent => await User.find({_id: { $in: parent.participants }}),
        reviews: async parent => await Review.find({tour: { $in: parent._id }})
    },
    Mutation: {
        removeMessage: catchAsyncResolver(
            async (_, { id }, c) => await Message.findOneAndUpdate({_id: id, sender: c.user._id}, {text: '[Removed]'}, {new : true}),
            '200',
            'Successfully removed',
            'Error, failed to remove message',
            '400',
        ),
        sendMessage: catchAsyncResolver(
            async (_, { text, convId }, c) => {
                const message = await Message.create({sender: c.user._id, text, conversation: convId});
                await pubsub.publish(`CONVERSATION_${convId}`, { messageAdded: message })
                return message
            },
            '200',
            'Successfully sent',
            'Error, failed to send message',
            '400'),
        addTour: () => {
        },
        login: async (_, args, c) => await authLogin(args),
        signUp: async (_, args) => await authSignUp(args)
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
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            return value.getTime(); // value sent to the client
        },
        parseLiteral(ast) {
            if (ast.kind === Kind.INT) {
                return parseInt(ast.value, 10); // ast value is always in string format
            }
            return null;
        },
    }),
};