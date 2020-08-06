const { simpleAsyncPaginated, asyncPaginated } = require("../utils/catchAsyncResolver");
const { searchTours, findRecommendTours } = require("../services/search/tourSearch");
const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language');

const { User, Tour, Review, Start } = require('../models/')
const { authLogin, authSignUp } = require('../controllers/auth');

const { s3 } = require('../services/s3')

module.exports = {
    Query: {
        users: async () => await User.find().sort('-createdAt').limit(4),
        user: async (_, { id }) => await User.findOne({_id: id}),
        recommended: async () => await findRecommendTours(),
        search: simpleAsyncPaginated(async (_, { initInput }) => await searchTours(initInput))
    },
    MutationResponse: {
        // this is because of a strange requirement of graphql apollo
        __resolveType() {
            return null;
        }
    },
    Start: {
        tour: async parent => await Tour.findById(parent.tour),
        participants: async parent => await User.find({_id: {$in: parent.participants}}),
        staff: async parent => await User.find({_id: {$in: parent.staff}})
    },
    Review: {
        tour: async parent => await Tour.findById(parent.tour),
        author: async parent => await User.findById(parent.author)
    },
    User: {
        tours: async parent => await Tour.find({author: parent._id }),
        reviews: asyncPaginated(Review,
                parent => Review.find({tourAuthor: parent._id}).sort('-createdAt')),
        ownReviews: asyncPaginated(Review,
            parent => Review.find({author: parent._id}).sort('-createdAt')),
    },
    Mutation: {
        inviteUser: async (_, { email }) => await User.findOne({email}),
        login: async (_, args, c) => await authLogin(args),
        signUp: async (_, args) => await authSignUp(args),
        uploadImage: async (_, { id, fileName, contentType, genre }, c) => {
            const key = `users/${c.user._id}/${genre}/${id}/${fileName}`

            const url = await s3.getSignedUrl('putObject', {
                Bucket: process.env.AWS_ENTOURS_BUCKET,
                ContentType: contentType,
                Key: key
            })

            return {
                url,
                key
            }
        }
    },
    Subscription: {
        ////
    },
    Date: new GraphQLScalarType({
        name: 'Date',
        description: 'Date custom scalar type',
        parseValue(value) {
            return new Date(value); // value from the client
        },
        serialize(value) {
            // I added the single line below, because when I connected Redis, the data from cache
            // caused an error, because "value" was a string, and getTime is not a function
            if (typeof value === 'string') return new Date(value).getTime();
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