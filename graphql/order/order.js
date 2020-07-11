const { createTourIntent } = require("../../services/paymentIntention");


module.exports = {
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