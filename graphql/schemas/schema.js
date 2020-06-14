const { gql, PubSub, withFilter } = require('apollo-server-express');
const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language');

const pubsub = new PubSub();

const AppError = require('../../utils/appError')
const User = require('../../models/user')
const Tour = require('../../models/tour')
const Review = require('../../models/review')
const Conversation = require('../../models/Conversation')
const Message = require('../../models/Message')
const { authLogin, authSignUp } = require("../../controllers/auth");


const typeDefs = gql`
    scalar Date
    enum Role {
        USER
        GUIDE
        ADMIN
    }
    type Tour {
        _id: String!
        createdAt: Date
        updatedAt: Date
        name: String!
        author: User
        guides: [User]
        participants: [User]
		reviews: [Review]
        slug: ID!
        hashtags: [String]
        summary: String
        description: String
		imageCover: String
        images: [String]
        thumbs: [String]
        thumbCover: String
        duration: Int
		maxGroupSize: Int
		difficulty: String
        price: Int
		priceDiscount: Int
		ratingsAverage: String
		ratingsQuantity: Int
		startDates: [String]
		startLocation: Location
        locations: [Location]
	}
	type Location {
		_id: ID!
        type: String
		coordinates: [Float]
		address: String
		description: String
        day: Int
	}
    type Review {
        _id: ID!
        review: String!
        rating: Int!
		createdAt: Date
        tour: Tour
		tourAuthor: User
		author: User
    }
    type User {
        _id: ID!
        name: String!
        email: String!
        password: String
        photo: String
        createdAt: Date
        speaks: [String]
        role(role: Role): String
        tours: [Tour]
		reviews: [Review]
        conversations: [Conversation]
    }
    type Conversation {
        _id: ID!
        createdAt: Date
        messages: [Message]
        tour: Tour
        guides: [User]
        participants: [User]
        lastMessage: Message
    }
    type Message {
        _id: ID!
        text: String!
        createdAt: Date
        sender: User!
        conversation: Conversation!
    }
    type GetDataResponse {
        success: Boolean,
        message: String,
        data: String
    }
    input LoginInput {
        email: String!
        password: String!
    }
    input SignUpInput {
        email: String!
        Password: String!
        name: String!
    }
    
    type AuthData {
        token: String!
        expires: String!
        user: User
    }
	type Query {
		users: [User]
		user(id: ID!): User
		#        me: User
		tours: [Tour]
		tour(id: ID!): Tour
		messages(id: ID! page: Int): [Message]
		conversations: [Conversation]
		conversation(id: ID!): Conversation
	}
    type Mutation {
        sendMessage(convId: ID!, text: String!): Message
        removeMessage(id: ID!): Message
        login(email: String!, password: String!): AuthData
		signUp(email: String!, password: String!, name: String!): AuthData
        addTour: Tour 
    }
    type Subscription {
        messageAdded(convId: ID!): Message
    }
    schema {
        query: Query
        mutation: Mutation
        subscription: Subscription
    }
`;

const resolvers = {
    Query: {
        tours: async () => await Tour.find(),
        tour: async (_, { id }) => await Tour.findOne({ slug: id }),
        users: async () => await User.find(),
        user: async (_, { id }) => await User.findOne({_id: id }),
        conversations: async (_, __, c) => {
            const user = await c.user;
            const { _id } = user
            const tours = await Tour.find({$or: [{author: _id}, { guides: {$in: _id}}]})
            return await Conversation.find({$or: [{participants: {$in: _id}}, {tour: {$in: tours.map(tour => tour._id)}}]})
        },
        conversation: async (_, { id }) => await Conversation.findOne({ _id: id }),
        messages: async (_, { id, page, limit }) => {
            const p = page || 1;
            const l = limit || 2;
            let s = (p - 1) * l

            const messagesQuery = Message.find({conversation: id}).sort('-createdAt')
            const messages = await messagesQuery.skip(s).limit(l)
            return messages
        }
    },
    Conversation: {
        messages: async parent => await Message.find({conversation: parent._id}),
        tour: async parent => await Tour.findOne({_id: parent.tour}),
        participants: async parent => await User.find({_id: { $in: parent.participants }}),
        guides: async parent => {
            const tour = await Tour.findOne({_id: parent.tour})
            const guides = [tour.author, ...tour.guides]
            return await User.find({ _id: { $in: guides }})
        },
        lastMessage: async parent => {
            const messages = await Message.find({ conversation: parent._id })
            return messages[messages.length-1]
        }
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
        removeMessage: async (_, { id }, c) =>  await Message.findOneAndUpdate({_id: id, sender: c.user._id}, {text: '[Removed]'}, {new : true}),
        sendMessage: async (_, { text, convId }, c) => {
            const message = await Message.create({sender: c.user._id, text, conversation: convId});
            await pubsub.publish('MESSAGE_ADDED', { messageAdded: message })
            return message
        },
        addTour: () => {
        },
        login: async (_, args, c) => await authLogin(args),
        signUp: async (_, args) => await authSignUp(args)
    },
    Subscription: {
        messageAdded: {
            subscribe: withFilter(
                () => pubsub.asyncIterator('MESSAGE_ADDED'),
                (payload, variables) => {
                 return payload.messageAdded.conversation.toString() === variables.convId;
                    }
                )
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


module.exports = {
    typeDefs,
    resolvers
}