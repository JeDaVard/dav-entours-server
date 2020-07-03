const {catchAsyncResolver} = require("../../utils/catchAsyncResolver");
const { User, Tour, Review } = require('../../models');
const { deleteObjects } = require('../../services/s3');


module.exports = {
    Query: {
        tours: async () => {
            const tours = await Tour.find().sort('-createdAt')
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
            }),
        tourHeading: catchAsyncResolver(
            async (_, { id, name, difficulty, maxGroupSize, hashtags, price }, c) => {
                const options = {
                    name,
                    difficulty,
                    maxGroupSize,
                    hashtags: hashtags.length ? hashtags.split(',') : [],
                    price
                }
                const tour = await Tour.findOneAndUpdate({ _id: id, author: c.user._id }, options, {new: true})
                return tour
            }),
        tourLocations: catchAsyncResolver(
            async (_, { id, locations }, c) => {
                const tour = await Tour.findOneAndUpdate({ _id: id, author: c.user._id }, { locations }, {new: true})
                return tour
            }),
        tourDetails: catchAsyncResolver(
            async (_, { id, description, summary }, c) => {
                const options = {
                    summary,
                    description
                }

                return await Tour.findOneAndUpdate({_id: id, author: c.user._id}, options, {new: true})
            }),
        tourGallery: catchAsyncResolver(
            async (_, { id, imageCover, images, removeImage }, c) => {
                const options = {
                    imageCover: imageCover || '',
                    images: images || []
                };

                if (removeImage) deleteObjects(removeImage)

                return await Tour.findOneAndUpdate({_id: id, author: c.user._id}, options, {new: true})
            }),
    }
};

