const { GraphQLScalarType } = require('graphql')
const { Kind } = require('graphql/language');

const { User, Tour, Review } = require('../models/')
const { authLogin, authSignUp } = require('../controllers/auth');

module.exports = {
    Query: {
        users: async () => {
            const users = await User.find().sort('-createdAt').limit(4)
            return users
        },
        user: async (_, { id }) => {
            const user = await User.findOne({_id: id })
            return user
        },
    },
    MutationResponse: {
        // this is because of a strange requirement of graphql apollo
        __resolveType() {
            return null;
        }
    },
    Review: {
        tour: async parent => {
            const tours = await Tour.findById(parent.tour)
            return tours
},
        author: async parent => {
            const author = await User.findById(parent.author)
            return author
        }
    },
    User: {
        tours: async parent => {
            const tours = await Tour.find({author: parent._id })
            return tours
        },
        // reviews: async parent => await Review.find({tourAuthor: parent._id}),
        reviews: async parent => {
            const tourIds = await Tour.find({author: parent._id})
            const reviews = await Review.find({tour: {$in: tourIds}})
            return reviews
        },
    },
    Mutation: {
        addTour: () => {
        },
        login: async (_, args, c) => await authLogin(args),
        signUp: async (_, args) => await authSignUp(args)
    },
    Subscription: {
        //
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