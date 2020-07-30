const { createTourIntent } = require("../../services/paymentIntention");
const { User, Tour, Start } = require('../../models')

module.exports = {
    Order: {
        tour: async ({ tour }) => await Tour.findOne({_id: tour}),
        start: async ({ start }) => await Start.findOne({_id: start}),
        buyer: async ({ buyer }) => await User.findOne({_id: buyer}),
        invited: async ({ invited }) => await User.find({_id: { $in: invited }}),
    },
    Mutation: {
        intentTourPayment: async (_, { tourOrderInput }, c) => {
            const {tourId, startId, firstMessage, invitedIds} = tourOrderInput
            return await createTourIntent({
                tourId,
                userId: c.user._id,
                startId,
                firstMessage,
                invitedIds
            })
        }
    }
}