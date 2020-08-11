const {changeAvatar} = require("../../services/account/profile");
const {findOrders} = require("../../services/order/orders");
const { catchAsyncResolver } = require("../../utils/catchAsyncResolver");
const { User, Tour, Conversation, Review, Start } = require('../../models')
const { authLogin, authSignUp } = require('../../services/auth/auth');
const { setCookies } = require('../../services/auth/cookies')

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
            const starts = await Start.find({$or: [{staff: {$in: c.user._id}}, { participants: {$in: c.user._id}}]})
            return await Conversation.find({start: {$in: starts.map(start => start._id)}})
        },
        orders: async (_, __, c) => await findOrders(c.user._id, false),
        pastOrders: async (_, __, c) => await findOrders(c.user._id, true),
        conversation: async (_, { id }) => await Conversation.findOne({ _id: id }),
    },
    Mutation: {
        login: catchAsyncResolver(
            async (_, args, c) => {
                const authData = await authLogin(args)
                setCookies(c.res, authData)
                return authData.user
            }
        ),
        updateProfile: catchAsyncResolver(
            async (_, args, c) => changeAvatar(c.user._id, args.photo)
        ),
        signUp: catchAsyncResolver(
            async (_, args, c) => {
                const authData = await authSignUp(args)
                setCookies(c.res, authData)
                return authData.user
            }
        ),
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