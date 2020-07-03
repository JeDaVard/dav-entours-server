const {catchAsyncResolver} = require("../../utils/catchAsyncResolver");
const { User, Tour, Conversation, Review } = require('../../models')
const { authLogin, authSignUp, setCookies } = require('../../controllers/auth');


module.exports = {
    Query: {
        me: async (_, __, c ) => await User.findOne({_id: c.user._id})
    },
    Me: {
        tours: async (_, __, c ) => await Tour.find({author: c.user._id }),
        myTour: async (_, { slug }, c) => await Tour.findOne({ slug, author: c.user._id}),
        asGuide: async parent => await Tour.find({ guides: { $in: parent._id} }),
        draft: async (_, __, c) => await Tour.aggregate([{$match: { author: c.user._id, draft: true }}]),
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
    Mutation: {
        login: async (_, args, c) => {
            const authData = await authLogin(args)
            c.res.cookie('testCookieKey', 'TestcookieValue')
            setCookies(c.res, authData)
            return authData.user
        },
        signUp: async (_, args, c) => {
            const authData = await authSignUp(args)
            setCookies(c.res, authData)
            return authData.user
        },
        signOut: async (_, __, c) => {
            setCookies(c.res, null, true)
            return null
        },
        saveTour: async (_, { id }, c) => {
            const user = await User.findById(c.user._id);
            user.saved.push(id);
            await user.save();
            const tours = await Tour.find({_id: {$in: user.saved}})
            return tours;
        },
        removeSavedTour: async (_, { id }, c) => {
            const user = await User.findById(c.user._id);
            user.saved = user.saved.filter(tour => tour.toString() !== id);
            await user.save();
            return await Tour.find({_id: {$in: user.saved}});
        }
    },
};