const {catchAsyncResolver} = require("../utils/catchAsyncResolver");
const { User, Tour, Review } = require('../models/')

module.exports = {
    Query: {
        tours: async () => {
            const tours = await Tour.find().sort('-createdAt').limit(4)
            return tours
        },
        tour: async (_, { id }) => await Tour.findOne({ slug: id }),
    },
    Tour: {
        author: async parent => await User.findOne({_id: parent.author }),
        guides: async parent => await User.find({_id: { $in: parent.guides }}),
        participants: async parent => await User.find({_id: { $in: parent.participants }}),
        reviews: async parent => await Review.find({tour: { $in: parent._id }})
    },
    Mutation: {
        makeATour: catchAsyncResolver(
            async (_, { name, difficulty, maxGroupSize }, c) => {
                const options = {
                    author: c.user._id,
                    name,
                    difficulty,
                    maxGroupSize,
                }
                const tour = await Tour.create(options)
                return tour
            },
            '200',
            'Successfully created',
            '400',
            'Error while creating a tour'
        ),
    }
};