const {manageStart} = require("../../services/start/manageStart");
const {asyncPaginated} = require("../../utils/catchAsyncResolver");
const {catchAsyncResolver} = require("../../utils/catchAsyncResolver");
const { User, Tour, Review, Start } = require('../../models');
const { deleteObjects } = require('../../services/s3');


module.exports = {
    Query: {
        tours: async () => {
            const tours = await Tour.find().sort('-createdAt').limit(8)
            return tours
        },
        tour: async (_, { id }) => await Tour.findOne({ slug: id }),
    },
    Tour: {
        author: async parent => await User.findOne({_id: parent.author }),
        guides: async parent => await User.find({_id: { $in: parent.guides }}),
        // reviews: async parent => await Review.find({tour: { $in: parent._id }}),
        reviews: asyncPaginated(Review,
                parent => Review.find({tour: { $in: parent._id }})),
        starts: async parent => await Start.find({tour: { $in: parent._id }})
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
                const tour = await Tour.findOne({ _id: id, author: c.user._id });
                tour.locations = locations;
                await tour.save();
                return tour
            }),
        tourDetails: catchAsyncResolver(
            async (_, { id, description, summary, firstMessage, guides }, c) => {
                const options = {
                    firstMessage,
                    summary,
                    description,
                    guides
                }

                return await Tour.findOneAndUpdate({_id: id, author: c.user._id}, options, {new: true})
            }),
        manageStart: catchAsyncResolver(
            async (_, { id, date, startId }, c) => {
                await Tour.findOne({_id: id, author: c.user._id});
                await manageStart(date, startId, id);

                return await Tour.findOne({_id: id})
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

