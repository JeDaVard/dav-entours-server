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
                return Tour.create(options);
            },
            '200',
            'Successfully created',
            '400',
            'Error while creating a tour'
        ),
        tourHeading: catchAsyncResolver(
            async (_, { id, name, difficulty, maxGroupSize, hashtags }, c) => {
                const options = {
                    name,
                    difficulty,
                    maxGroupSize,
                    hashtags: hashtags.length ? hashtags.split(',') : []
                }
                const tour = await Tour.findOneAndUpdate({ _id: id, author: c.user._id }, options)
                console.log(tour)
                return tour
            },
            '200',
            'Successfully saved',
            '400',
            'Error while creating a tour'
        ),
    }
};