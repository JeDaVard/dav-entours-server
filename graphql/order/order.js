const { createTourIntent } = require("../../services/stripeIntention");


module.exports = {
    Mutation: {
        intentTourPayment: async (_, { tourOrderInput }, c) => {
            const {tourId, startId, firstMessage, invitedIds} = tourOrderInput
            await createTourIntent({
                tourId,
                startId,
                firstMessage,
                invitedIds
            })
        }
    }
}