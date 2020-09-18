const { Order, Start, Conversation, Message} = require("../../models");
const { pubsub } = require('../../graphql/pubsub');

async function createOrder(amount, { tour, buyer, start, invited, firstMessage }) {
    const tourStart = await Start.findOne({ _id: start });

    const options = {
        tour,
        buyer,
        start,
        end: tourStart.end,
        amount: amount / 100,
        invited: invited ? invited.split(',') : []
    };
    await Order.create(options);

    tourStart.participants = [...tourStart.participants, buyer, ...options.invited];
    await tourStart.save();

    let conversation = await Conversation.findOne({start});


    // This is because of devdata import err, but the error lies at start models(pre('save')), so now it's fixed.
    // I did a mistake
    // and set the the tour id to conv "start", the statement
    // below will be removed, if we reImport dev data for starts collection to reCreate conv.s
    if (!conversation) {
        conversation = await Conversation.findOne({start: tour});
    }

    const message = await Message.create({
        sender: buyer,
        conversation: conversation._id,
        text: firstMessage,
        isImage: false
    });

    await pubsub.publish(`CONVERSATION_${conversation._id}`, { messageAdded: message })
}

module.exports = {
    createOrder
}